const deriveSingularTypes = (node) => {
  let typeChecks = [];
  if (typeof (node.requiredType) !== 'undefined') {
    typeChecks.push(node.requiredType);
  }
  if (typeof (node.alternativeTypes) !== 'undefined') {
    typeChecks = typeChecks.concat(node.alternativeTypes);
  }
  if (typeof (node.model) !== 'undefined') {
    typeChecks.push(node.model);
  }
  if (typeof (node.alternativeModels) !== 'undefined') {
    typeChecks = typeChecks.concat(node.alternativeModels);
  }
  for (const index in typeChecks) {
    if (typeChecks[index].match(/^ArrayOf#/)) {
      typeChecks[index] = typeChecks[index].substr(8);
    } else if (typeChecks[index].match(/^#/)) {
      typeChecks[index] = typeChecks[index].substr(1);
    }
  }
  return [...new Set(typeChecks)];
};

module.exports = deriveSingularTypes;
