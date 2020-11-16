const contexts = require('./dist/contexts');
const deriveVersion = require('./helpers/deriveVersion');

const getContext = (version) => {
  const specVersion = deriveVersion(version);
  if (typeof contexts[specVersion] === 'undefined') {
    throw Error('Invalid specification version supplied');
  }
  return contexts[specVersion];
};

module.exports = getContext;
