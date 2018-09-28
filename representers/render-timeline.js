var d3 = require('d3-selection');
var pluck = require('lodash.pluck');
var accessor = require('accessor');

const heightBetweenEvents = 120;

function renderTimeline({ completionDates }) {
  var markers = d3
    .select('#time-markers')
    .selectAll('.time-marker')
    .data(completionDates, accessor('completedInSpan'));
  markers.exit().remove();
  var newMarkers = markers
    .enter()
    .append('g')
    .classed('time-marker', true);
  newMarkers
    .append('circle')
    .attr('r', '5')
    .attr('cx', 200);
  newMarkers
    .append('text')
    .classed('date-label', true)
    .attr('x', 0);
  newMarkers
    .append('foreignObject')
    .attr('transform', 'translate(300, -50)')
    .attr('width', '80%')
    .attr('height', heightBetweenEvents)
    .append('xhtml:div')
    .classed('project-label', true)
    .attr('dx', 0)
    .attr('dy', 0);

  var updateMarkers = newMarkers.merge(markers);
  updateMarkers.selectAll('.date-label').text(getDateText);
  updateMarkers.selectAll('.project-label').text(getProjectNames);
  //.call(wrap, 1200);
  updateMarkers.attr('transform', getMarkerTransform);

  var timelineLength =
    (completionDates[completionDates.length - 1].completedInSpan + 1) *
    heightBetweenEvents;
  d3.select('#time-line').attr('height', timelineLength);
  d3.select('#timeline-board').attr('height', timelineLength);
}

function getProjectNames(completionDateInfo) {
  return pluck(completionDateInfo.completedProjects, 'name').join(', ');
}

function getDateText(completionDateInfo) {
  return new Date(completionDateInfo.approximateDate).toLocaleDateString();
}

function getMarkerTransform(completionDateInfo) {
  return (
    'translate(0, ' +
    completionDateInfo.completedInSpan * heightBetweenEvents +
    ')'
  );
}

module.exports = renderTimeline;
