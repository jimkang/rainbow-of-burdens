var d3 = require('d3-selection');
var updateRoute = require('../update-route');

function wireProjectCountSlider() {
  d3.select('#project-count-slider').on('change', updateProjectCount);
}

function updateProjectCount() {
  updateRoute('projectcount', this.value);
}

module.exports = wireProjectCountSlider;
