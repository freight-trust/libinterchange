const loadModelMergeParent = (paramModel, paramParentModel) => {
  let model = Object.assign({}, paramModel);
  const parentModel = paramParentModel;
  for (const field in parentModel.fields) {
    if (Object.prototype.hasOwnProperty.call(parentModel.fields, field)) {
      if (typeof parentModel.fields[field].inheritedFrom === 'undefined') {
        parentModel.fields[field].inheritedFrom = model.subClassOf;
      }
    }
  }
  model.fields = Object.assign(parentModel.fields, model.fields || {});
  model.derivedFrom = model.derivedFrom || null;
  model.baseSchemaClass = model.derivedFrom || parentModel.baseSchemaClass;
  model = Object.assign(parentModel, model);
  if (typeof model.subClassGraph === 'undefined') {
    model.subClassGraph = [];
  }
  model.subClassGraph.unshift(model.subClassOf);
  return model;
};

module.exports = loadModelMergeParent;
