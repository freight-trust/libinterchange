const derivePrefix = (value, namespaces) => {
  if (typeof value !== 'string') {
    return null;
  }
  for (const key in namespaces) {
    if (Object.prototype.hasOwnProperty.call(namespaces, key)) {
      const prop = namespaces[key];
      if (
        typeof prop === 'string'
        && prop.match(/^https?:\/\//)
        && value.substr(0, prop.length) === prop
      ) {
        return key;
      }
    }
  }
  return null;
};

module.exports = derivePrefix;
