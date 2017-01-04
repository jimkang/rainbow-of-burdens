var qs = require('qs');

function updateRoute(key, value) {
  var routeDict = qs.parse(window.location.hash.slice(1));
  routeDict[key] = value;
  window.location.hash = qs.stringify(routeDict);
}

module.exports = updateRoute;
