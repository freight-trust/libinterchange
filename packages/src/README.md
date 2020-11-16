# OpenActive Data Models

Data models used to drive the OpenActive validator and developer documentation.

[![Build Status](https://travis-ci.com/openactive/data-models.svg?branch=master)](https://travis-ci.com/openactive/data-models)
[![Known Vulnerabilities](https://snyk.io/test/github/openactive/data-models/badge.svg)](https://snyk.io/test/github/openactive/data-models)

## Introduction

This library provides all the JSON representations of the models in the `versions/<version>/models` directory. It is capable of storing multiple versions of the spec.

## API

The library provides various exports:

#### getExamples([version])

Returns a list of examples relating to the specification version supplied.

Each object in the list should contain the following keys:

* **name** - A human-readable name describing the example.
* **file** - The file the example is in.

##### Example

```js

const { getExamples } = require('@openactive/data-models');

const examples = getExamples('2.0');

// [
//   {
//     "file": "event_example_1.json",
//     "name": "Example Event"
//   },
//   // ...
// ]

```

#### getFullyQualifiedProperty(name [, version [, contexts]])

Returns a resolved version of a property, indicating its namespace, prefix and alias. It will by default insert the OpenActive context for the provided specification version at the top of the context tree.

##### Example

```js

const { getFullyQualifiedProperty } = require('@openactive/data-models');

let info = getFullyQualifiedProperty('type');

// {
//   "prefix": null,
//   "namespace": null,
//   "label": "@type",
//   "alias": "type",
// }

let info = getFullyQualifiedProperty('meetingPoint', '2.0');

// {
//   "prefix": "oa",
//   "namespace": "https://openactive.io/",
//   "label": "meetingPoint",
//   "alias": "meetingPoint",
// }

let info = getFullyQualifiedProperty('schema:name', '2.0');

// {
//   "prefix": "schema",
//   "namespace": "https://schema.org/",
//   "label": "name",
//   "alias": null,
// }

let info = getFullyQualifiedProperty('beta:field', '2.0');

// {
//   "prefix": null,
//   "namespace": null,
//   "label": "beta:field",
//   "alias": null,
// }

```

#### getMetaData([version])

Returns the meta data relating to the specification version supplied.

The meta data should contain the following keys:

* **defaultPrefix** - The default prefix that is used in the `@vocab` field of the OpenActive JSON-LD definition.
* **openActivePrefix** - The prefix used for OpenActive fields
* **contextUrl** - The URL that the JSON context of this specification is published at
* **specUrl** - The URL that the human-readable version of this specification is published at
* **defaultActivityLists** - An array of activity list URLs that accompany this spec
* **baseGraph** - A base object used when generating the `@graph` property of the OpenActive JSON-LD definition.
* **keywords** - A map of aliases for JSON-LD keywords.
* **namespaces** - A map of prefixes to namespaces used in the OpenActive JSON-LD definition.
* **feedConfigurations** - A map of feed configurations, to be used by the Dataset Site generators.

##### Example

```js

const { getMetaData } = require('@openactive/data-models');

const metaData = getMetaData('2.0');

// {
//   "defaultPrefix": "schema",
//   "openActivePrefix": "oa",
//   "contextUrl": "https://openactive.io/",
//   "specUrl": "https://openactive.io/modelling-opportunity-data/EditorsDraft/",
//   "defaultActivityLists": [
//     "https://openactive.io/activity-list"
//   ],
//   "baseGraph": {},
//   "keywords": {
//     "type": "@type",
//     "id": "@id"
//   },
//   "namespaces": {
//     "oa": "https://openactive.io/",
//     "dc": "http://purl.org/dc/terms/",
//     "owl": "http://www.w3.org/2002/07/owl#",
//     "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
//     "rdfa": "http://www.w3.org/ns/rdfa#",
//     "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
//     "schema": "https://schema.org/",
//     "skos": "http://www.w3.org/2004/02/skos/core#",
//     "xsd": "http://www.w3.org/2001/XMLSchema#",
//     "pending": "https://pending.schema.org/"
//   }
// }
```

#### loadModel(modelName [, version])

Returns the model definition for a particular version of the spec.

##### Example

```js

const { loadModel } = require('@openactive/data-models');

// Returns the latest version of this model
const eventModel = loadModel('Event');

// Returns the 2.0 version of this model
const eventModel2 = loadModel('Event', '2.0');

```

#### getModels( [version] )

Returns a map of model definitions for a particular version of the spec.

##### Example

```js

const { getModels } = require('@openactive/data-models');

// Returns the latest version of the models map
const models = getModels();

// Returns the 2.0 version of  the models map
const models2 = getModels('2.0');

```

#### getSchemaOrgVocab()

Returns the bundled JSON-LD version of the schema.org vocabulary.

#### versions

A hash of available versions. This includes some named aliases. You can pass the keys of this hash to any of the above methods in the `version` parameter.

##### Example

```js

const { versions } = require('@openactive/data-models');

// {
//   "latest": "2.x",
//   "2.0": "2.x"
// }

```


## Development

### Getting started

```shell
$ git clone git@github.com:openactive/data-models.git
$ cd data-models
$ npm install
```
### Running tests

This project uses [Jasmine](https://jasmine.github.io/) for its tests. All spec files are located alongside the files that they target.

To run tests locally, run:

```shell
$ npm test
```

The test run will also include a run of [eslint](https://eslint.org/). To run the tests without these, use:

```shell
$ npm run test-no-lint
```

### Adding models

Add new models to the `versions/models` directory.

Find more on the models, see the [model reference](MODELS.md)


### Releasing

To release after pushing changes to git run the following:
- `npm test` - check tests pass
- `npm version patch` - to bump the patch version (see [semver](https://docs.npmjs.com/getting-started/semantic-versioning))
- `npm publish` - to publish to npm
- `git push` - to push the repo, as npm will have created git tags with the last command that need to be pushed
- Redeploy `data-model-validator-site` in Heroku, and it will auto update (for patch and minor version bumps only, major versions are breaking changes by definition so require code changes to the other projects).
