const getContext = require('./getContext');
const mergeContexts = require('./mergeContexts');
const deriveVersion = require('./helpers/deriveVersion');

const KEYWORD_REGEX = /^@(context|id|value|language|type|container|list|set|reverse|index|base|vocab|graph)$/;

const getFullyQualifiedProperty = (value, version, contexts = []) => {
  const specVersion = deriveVersion(version);

  let contextsArg = contexts;
  // Sort the contexts
  if (typeof contextsArg === 'object') {
    if (contextsArg === null) {
      contextsArg = [];
    } else if (!(contextsArg instanceof Array)) {
      contextsArg = [Object.assign({}, contextsArg)];
    } else {
      contextsArg = contexts.slice();
    }
  } else if (typeof contextsArg === 'string') {
    contextsArg = [contextsArg];
  } else {
    contextsArg = [];
  }

  // Add the openactive context to the top-level
  contextsArg.unshift({ '@context': getContext(specVersion) });

  // Return value
  const qualifiedProperty = {
    prefix: null,
    namespace: null,
    label: null,
    alias: null,
  };

  let valueToTest = value;

  // Merge the contexts into a flat structure
  const mergedContext = mergeContexts(contextsArg);

  const urlsToCheck = [];

  // Check for aliases first
  for (const key in mergedContext) {
    if (Object.prototype.hasOwnProperty.call(mergedContext, key)) {
      const prop = mergedContext[key];
      if (
        typeof prop === 'string'
        && !key.match(/^@/)
        && !prop.match(/^https?:\/\//)
      ) {
        if (valueToTest === prop) {
          qualifiedProperty.alias = key;
        } else if (valueToTest === key) {
          qualifiedProperty.alias = key;
          valueToTest = prop;
        }
      } else if (
        typeof prop === 'object'
        && typeof prop['@id'] === 'string'
      ) {
        if (valueToTest === prop['@id']) {
          qualifiedProperty.alias = key;
        } else if (valueToTest === key) {
          qualifiedProperty.alias = key;
          valueToTest = prop['@id'];
        }
      } else if (
        typeof prop === 'string'
        && !key.match(/^@/)
        && prop.match(/^https?:\/\//)
      ) {
        urlsToCheck.push({
          prefix: key,
          namespace: prop,
        });
      }
    }
  }

  // Check for keywords
  if (valueToTest.match(KEYWORD_REGEX)) {
    qualifiedProperty.label = valueToTest;
    return qualifiedProperty;
  }

  // Then check if we've got this namespace
  for (const prefixMap of urlsToCheck) {
    if (
      valueToTest.substr(0, prefixMap.namespace.length) === prefixMap.namespace
    ) {
      qualifiedProperty.prefix = prefixMap.prefix;
      qualifiedProperty.namespace = prefixMap.namespace;
      qualifiedProperty.label = valueToTest.substr(prefixMap.namespace.length);
      // Late check for an alias...
      if (
        typeof mergedContext[qualifiedProperty.label] !== 'undefined'
        && (
          mergedContext[qualifiedProperty.label] === `${qualifiedProperty.prefix}:${qualifiedProperty.label}`
          || (
            typeof mergedContext[qualifiedProperty.label] === 'object'
            && typeof mergedContext[qualifiedProperty.label]['@id'] === 'string'
            && mergedContext[qualifiedProperty.label]['@id'] === `${qualifiedProperty.prefix}:${qualifiedProperty.label}`
          )
        )
      ) {
        qualifiedProperty.alias = qualifiedProperty.label;
      }
      return qualifiedProperty;
    }
    if (
      valueToTest.substr(0, prefixMap.prefix.length + 1) === `${prefixMap.prefix}:`
    ) {
      qualifiedProperty.prefix = prefixMap.prefix;
      qualifiedProperty.namespace = prefixMap.namespace;
      qualifiedProperty.label = valueToTest.substr(prefixMap.prefix.length + 1);
      return qualifiedProperty;
    }
  }

  // Then check if we've got a default namespace
  if (typeof mergedContext['@vocab'] !== 'undefined'
    && valueToTest.match(/^[a-zA-Z0-9_]+$/)
  ) {
    qualifiedProperty.label = valueToTest;
    for (const prefixMap of urlsToCheck) {
      if (prefixMap.namespace === mergedContext['@vocab']) {
        qualifiedProperty.prefix = prefixMap.prefix;
        qualifiedProperty.namespace = prefixMap.namespace;
        return qualifiedProperty;
      }
    }
    qualifiedProperty.prefix = null;
    qualifiedProperty.namespace = mergedContext['@vocab'];
    return qualifiedProperty;
  }

  qualifiedProperty.label = valueToTest;
  return qualifiedProperty;
};

module.exports = getFullyQualifiedProperty;
