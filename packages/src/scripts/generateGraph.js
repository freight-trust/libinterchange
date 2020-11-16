// TODO:
// - rdfs:domain
// - rdfs:subPropertyOf
// - comments
// - GenderRestrictionTypes

const fs = require('fs');
const path = require('path');

const derivePrefix = require('../src/helpers/derivePrefix');
const deriveSingularTypes = require('../src/helpers/deriveSingularTypes');
const deriveVersion = require('../src/helpers/deriveVersion');

const getPrefixForType = (basePath, metaData, type) => {
  const parentJsonPath = path.join(basePath, `${type}.json`);
  const parentData = fs.readFileSync(parentJsonPath, 'utf8');
  const parentModel = JSON.parse(parentData);
  const parentHasModelDerivedFrom = typeof parentModel.derivedFrom !== 'undefined' && parentModel.derivedFrom !== null;
  if (parentHasModelDerivedFrom) {
    return derivePrefix(parentModel.derivedFrom, metaData.namespaces);
  }
  return null;
};

const generateGraph = (version, metaData, enums) => {
  const specVersion = deriveVersion(version);
  const extraData = {
    '@id': metaData.namespaces[metaData.openActivePrefix],
    'dc:date': (new Date()).toISOString().replace(/T.*$/, ''),
    'owl:versionInfo': '#',
  };
  const propsAndClasses = {
    rdfs_classes: [],
    rdfs_properties: [],
  };

  const oaEnums = [];
  for (const enumKey in enums) {
    if (Object.prototype.hasOwnProperty.call(enums, enumKey)) {
      const enumObj = enums[enumKey];
      if (enumObj.namespace === metaData.contextUrl) {
        oaEnums.push(`${metaData.contextUrl}${enumKey}`);
        propsAndClasses.rdfs_classes.push({
          '@id': `${metaData.openActivePrefix}:${enumKey}`,
          '@type': 'rdfs:Class',
          'rdfs:label': {
            en: enumKey,
          },
          'rdfs:comment': {
            en: enumObj.comment || '',
          },
        });
        for (const enumValue of enumObj.values) {
          propsAndClasses.rdfs_classes.push({
            '@id': `${metaData.openActivePrefix}:${enumValue}`,
            '@type': 'rdfs:Class',
            'rdfs:label': {
              en: enumValue,
            },
            'rdfs:comment': {
              en: `Enumerated value of ${enumKey}`,
            },
            'rdfs:subClassOf': `${metaData.openActivePrefix}:${enumKey}`,
          });
        }
      }
    }
  }

  const basePath = path.join(__dirname, '..', 'versions', specVersion, 'models');

  const files = fs.readdirSync(basePath);
  for (const file of files) {
    const jsonPath = path.join(basePath, file);
    const data = fs.readFileSync(jsonPath, 'utf8');
    const model = JSON.parse(data);

    let modelPrefix = metaData.openActivePrefix;
    const hasModelDerivedFrom = typeof model.derivedFrom !== 'undefined' && model.derivedFrom !== null;
    if (hasModelDerivedFrom) {
      modelPrefix = derivePrefix(model.derivedFrom, metaData.namespaces) || modelPrefix;
    }
    const modelDerivedFromName = hasModelDerivedFrom
      ? model.derivedFrom.replace(metaData.namespaces[modelPrefix], '')
      : model.type;
    if (modelPrefix !== metaData.defaultPrefix) {
      if (modelPrefix === metaData.openActivePrefix) {
        const rdfsClass = {
          '@id': `${modelPrefix}:${modelDerivedFromName}`,
          '@type': 'rdfs:Class',
          'rdfs:label': {
            en: modelDerivedFromName,
          },
          'rdfs:comment': {
            en: '',
          },
        };
        if (typeof model.subClassOf !== 'undefined') {
          let subClassNamespace = derivePrefix(model.subClassOf, metaData.namespaces) || metaData.openActivePrefix;
          const subClassName = model.subClassOf.replace(/^#/, '').replace(metaData.namespaces[subClassNamespace], '');
          // We should check whether the parent of this is derived from elsewhere
          if (model.subClassOf.match(/^#/)) {
            subClassNamespace = getPrefixForType(basePath, metaData, subClassName) || modelPrefix;
          }
          rdfsClass['rdfs:subClassOf'] = `${subClassNamespace}:${subClassName}`;
        }
        propsAndClasses.rdfs_classes.push(rdfsClass);
      }
    }
    for (const fieldName in model.fields) {
      if (
        Object.prototype.hasOwnProperty.call(model.fields, fieldName)
        && typeof metaData.keywords[fieldName] === 'undefined'
        && !fieldName.match(/^@/)
      ) {
        const field = model.fields[fieldName];
        let fieldPrefix = modelPrefix;
        const hasFieldSameAs = typeof field.sameAs !== 'undefined' && field.sameAs !== null;
        if (hasFieldSameAs) {
          fieldPrefix = derivePrefix(field.sameAs, metaData.namespaces) || fieldPrefix;
        }
        if (fieldPrefix !== metaData.defaultPrefix) {
          const fieldSameAsName = hasFieldSameAs
            ? field.sameAs.replace(metaData.namespaces[fieldPrefix], '')
            : fieldName;
          if (fieldPrefix === metaData.openActivePrefix) {
            // Find an existing property
            const found = propsAndClasses.rdfs_properties.filter(
              value => value['@id'] === `${fieldPrefix}:${fieldSameAsName}`,
            );
            let property;
            if (found.length === 0) {
              property = {
                '@id': `${fieldPrefix}:${fieldSameAsName}`,
                '@type': 'rdf:Property',
                'rdfs:label': {
                  en: fieldSameAsName,
                },
                'rdfs:comment': {
                  en: typeof field.description === 'string' ? field.description : field.description.join(' '),
                },
                'schema:domainIncludes': [],
              };
              propsAndClasses.rdfs_properties.push(property);
            } else {
              ([property] = found);
            }
            property['schema:domainIncludes'].push(`${modelPrefix}:${modelDerivedFromName}`);
            const types = deriveSingularTypes(field);
            const range = property['schema:rangeIncludes'] || [];
            if (types.length > 0) {
              for (const type of types) {
                if (type.match(/^[A-Za-z]+$/)) {
                  const typePrefix = getPrefixForType(basePath, metaData, type) || metaData.openActivePrefix;
                  range.push(`${typePrefix}:${type}`);
                } else if (oaEnums.indexOf(type) >= 0) {
                  range.push(`${metaData.openActivePrefix}:${type.replace(metaData.contextUrl, '')}`);
                } else {
                  const typePrefix = derivePrefix(type, metaData.namespaces) || metaData.openActivePrefix;
                  const typeName = type.replace(/^#/, '').replace(metaData.namespaces[typePrefix], '');
                  range.push(`${typePrefix}:${typeName}`);
                }
              }
            }
            property['schema:rangeIncludes'] = [...new Set(range)];
          }
        }
      }
    }
  }
  return Object.assign(
    {},
    metaData.baseGraph,
    extraData,
    propsAndClasses,
  );
};

module.exports = generateGraph;
