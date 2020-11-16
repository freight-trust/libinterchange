const getEnums = require('./getEnums');

describe('getEnums', () => {
  it('should throw if passed an invalid spec version', () => {
    const modelLoadTest = () => getEnums('0.0');
    expect(modelLoadTest).toThrow();
  });

  it('should return valid enums as JSON', () => {
    const metaData = getEnums('2.0');
    expect(typeof metaData).toBe('object');
  });

  it('should return valid enums as JSON with a version alias', () => {
    const metaData = getEnums('latest');
    expect(typeof metaData).toBe('object');
  });
});
