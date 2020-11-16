const deriveVersion = require('./deriveVersion');

const loadModelCheckArgs = (name, version) => {
  if (!name.match(/^[A-Za-z]+$/) || name === 'model_list') {
    throw Error('Invalid model name supplied');
  }
  return deriveVersion(version);
};

module.exports = loadModelCheckArgs;
