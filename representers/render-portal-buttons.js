var d3 = require('d3-selection');
var updateRoute = require('../update-route');

function identity(x) {
  return x;
}

function renderPortalButtons({portalNames}) {
  var portalBar = d3.select('#portal-bar');
  var buttons = portalBar.selectAll('.portal-button').data(portalNames, identity);
  buttons.exit().remove;
  buttons.enter()
    .append('button').classed('portal-button', true).on('click', changePortalFilter)
    .merge(buttons).text(identity);
}

function changePortalFilter(portalName) {
  updateRoute('portal', portalName);
}

module.exports = renderPortalButtons;
