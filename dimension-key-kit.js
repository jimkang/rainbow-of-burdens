function getDimensionKeyFromProjectTypes(projectTypes) {
  return projectTypes.sort().join('|');
}

function getProjectTypesFromKey(key) {
  return key.split('|');
}

module.exports = {
  getDimensionKeyFromProjectTypes,
  getProjectTypesFromKey
};
