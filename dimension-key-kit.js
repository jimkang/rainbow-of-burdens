var without = require('lodash.without');
var flatten = require('lodash.flatten');

var sizeDimensionNames = [
  'main',
  'side'
];

function getDimensionKeyFromProjectTypes(projectTypes) {
  var dimensionKey = '';
  if (projectTypes.indexOf('main') !== -1) {
    dimensionKey += 'main';
  }
  else if (projectTypes.indexOf('side') !== -1) {
    dimensionKey += 'side';
  }
  dimensionKey += '|';
  dimensionKey +=
    without.apply(without, [projectTypes].concat(sizeDimensionNames))
    .sort()
    .join('|');

  return dimensionKey;
}

function getPossibleDimensionKeysFromProjectTypes(projectTypes) {
  var nonSizeDimensions = without.apply(
    without, [projectTypes].concat(sizeDimensionNames)
  );
  var sizeDimensions = [];

  if (projectTypes.indexOf('main') !== -1) {
    sizeDimensions.push('main');
  }
  if (projectTypes.indexOf('side') !== -1) {
    sizeDimensions.push('side');
  }
  
  return flatten(sizeDimensions.map(getKeysForSizeDimension));

  function getKeysForSizeDimension(sizeDimension) {
    return nonSizeDimensions.map(getKeysForNonSizeDimension);

    function getKeysForNonSizeDimension(nonSizeDimension) {
      return sizeDimension + '|' + nonSizeDimension;
    }
  }
}

function getProjectTypesFromKey(key) {
  return key.split('|');
}

module.exports = {
  getDimensionKeyFromProjectTypes: getDimensionKeyFromProjectTypes,
  getPossibleDimensionKeysFromProjectTypes: getPossibleDimensionKeysFromProjectTypes,
  getProjectTypesFromKey: getProjectTypesFromKey
};
