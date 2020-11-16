const loadEnum = require('./loadEnum');

describe('loadEnum', () => {
  it('should throw if passed an invalid enum', () => {
    const enumLoadTest = () => loadEnum('../InvalidEnum');
    expect(enumLoadTest).toThrow();
  });

  it('should throw if passed a enum that doesn\'t exist', () => {
    const enumLoadTest = () => loadEnum('InvalidEnum');
    expect(enumLoadTest).toThrow();
  });

  it('should throw if passed an invalid spec version', () => {
    const enumLoadTest = () => loadEnum('DayOfWeek', '0.0');
    expect(enumLoadTest).toThrow();
  });

  it('should return a valid enum as JSON', () => {
    const enumData = loadEnum('DayOfWeek');
    expect(typeof enumData).toBe('object');
    expect(enumData.name).toBe('DayOfWeek');
  });
});
