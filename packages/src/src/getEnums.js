const specs = require('./dist/specs');
const deriveVersion = require('./helpers/deriveVersion');

const getEnums = (version) => {
  const specVersion = deriveVersion(version);
  if (
    typeof specs[specVersion] === 'undefined'
    || typeof specs[specVersion].enums === 'undefined'
  ) {
    throw Error(`Invalid specification version "${specVersion}" supplied`);
  }
  return specs[specVersion].enums;
};

module.exports = getEnums;
