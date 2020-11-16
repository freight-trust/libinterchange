/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const request = require('sync-request');

const generateContext = require('./generateContext');
const generateGraph = require('./generateGraph');
const versions = require('../src/versions');

const uniqueVersions = [...new Set(Object.values(versions))];
const distPath = path.join(__dirname, '..', 'src', 'dist');

const specs = {};
const contexts = {};
const graphs = {};

for (const version of uniqueVersions) {
  const specPath = path.join(__dirname, '..', 'versions', version);
  const spec = {
    models: {},
    rpde: {},
    examples: null,
    meta: null,
  };

  const metaPath = path.join(specPath, 'meta.json');
  spec.meta = JSON.parse(
    fs.readFileSync(metaPath, 'utf8'),
  );

  const enumsPath = path.join(specPath, 'enums.json');
  spec.enums = JSON.parse(
    fs.readFileSync(enumsPath, 'utf8'),
  );

  const examplePath = path.join(specPath, 'examples/example_list.json');
  spec.examples = JSON.parse(
    fs.readFileSync(examplePath, 'utf8'),
  );

  for (const folder of ['models', 'rpde']) {
    const files = fs.readdirSync(path.join(specPath, folder));
    for (const file of files) {
      const filePath = path.join(specPath, folder, file);
      const data = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(data);
      spec[folder][jsonData.type] = jsonData;
    }
  }

  specs[version] = spec;
  contexts[version] = generateContext(version, spec.meta, spec.enums);
  graphs[version] = generateGraph(version, spec.meta, spec.enums);
}

if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath);
}

fs.writeFileSync(
  path.join(distPath, 'contexts.js'),
  `/* eslint-disable */
// This is a generated file. Do not edit manually.
module.exports = ${JSON.stringify(contexts)};`,
  () => {},
);

fs.writeFileSync(
  path.join(distPath, 'graphs.js'),
  `/* eslint-disable */
// This is a generated file. Do not edit manually.
module.exports = ${JSON.stringify(graphs)};`,
  () => {},
);

fs.writeFileSync(
  path.join(distPath, 'specs.js'),
  `/* eslint-disable */
// This is a generated file. Do not edit manually.
module.exports = ${JSON.stringify(specs)};`,
  () => {},
);

const assets = [
  {
    name: 'schemaOrgVocab',
    url: 'https://schema.org/version/latest/schemaorg-current-https.jsonld',
  },
];

console.log('Fetching schema.org vocab...');
for (const asset of assets) {
  const schema = JSON.parse(request('GET', asset.url, {
    headers: {
      'Content-Type': 'application/ld+json',
    },
  }).getBody());

  fs.writeFileSync(
    path.join(distPath, `${asset.name}.js`),
    `/* eslint-disable */
  // This is a generated file. Do not edit manually.
  module.exports = ${JSON.stringify(schema)};`,
    () => {},
  );
}
console.log('schema.org vocab downloaded successfully.');
