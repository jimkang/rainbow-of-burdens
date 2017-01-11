var d3 = require('d3-selection');
var pluck = require('lodash.pluck');
var accessor = require('accessor');

function renderTimeline({completionDates}) {
  var markers = d3.select('#time-markers').selectAll('.time-marker')
    .data(completionDates, accessor('completedInSpan'));
  markers.exit().remove();
  var newMarkers = markers.enter().append('g').classed('time-marker', true);
  newMarkers.append('circle').attr('r', '5').attr('cx', 200);
  newMarkers.append('text').classed('date-label', true).attr('x', 0);
  newMarkers.append('text').classed('project-label', true)
    .attr('transform', 'translate(300, 0)')
    .attr('dx', 0)
    .attr('dy', 0);

  var updateMarkers = newMarkers.merge(markers);
  updateMarkers.selectAll('.date-label').text(getDateText);
  updateMarkers.selectAll('.project-label')
    .text(getProjectNames)
    .call(wrap, 600);
  updateMarkers.attr('transform', getMarkerTransform);

  var timelineLength = (completionDates[completionDates.length - 1]
    .completedInSpan + 1) * 100;
  d3.select('#time-line').attr('d', 'M200,0L200,' + timelineLength);
  d3.select('#timeline-board').attr('height', timelineLength);
}

function getProjectNames(completionDateInfo) {
  return pluck(completionDateInfo.completedProjects, 'name').join(', ');
}

function getDateText(completionDateInfo) {
  return (new Date(completionDateInfo.approximateDate)).toLocaleDateString();
}

function getMarkerTransform(completionDateInfo) {
  return 'translate(0, ' + completionDateInfo.completedInSpan * 100 + ')';
}

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      y = text.attr('y'),
      dy = parseFloat(text.attr('dy')),
      tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
      }
    }
  });
}
module.exports = renderTimeline;
