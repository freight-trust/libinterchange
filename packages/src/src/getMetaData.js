const specs = require('./dist/specs');
const deriveVersion = require('./helpers/deriveVersion');

const getMetaData = (version) => {
  const specVersion = deriveVersion(version);
  if (
    typeof specs[specVersion] === 'undefined'
    || typeof specs[specVersion].meta === 'undefined'
  ) {
    throw Error(`Invalid specification version "${specVersion}" supplied`);
  }
  return specs[specVersion].meta;
};

module.exports = getMetaData;
