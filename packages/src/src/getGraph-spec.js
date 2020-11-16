const getGraph = require('./getGraph');

describe('getGraph', () => {
  it('should throw if passed an invalid spec version', () => {
    const contextLoadTest = () => getGraph('0.0');
    expect(contextLoadTest).toThrow();
  });

  it('should return a valid graph as JSON', () => {
    const graph = getGraph('2.0');
    expect(typeof graph).toBe('object');
    expect(graph['@context'].id).toBe('@id');
  });

  it('should return a valid graph as JSON with a version alias', () => {
    const graph = getGraph('latest');
    expect(typeof graph).toBe('object');
    expect(graph['@context'].id).toBe('@id');
  });
});
