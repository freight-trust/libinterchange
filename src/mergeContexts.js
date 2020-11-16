const mergeContexts = (contexts = []) => {
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

  // Merge the contexts into a flat structure
  let mergedContext = {};
  for (const context of contextsArg) {
    // If this is not an object, we can't process it
    if (typeof context === 'object' && context !== null && Object.prototype.hasOwnProperty.call(context, '@context')) {
      if (context['@context'] instanceof Array) {
        for (const subContext of context['@context']) {
          // Ignore global contexts
          if (typeof subContext === 'object' && subContext !== null) {
            mergedContext = Object.assign(mergedContext, subContext);
          }
        }
      } else if (typeof context['@context'] === 'object' && context['@context'] !== null) {
        mergedContext = Object.assign(mergedContext, context['@context']);
      }
    }
  }

  return mergedContext;
};

module.exports = mergeContexts;
