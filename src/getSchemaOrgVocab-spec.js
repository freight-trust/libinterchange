const getSchemaOrgVocab = require('./getSchemaOrgVocab');

describe('getSchemaOrgVocab', () => {
  it('should include a valid graph as JSON', () => {
    const schemaOrgVocab = getSchemaOrgVocab();
    expect(typeof schemaOrgVocab).toBe('object');
    expect(Array.isArray(schemaOrgVocab['@graph'])).toBe(true);
  });
});
