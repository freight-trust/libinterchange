const specs = require('./dist/specs');
const deriveVersion = require('./helpers/deriveVersion');

const getModels = (version) => {
  const specVersion = deriveVersion(version);
  if (
    typeof specs[specVersion] === 'undefined'
    || typeof specs[specVersion].models === 'undefined'
  ) {
    throw Error(`Invalid specification version "${specVersion}" supplied`);
  }
  return specs[specVersion].models;
};

module.exports = getModels;
