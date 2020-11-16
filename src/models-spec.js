const fs = require('fs');
const path = require('path');
const request = require('sync-request'); // eslint-disable-line import/no-extraneous-dependencies
const $rdf = require('rdflib'); // eslint-disable-line import/no-extraneous-dependencies

const getEnums = require('./getEnums');
const getMetaData = require('./getMetaData');
const derivePrefix = require('./helpers/derivePrefix');
const getSchemaOrgVocab = require('./getSchemaOrgVocab');

const loadModelFromFile = require('./loadModelFromFile');
const versions = require('./versions');

const schemaOrgDataModel = (() => {
  // Note even though schema.org has migrated http://pending.schema.org/ to https://schema.org/
  // We still use https://pending.schema.org/ to simplify the tooling (as the modelling specification does not
  // allow for arbitrary pending terms to be used as-is, they must instead be added to a custom extension)
  const getPrefixReplacedId = (entity) => {
    if (entity['https://schema.org/isPartOf']
      && entity['https://schema.org/isPartOf']['@id'] !== 'https://meta.schema.org') {
      return entity['@id'].replace(/^https:\/\/schema.org/, entity['https://schema.org/isPartOf']['@id']);
    }
    return entity['@id'];
  };

  return getSchemaOrgVocab()['@graph'].map(entity => getPrefixReplacedId(entity));
})();

const parseRDFXML = (uri) => {
  const response = request('GET', uri);

  // Convert RDF file to string
  const rdf = `${response.body}`;

  // Parse RDF string into store
  const store = $rdf.graph();
  $rdf.parse(rdf, store, uri, 'application/rdf+xml');

  // Get all subjects specified in RDF file as a Set
  const ids = new Set(store.statements.map(x => x.subject.value).filter(x => x.indexOf('n') !== 0));

  // Return the Set
  return ids;
};

const goodRelationsDataModel = parseRDFXML('http://www.heppnetz.de/ontologies/goodrelations/v1.owl');
const skosDataModel = parseRDFXML('https://www.w3.org/2009/08/skos-reference/skos.rdf');

const forEachVersion = (cb) => {
  const uniqueVersions = [...new Set(Object.values(versions))];
  for (const version of uniqueVersions) {
    const modelsDirpath = path.join(__dirname, '..', 'versions', version, 'models');
    const rpdeDirpath = path.join(__dirname, '..', 'versions', version, 'rpde');
    const files = [
      ...fs.readdirSync(modelsDirpath),
      ...fs.readdirSync(rpdeDirpath),
    ];
    const metaData = getMetaData(version);
    cb(version, metaData, modelsDirpath, rpdeDirpath, files);
  }
};

const forEachVersionedFile = (cb) => {
  forEachVersion((version, metaData, modelsDirpath, rpdeDirpath, files) => {
    for (const file of files) {
      const dir = file.match(/^Feed/) ? rpdeDirpath : modelsDirpath;
      const filePath = path.join(dir, file);
      const data = fs.readFileSync(filePath, 'utf8');
      cb(version, metaData, modelsDirpath, rpdeDirpath, file, data);
    }
  });
};

const forEachField = (model, cb) => {
  for (const field in model.fields) {
    if (Object.prototype.hasOwnProperty.call(model.fields, field)) {
      const fieldSpec = model.fields[field];
      cb(field, fieldSpec);
    }
  }
};

const isDerivedFromSchema = (model) => {
  const { derivedFrom } = model;
  return typeof derivedFrom === 'string' && derivedFrom.match(/^https:\/\/schema.org/);
};

describe('models', () => {
  forEachVersionedFile((version, metaData, modelsDirpath, rpdeDirpath, file, data) => {
    const fieldNameToNamespaced = {};

    const modelExists = (modelName) => {
      try {
        const model = loadModelFromFile(modelName, version);
        return model.type === modelName;
      } catch (e) {
        return false;
      }
    };

    const customMatchers = {
      toBeValidModelReference() {
        return {
          compare(modelRef) {
            const result = {};
            const modelName = modelRef.replace(/^(ArrayOf)?#/, '');

            result.pass = modelExists(modelName);
            if (!result.pass) {
              result.message = `${modelRef} is not a valid model reference`;
            }
            return result;
          },
        };
      },

      toBeValidTypeReference(forRequiredType) {
        return {
          compare(typeRef) {
            const result = {};
            const typeId = typeRef.replace(/^ArrayOf#?/, '');
            if (typeId.match(/^http:\/\/(pending\.)?schema\.org/)) {
              result.pass = false;
              result.message = `${typeRef} must use https to be a valid schema.org type reference`;
            } else if (typeId.match(/^https:\/\/schema\.org/)) {
              result.pass = schemaOrgDataModel.includes(typeId);
              if (!result.pass && forRequiredType) {
                // If this test is for forRequiredType, allow schema.org aliases to be used for pending.schema.org
                const pendingTypeId = typeId.replace('https://schema.org', 'https://pending.schema.org');
                result.pass = schemaOrgDataModel.includes(pendingTypeId);
              }
              if (!result.pass) {
                result.message = `${typeRef} is not an accurate schema.org type reference`;
              }
            } else if (typeId.match(/^https:\/\/pending\.schema\.org/)) {
              result.pass = schemaOrgDataModel.includes(typeId);
              if (!result.pass) {
                result.message = `${typeRef} is not an accurate pending.schema.org type reference`;
              }
            } else if (typeId.match(/^http:\/\/purl\.org\/goodrelations\/v1/)) {
              result.pass = goodRelationsDataModel.has(typeId);
              if (!result.pass) {
                result.message = `${typeRef} is not an accurate goodrelations type reference`;
              }
            } else if (typeId.match(/^http:\/\/www\.w3\.org\/2004\/02\/skos\/core#/)) {
              result.pass = skosDataModel.has(typeId);
              if (!result.pass) {
                result.message = `${typeRef} is not a valid SKOS type reference`;
              }
            } else if (typeId.match(/^https:\/\/openactive.io/)) {
              const typeName = typeId.replace(/^https:\/\/openactive.io\//, '');
              const enums = getEnums(version);
              result.pass = Object.prototype.hasOwnProperty.call(enums, typeName) || modelExists(typeName);
              if (!result.pass) {
                result.message = `${typeRef} is not a valid OpenActive type reference`;
              }
            } else {
              throw new Error(`unrecognished type ${typeId}`);
            }

            return result;
          },
        };
      },

      toBeValidPropertyReferenceFor() {
        return {
          compare(typeRef, field) {
            const result = {};
            if (typeof typeRef !== 'string') {
              result.pass = false;
              result.message = `A valid SameAs reference was not specified for ${field}`;
              return result;
            }
            const typeId = typeRef;
            if (typeId.match(/^http:\/\/(pending\.)?schema\.org/)) {
              result.pass = false;
              result.message = `${typeRef} must use https to be a valid schema.org reference`;
            } else if (typeId.match(/^https:\/\/schema\.org/)) {
              const expectedId = `https://schema.org/${field}`;
              result.pass = expectedId === typeId && schemaOrgDataModel.includes(typeId);
              if (!result.pass) {
                result.message = `${typeRef} is not an accurate schema.org reference for ${field}`;
              }
            } else if (typeId.match(/^https:\/\/pending\.schema\.org/)) {
              const expectedId = `https://pending.schema.org/${field}`;
              result.pass = expectedId === typeId && schemaOrgDataModel.includes(typeId);
              if (!result.pass) {
                result.message = `${typeRef} is not an accurate pending.schema.org reference for ${field}`;
              }
            } else if (typeId.match(/^http:\/\/purl\.org\/goodrelations\/v1/)) {
              const expectedId = `http://purl.org/goodrelations/v1/${field}`;
              result.pass = expectedId === typeId && goodRelationsDataModel.has(typeId);
              if (!result.pass) {
                result.message = `${typeRef} is not an accurate goodrelations reference for ${field}`;
              }
            } else if (typeId.match(/^http:\/\/www\.w3\.org\/2004\/02\/skos\/core#/)) {
              const expectedId = `http://www.w3.org/2004/02/skos/core#${field}`;
              result.pass = expectedId === typeId && skosDataModel.has(typeId);
              if (!result.pass) {
                result.message = `${typeRef} is not an accurate SKOS reference for ${field}`;
              }
            } else if (typeId.match(/^http:\/\/www\.w3\.org\/ns\/dcat#/)) {
              const expectedId = `http://www.w3.org/ns/dcat#${field}`;
              result.pass = expectedId === typeId;
              if (!result.pass) {
                result.message = `${typeRef} is not an accurate DCAT v2 reference for ${field}`;
              }
            } else if (typeId.match(/^https:\/\/openactive.io/)) {
              const expectedId = `https://openactive.io/${field}`;
              result.pass = expectedId === typeId;
              if (!result.pass) {
                result.message = `${typeRef} is not a valid OpenActive reference for ${field}`;
              }
            } else if (typeId.match(/^http:\/\/purl.org\/dc\/terms\//)) {
              const expectedId = `http://purl.org/dc/terms/${field}`;
              result.pass = expectedId === typeId;
              if (!result.pass) {
                result.message = `${typeRef} is not a valid Dublin Core reference for ${field}`;
              }
            } else {
              throw new Error(`unrecognished type ${typeId}`);
            }

            return result;
          },
        };
      },
    };

    beforeEach(() => {
      jasmine.addMatchers(customMatchers);
    });

    describe(`file ${file}`, () => {
      let jsonData;

      it('should be valid json', () => {
        const readJson = () => { jsonData = JSON.parse(data); };
        expect(readJson).not.toThrow();
        expect(typeof jsonData).toEqual('object');
      });

      describe('data', () => {
        beforeAll(() => {
          jsonData = loadModelFromFile(file.replace(/\.json$/, ''), version);
        });

        describe('type', () => {
          it('should match the file name', () => {
            expect(jsonData.type).toBeDefined();
            expect(`${jsonData.type}.json`).toEqual(file);
          });

          it('should match the fields.type.requiredContent', () => {
            // Only apply to JSON-LD
            if (!(typeof jsonData.isJsonLd !== 'undefined' && jsonData.isJsonLd === false)) {
              // Non JSON-LD models don't have a type property so this check isn't needed
              expect(jsonData.type).toEqual(jsonData.fields.type.requiredContent);
            }
          });

          it('should have a type that is alphabetic', () => {
            expect(jsonData.type).toMatch(/^[A-Za-z]+$/);
          });
        });

        it('should be fit into the model inheritance hierarchy', () => {
          if (!(typeof jsonData.isJsonLd !== 'undefined' && jsonData.isJsonLd === false)) { // Non JSON-LD models aren't part of the main model hierarchy
            const inheritsFrom = Object.prototype.hasOwnProperty.call(jsonData, 'subClassOf') ? jsonData.subClassOf : jsonData.derivedFrom;
            expect(inheritsFrom).toBeString();
            expect(inheritsFrom).not.toBeEmptyString();
          }
        });

        it('should be a subclass of an existing model or class in external vocab if subClassOf is provided', () => {
          if (Object.prototype.hasOwnProperty.call(jsonData, 'subClassOf')) {
            expect(jsonData.subClassOf).not.toStartWith('ArrayOf#');
            if (jsonData.subClassOf.startsWith('http')) {
              expect(jsonData.subClassOf).toBeValidTypeReference();
            } else {
              expect(jsonData.subClassOf).toBeValidModelReference();
            }
          }
        });

        describe('subClassOf', () => {
          it('should refer to local model if it exists', () => {
            if (Object.prototype.hasOwnProperty.call(jsonData, 'subClassOf')
              && typeof jsonData.subClassOf === 'string') {
              if (jsonData.subClassOf.startsWith('https://schema.org/')) {
                const modelName = jsonData.subClassOf.replace(/^https:\/\/schema.org\//, '#');
                expect(modelName).not.toBeValidModelReference();
              } else if (jsonData.subClassOf.startsWith('https://')) {
                throw new Error(`Cannot determine model name from ${jsonData.subClassOf}`);
              }
            }
          });
        });

        describe('derivedFrom', () => {
          it('should refer to a class that actually exists', () => {
            if (
              typeof jsonData.derivedFrom === 'string'
            ) {
              expect(jsonData.derivedFrom).toBeValidTypeReference();
            }
          });

          it('should always reference an external schema', () => {
            if (typeof jsonData.derivedFrom === 'string') {
              expect(jsonData.derivedFrom).toMatch(/^https?:\/\//);
            }
          });

          it('should match the type name, and include https://schema.org/ if a class with the same name already exists in schema.org (as we do not plan to duplicate schema.org classes into the OpenActive namespace)', () => {
            if (!(typeof jsonData.isJsonLd !== 'undefined' && jsonData.isJsonLd === false)) {
              if (typeof jsonData.derivedFrom === 'string') {
                // Should always end with the type name
                expect(jsonData.derivedFrom).toEndWith(`${jsonData.type}`);

                // If it exists in schema, should always reference schema
                const typeId = `https://schema.org/${jsonData.type}`;
                if (jsonData.derivedFrom !== typeId) {
                  expect(schemaOrgDataModel).not.toContain(typeId);
                }
              }
            }
          });
        });

        it('should have a valid sameAs reference that matches the field name', () => {
          // Only for JSON-LD models
          if (!(typeof jsonData.isJsonLd !== 'undefined' && jsonData.isJsonLd === false)) {
            forEachField(jsonData, (field, fieldSpec) => {
              if (field !== 'type') {
                expect(fieldSpec.sameAs).toBeValidPropertyReferenceFor(field);
              }
            });
          }
        });

        it('should only use sameAs references to schema.org when such properties in schema.org actually already exist', () => {
          for (const field in jsonData.fields) {
            if (
              Object.prototype.hasOwnProperty.call(jsonData.fields, field)
                && typeof jsonData.fields[field].sameAs === 'string'
                && jsonData.fields[field].sameAs.match(/^https:\/\/schema.org/)
            ) {
              const propertyId = jsonData.fields[field].sameAs;
              expect(schemaOrgDataModel).toContain(propertyId);
            }
          }
        });

        it('should not set derivedFrom when subClassOf refers to an external class', () => {
          if (typeof jsonData.subClassOf === 'string' && !jsonData.subClassOf.match(/^#/)) {
            expect(jsonData.derivedFrom).not.toBeDefined();
          }
        });

        it('should contain properties referencing schema.org (via sameAs or derivedFrom) if a property with the same name already exists in schema.org (as we do not plan to duplicate schema.org properties into the OpenActive namespace)', () => {
          if (
            // Exclude non JSON-LD classes (e.g. RPDE)
            !(typeof jsonData.isJsonLd !== 'undefined' && jsonData.isJsonLd === false)
            // Exclude SKOS classes
            && !(typeof jsonData.derivedFrom === 'string' && jsonData.derivedFrom.match(/^http:\/\/www.w3.org\/2004\/02\/skos/))
          ) {
            const defaultToSchema = isDerivedFromSchema(jsonData);

            for (const field in jsonData.fields) {
              if (
                Object.prototype.hasOwnProperty.call(jsonData.fields, field)
                // Field is not claiming to be derivedFrom schema.org
                && !(defaultToSchema && typeof jsonData.fields[field].sameAs === 'undefined')
                // Field is not claiming to be sameAs schema.org
                && !(typeof jsonData.fields[field].sameAs === 'string' && jsonData.fields[field].sameAs.match(/^https:\/\/(pending\.)?schema.org/))
                && field !== 'type'
              ) {
                // There should not be a conflicting schema.org property
                const impliedPropertyId = `https://schema.org/${field}`;
                expect(schemaOrgDataModel).not.toContain(impliedPropertyId);

                // There should not be a conflicting pending.schema.org property
                const impliedPendingPropertyId = `https://pending.schema.org/${field}`;
                expect(schemaOrgDataModel).not.toContain(impliedPendingPropertyId);
              }
            }
          }
        });

        it('should have an idFormat and sampleId if hasId is true', () => {
          if (typeof jsonData.hasId !== 'undefined') {
            expect(typeof jsonData.hasId).toBe('boolean');

            if (jsonData.hasId === true) {
              expect(jsonData.idFormat).toBeDefined();
              expect(jsonData.sampleId).toBeDefined();
              expect(jsonData.inSpec).toContain('id');
            }
          }
        });

        it('should have a requiredFields property of type array if defined', () => {
          if (typeof jsonData.requiredFields !== 'undefined') {
            expect(jsonData.requiredFields instanceof Array).toBe(true);
          }
        });

        it('should have a recommendedFields property of type array if defined', () => {
          if (typeof jsonData.recommendedFields !== 'undefined') {
            expect(jsonData.recommendedFields instanceof Array).toBe(true);
          }
        });

        const restrictionProperties = ['requiredFields', 'recommendedFields', 'shallNotInclude'];
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < restrictionProperties.length - 1; i++) {
          // eslint-disable-next-line no-plusplus
          for (let j = i + 1; j < restrictionProperties.length; j++) {
            const prop1 = restrictionProperties[i];
            const prop2 = restrictionProperties[j];
            // eslint-disable-next-line no-loop-func
            it(`should not have fields in both ${prop1} and ${prop2} within imperativeConfiguration`, () => {
              if (Object.prototype.hasOwnProperty.call(jsonData, 'imperativeConfiguration')) {
                for (const config of Object.values(jsonData.imperativeConfiguration)) {
                  if (typeof config[prop1] !== 'undefined'
                  && typeof config[prop2] !== 'undefined'
                  ) {
                    for (const field of config[prop1]) {
                      expect(config[prop2]).not.toContain(field);
                    }
                  }
                }
              }
            });
            // eslint-disable-next-line no-loop-func
            it(`should not have fields in both ${prop1} and ${prop2}`, () => {
              if (typeof jsonData[prop1] !== 'undefined'
                && typeof jsonData[prop2] !== 'undefined'
              ) {
                for (const field of jsonData[prop1]) {
                  expect(jsonData[prop2]).not.toContain(field);
                }
              }
            });
          }
        }

        it('should not have fields in both requiredFields and requiredOptions', () => {
          if (typeof jsonData.requiredOptions !== 'undefined'
            && typeof jsonData.requiredFields !== 'undefined'
          ) {
            for (const option of jsonData.requiredOptions) {
              for (const field of option.options) {
                expect(jsonData.requiredFields).not.toContain(field);
              }
            }
          }
        });

        it('should have a inSpec property of type array if defined', () => {
          if (typeof jsonData.inSpec !== 'undefined') {
            expect(jsonData.inSpec instanceof Array).toBe(true);
          }
        });

        it('should have a inSpec property that contains everything in requiredFields and recommendedFields', () => {
          if (typeof jsonData.requiredFields !== 'undefined') {
            for (const field of jsonData.requiredFields) {
              expect(jsonData.inSpec).toContain(field);
            }
          }
          if (typeof jsonData.recommendedFields !== 'undefined') {
            for (const field of jsonData.requiredFields) {
              expect(jsonData.inSpec).toContain(field);
            }
          }
          if (typeof jsonData.requiredOptions !== 'undefined') {
            for (const option of jsonData.requiredOptions) {
              for (const field of option.options) {
                expect(jsonData.inSpec).toContain(field);
              }
            }
          }
        });

        it('should have a fields property', () => {
          expect(typeof jsonData.fields).toBe('object');
        });

        it('should have fields for everything in inSpec', () => {
          for (const field of jsonData.inSpec) {
            if (field !== 'id') {
              expect(Object.keys(jsonData.fields)).toContain(field);
            }
          }
        });

        it('should have inSpec value for everything in fields', () => {
          forEachField(jsonData, (field) => {
            expect(jsonData.inSpec).toContain(field);
          });
        });

        it('should have fields with names that match their keys', () => {
          forEachField(jsonData, (field, fieldSpec) => {
            expect(fieldSpec.fieldName).toBeDefined();
            expect(fieldSpec.fieldName).toBe(field);
          });
        });

        it('should have fields with either a requiredType or model', () => {
          forEachField(jsonData, (field, fieldSpec) => {
            expect(
              typeof fieldSpec.model === 'undefined'
              || typeof fieldSpec.requiredType === 'undefined',
            ).toBe(true);
          });
        });

        it('should have fields with a model property that points to real models', () => {
          forEachField(jsonData, (field, fieldSpec) => {
            if (typeof fieldSpec.model !== 'undefined') {
              expect(fieldSpec.model).toMatch(/^(ArrayOf)?#[A-Za-z]+$/);
            }
          });
        });

        it('should have fields with an additionalModels property that are arrays pointing to real models', () => {
          forEachField(jsonData, (field, fieldSpec) => {
            if (typeof fieldSpec.additionalModels !== 'undefined') {
              expect(fieldSpec.additionalModels instanceof Array).toBe(true);
              for (const model of fieldSpec.additionalModels) {
                expect(model).toMatch(/^(ArrayOf)?#[A-Za-z]+$/);
              }
            }
          });
        });

        it('should have fields with a type property that points to real types', () => {
          forEachField(jsonData, (field, fieldSpec) => {
            if (typeof fieldSpec.requiredType !== 'undefined') {
              expect(fieldSpec.requiredType).toMatch(/^(ArrayOf#)?(https:\/\/schema\.org\/|https:\/\/pending\.schema\.org\/|https:\/\/openactive\.io\/|http:\/\/purl\.org\/goodrelations\/v1#)[a-zA-Z]+$/);
            }
          });
        });

        it('should have fields with an additionalTypes property that are arrays pointing to real models', () => {
          forEachField(jsonData, (field, fieldSpec) => {
            if (typeof fieldSpec.additionalTypes !== 'undefined') {
              expect(fieldSpec.additionalTypes instanceof Array).toBe(true);
              for (const type of fieldSpec.additionalTypes) {
                expect(type).toMatch(/^(ArrayOf#)?http:\/\/(schema\.org|pending\.schema\.org|openactive\.io)\/[a-zA-Z]+$/);
              }
            }
          });
        });

        it('should have fields with a description property that is an array of strings, unless it is a type', () => {
          forEachField(jsonData, (field, fieldSpec) => {
            if (typeof fieldSpec.description !== 'undefined') {
              expect(fieldSpec.description instanceof Array
                && fieldSpec.description.filter(item => typeof item !== 'string').length === 0).toBe(true, field);
            } else if (field !== 'type') {
              fail(`Does not have description, '${field}'.`);
            }
          });
        });

        it('should have "type" with only exactly the properties fieldName, requiredType, requiredContent; and with requiredType as "https://schema.org/Text".', () => {
          if (jsonData.type !== 'FeedPage' && jsonData.type !== 'FeedItem') {
            expect(jsonData.fields.type && Object.keys(jsonData.fields.type).length).toBe(3, 'number of properties within type');
            expect(jsonData.fields.type.fieldName).toBe('type');
            expect(jsonData.fields.type.requiredType).toBe('https://schema.org/Text');
            expect(jsonData.fields.type.requiredContent).toMatch(/^[a-zA-Z]+$/);
          }
        });

        it('should only use existing models for models property of a field spec', () => {
          forEachField(jsonData, (field, fieldSpec) => {
            if (
              typeof fieldSpec.model === 'string'
            ) {
              expect(fieldSpec.model).toBeValidModelReference();
            }
          });
        });

        it('should only use valid classes with for requiredType property of a field spec', () => {
          forEachField(jsonData, (field, fieldSpec) => {
            if (
              typeof fieldSpec.requiredType === 'string'
            ) {
              expect(fieldSpec.requiredType).toBeValidTypeReference(true);
            }
          });
        });

        describe('alternativeModels', () => {
          it('should only include entries defined in models json', () => {
            forEachField(jsonData, (field, fieldSpec) => {
              if (
                typeof fieldSpec.alternativeModels === 'object'
                && fieldSpec.alternativeModels.length > 0
              ) {
                fieldSpec.alternativeModels.forEach((alternativeModel) => {
                  expect(alternativeModel).toBeValidModelReference();
                });
              }
            });
          });
        });

        describe('notInSpec', () => {
          it('should only include fields present in the parentModel', () => {
            if (
              typeof jsonData.notInSpec === 'object'
              && jsonData.notInSpec.length > 0
            ) {
              const parentModelName = jsonData.subClassGraph[0].replace(/^#/, '');
              const parentModel = loadModelFromFile(parentModelName, version);
              jsonData.notInSpec.forEach((notInSpecField) => {
                expect(parentModel.inSpec).toContain(notInSpecField);
              });
            }
          });
        });

        describe('imperativeConfiguration', () => {
          ['requiredFields', 'recommendedFields', 'shallNotInclude'].forEach((fieldRestriction) => {
            describe(fieldRestriction, () => {
              it('should only contain fields from inSpec', () => {
                if (Object.prototype.hasOwnProperty.call(jsonData, 'imperativeConfiguration')) {
                  for (const config of Object.values(jsonData.imperativeConfiguration)) {
                    if (Array.isArray(config[fieldRestriction])) {
                      for (const fieldName of config[fieldRestriction]) {
                        expect(jsonData.inSpec).toContain(fieldName);
                      }
                    }
                  }
                }
              });
            });
          });
        });

        describe('validationMode', () => {
          it('should point to entries in imperativeConfiguration or imperativeConfigurationWithContext', () => {
            if (Object.prototype.hasOwnProperty.call(jsonData, 'validationMode')) {
              const imperativeConfigurationKeys = [].concat(
                Object.keys(jsonData.imperativeConfiguration || {}),
                Object.keys(jsonData.imperativeConfigurationWithContext || {}),
              );
              for (const imperativeConfigurationKey of Object.values(jsonData.validationMode)) {
                expect(imperativeConfigurationKeys).toContain(imperativeConfigurationKey);
              }
            }
          });

          it('should have keys which are validationModes from the metadata', () => {
            if (Object.prototype.hasOwnProperty.call(jsonData, 'validationMode')) {
              const allowedValidationModes = metaData.validationModeGroups.reduce((allModes, group) => {
                const modesInGroup = group.validationModeList.map(modeObj => modeObj.validationMode);
                return allModes.concat(modesInGroup);
              }, []);
              for (const validationMode of Object.keys(jsonData.validationMode)) {
                expect(allowedValidationModes).toContain(validationMode);
              }
            }
          });
        });
      });

      describe('namespaces', () => {
        let model;
        beforeEach(() => {
          model = JSON.parse(data);
        });
        it('should not have fields in multiple namespaces', () => {
          if (typeof model.isJsonLd !== 'undefined' && model.isJsonLd === false) {
            return;
          }
          let modelPrefix = metaData.openActivePrefix;
          const hasModelDerivedFrom = typeof model.derivedFrom !== 'undefined' && model.derivedFrom !== null;
          if (hasModelDerivedFrom) {
            modelPrefix = derivePrefix(model.derivedFrom, metaData.namespaces) || modelPrefix;
          }
          for (const fieldName in model.fields) {
            if (
              Object.prototype.hasOwnProperty.call(model.fields, fieldName)
              && typeof metaData.keywords[fieldName] === 'undefined'
              && !fieldName.match(/^@/)
            ) {
              const field = model.fields[fieldName];
              let fieldPrefix = modelPrefix;
              const hasFieldSameAs = typeof field.sameAs !== 'undefined' && field.sameAs !== null;
              if (hasFieldSameAs) {
                fieldPrefix = derivePrefix(field.sameAs, metaData.namespaces) || fieldPrefix;
              }
              const fieldSameAsName = hasFieldSameAs
                ? field.sameAs.replace(metaData.namespaces[fieldPrefix], '')
                : fieldName;
              const fieldNameWithNamespace = `${fieldPrefix}:${fieldSameAsName}`;
              if (typeof fieldNameToNamespaced[fieldName] === 'undefined') {
                // if field with this name has not been seen before, then store to compare with other occurances
                fieldNameToNamespaced[fieldName] = fieldNameWithNamespace;
              } else {
                // if field with this name has been seen before, then make sure two occurances are from the same namespace
                expect(fieldNameToNamespaced[fieldName] === fieldNameWithNamespace).toBe(true);
              }
            }
          }
        });
      });
    });
  });
});
