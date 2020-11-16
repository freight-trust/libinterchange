const loadModelCheckArgs = require('./helpers/loadModelCheckArgs');
const specs = require('./dist/specs');

const loadEnum = (name, version) => {
  const specVersion = loadModelCheckArgs(name, version);
  if (
    typeof specs[specVersion] === 'undefined'
    || typeof specs[specVersion].enums === 'undefined'
    || typeof specs[specVersion].enums[name] === 'undefined'
  ) {
    throw Error(`Invalid enum name "${name}" supplied`);
  }
  return Object.assign({ name }, specs[specVersion].enums[name]);
};

module.exports = loadEnum;
