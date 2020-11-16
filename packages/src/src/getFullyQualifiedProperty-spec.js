const getFullyQualifiedProperty = require('./getFullyQualifiedProperty');

describe('getFullyQualifiedProperty', () => {
  it('should successfully place a unprefixed property in the schema namespace', () => {
    const prop = getFullyQualifiedProperty('name', '2.0');

    expect(prop.prefix).toBe('schema');
    expect(prop.namespace).toBe('https://schema.org/');
    expect(prop.label).toBe('name');
    expect(prop.alias).toBe(null);
  });

  it('should successfully place a unprefixed alias property in the oa namespace', () => {
    const prop = getFullyQualifiedProperty('meetingPoint', '2.0');

    expect(prop.prefix).toBe('oa');
    expect(prop.namespace).toBe('https://openactive.io/');
    expect(prop.label).toBe('meetingPoint');
    expect(prop.alias).toBe('meetingPoint');
  });

  it('should successfully recognise type as @type', () => {
    const prop = getFullyQualifiedProperty('type', '2.0');

    expect(prop.prefix).toBe(null);
    expect(prop.namespace).toBe(null);
    expect(prop.label).toBe('@type');
    expect(prop.alias).toBe('type');
  });

  it('should successfully recognise @type as type', () => {
    const prop = getFullyQualifiedProperty('@type', '2.0');

    expect(prop.prefix).toBe(null);
    expect(prop.namespace).toBe(null);
    expect(prop.label).toBe('@type');
    expect(prop.alias).toBe('type');
  });

  it('should successfully recognise license in the dc namespace', () => {
    const prop = getFullyQualifiedProperty('license', '2.0');

    expect(prop.prefix).toBe('dc');
    expect(prop.namespace).toBe('http://purl.org/dc/terms/');
    expect(prop.label).toBe('license');
    expect(prop.alias).toBe('license');
  });

  it('should successfully recognise dc:license in the dc namespace', () => {
    const prop = getFullyQualifiedProperty('dc:license', '2.0');

    expect(prop.prefix).toBe('dc');
    expect(prop.namespace).toBe('http://purl.org/dc/terms/');
    expect(prop.label).toBe('license');
    expect(prop.alias).toBe('license');
  });

  it('should successfully recognise http://purl.org/dc/terms/license in the dc namespace', () => {
    const prop = getFullyQualifiedProperty('http://purl.org/dc/terms/license', '2.0');

    expect(prop.prefix).toBe('dc');
    expect(prop.namespace).toBe('http://purl.org/dc/terms/');
    expect(prop.label).toBe('license');
    expect(prop.alias).toBe('license');
  });

  it('should return an unknown namespace as is', () => {
    const prop = getFullyQualifiedProperty('http://example.org/license', '2.0');

    expect(prop.prefix).toBe(null);
    expect(prop.namespace).toBe(null);
    expect(prop.label).toBe('http://example.org/license');
    expect(prop.alias).toBe(null);
  });

  it('should return an unknown prefix as is', () => {
    const prop = getFullyQualifiedProperty('beta:license', '2.0');

    expect(prop.prefix).toBe(null);
    expect(prop.namespace).toBe(null);
    expect(prop.label).toBe('beta:license');
    expect(prop.alias).toBe(null);
  });
});
