const specs = require('./dist/specs');
const deriveVersion = require('./helpers/deriveVersion');

const getExamples = (version) => {
  const specVersion = deriveVersion(version);
  if (
    typeof specs[specVersion] === 'undefined'
    || typeof specs[specVersion].examples === 'undefined'
  ) {
    throw Error(`Invalid specification version "${specVersion}" supplied`);
  }
  return specs[specVersion].examples;
};

module.exports = getExamples;
