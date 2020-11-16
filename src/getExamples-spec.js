const getExamples = require('./getExamples');

describe('getExamples', () => {
  it('should throw if passed an invalid spec version', () => {
    const modelLoadTest = () => getExamples('0.0');
    expect(modelLoadTest).toThrow();
  });

  it('should return valid examples as JSON', () => {
    const examples = getExamples('2.0');
    expect(typeof examples).toBe('object');
    expect(examples instanceof Array).toBe(true);
  });

  it('should return valid examples as JSON with a version alias', () => {
    const examples = getExamples('latest');
    expect(typeof examples).toBe('object');
    expect(examples instanceof Array).toBe(true);
  });
});
