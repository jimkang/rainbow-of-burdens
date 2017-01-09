var d3 = require('d3-selection');

function renderTimeline({completionDates}) {
  var markers = d3.select('#time-markers').selectAll('.time-marker')
    .data(completionDates, getProjectId);
  markers.exit().remove();
  var newMarkers = markers.enter().append('g').classed('time-marker', true);
  newMarkers.append('circle').attr('r', '5').attr('cx', 200);
  // TODO: Try tspan for this.
  newMarkers.append('text').classed('date-label', true).attr('x', 0);
  newMarkers.append('text').classed('project-label', true).attr('x', 300);

  var updateMarkers = newMarkers.merge(markers);
  updateMarkers.selectAll('.date-label').text(getDateText);
  updateMarkers.selectAll('.project-label').text(getProjectName);
  updateMarkers.attr('transform', getMarkerTransform);
}

function getProjectId(completionDateInfo) {
  return completionDateInfo.completedProject.id;
}

function getProjectName(completionDateInfo) {
  return completionDateInfo.completedProject.name;
}

function getDateText(completionDateInfo) {
  return (new Date(completionDateInfo.approximateDate)).toLocaleDateString();
}

function getMarkerTransform(completionDateInfo) {
  return 'translate(0, ' + completionDateInfo.completedInSpan * 50 + ')';
}

module.exports = renderTimeline;
