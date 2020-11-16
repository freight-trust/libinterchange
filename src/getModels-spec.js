const getModels = require('./getModels');

describe('getModels', () => {
  it('should throw if passed an invalid spec version', () => {
    const modelLoadTest = () => getModels('0.0');
    expect(modelLoadTest).toThrow();
  });

  it('should return valid models as JSON', () => {
    const metaData = getModels('2.0');
    expect(typeof metaData).toBe('object');
  });

  it('should return valid models as JSON with a version alias', () => {
    const metaData = getModels('latest');
    expect(typeof metaData).toBe('object');
  });

  it('should return valid models as JSON with no argument supplied', () => {
    const metaData = getModels();
    expect(typeof metaData).toBe('object');
  });
});
