const graphs = require('./dist/graphs');
const deriveVersion = require('./helpers/deriveVersion');

const getGraph = (version) => {
  const specVersion = deriveVersion(version);
  if (typeof graphs[specVersion] === 'undefined') {
    throw Error('Invalid specification version supplied');
  }
  return graphs[specVersion];
};

module.exports = getGraph;
