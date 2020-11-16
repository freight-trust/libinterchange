const versions = require('../versions');

const deriveVersion = (version) => {
  let localVersion = version;
  if (typeof localVersion === 'undefined') {
    localVersion = 'latest';
  }
  if (Object.values(versions).indexOf(localVersion) >= 0) {
    return localVersion;
  }
  if (typeof versions[localVersion] !== 'undefined') {
    return versions[localVersion];
  }

  throw Error(`Invalid specification version "${version}" supplied`);
};

module.exports = deriveVersion;
