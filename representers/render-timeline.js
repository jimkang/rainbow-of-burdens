var d3 = require('d3-selection');
var accessor = require('accessor');
var chromaticScales = require('d3-scale-chromatic');

//var scaleNames = Object.keys(chromaticScales).filter(name =>
//  name.startsWith('interpolate')
//);
var scaleNames = [
  'interpolateSinebow',
  'interpolatePlasma',
  'interpolateWarm',
  'interpolateViridis',
  'interpolateInferno',
  'interpolateCool',
  'interpolateRainbow',
  'interpolatePiYG',
  'interpolateOrRd',
  'interpolateRdYlBu',
  'interpolateSpectral',
];
var scale = scaleNames[~~(Math.random() * scaleNames.length)];
console.log('scale', scale);
var interpolateBGColor = chromaticScales[scale];

const oneWeekInMS = 7 * 24 * 60 * 60 * 1000;

function renderTimeline({ completionDates }) {
  var startDate;
  var endDate;

  if (completionDates.length > 0) {
    startDate = completionDates[0].approximateDate;
    endDate = completionDates[completionDates.length - 1].approximateDate;
  }
  const dateRange = endDate - startDate;

  var timespans = d3
    .select('#timeline-board')
    .selectAll('.timespan')
    .data(completionDates, accessor('completedInSpan'));
  timespans.exit().remove();
  var newTimespans = timespans.enter().append('div').classed('timespan', true);
  newTimespans.append('text').classed('date-label', true);
  newTimespans.append('ul').classed('timespan-projects', true);

  var updateTimespans = newTimespans.merge(timespans);
  updateTimespans.selectAll('.date-label').text(getDateText);
  updateTimespans.style('background-color', getColorForDate);

  var projectRoots = updateTimespans.select('.timespan-projects');
  var projects = projectRoots
    .selectAll('.project-label')
    .data(accessor('completedProjects'), accessor('name'));
  projects.exit().remove();
  var newProjects = projects
    .enter()
    .append('li')
    .classed('project-label', true);
  var updateProjects = newProjects.merge(projects);
  updateProjects.text(getProjectText);

  function getColorForDate(info) {
    const proportionToFinalDate =
      (info.approximateDate - startDate) / dateRange;
    return interpolateBGColor(1.0 - proportionToFinalDate);
  }
}

function getDateText(completionDateInfo) {
  if (completionDateInfo.completedSpanLabel) {
    return completionDateInfo.completedSpanLabel;
  }
  // TODO: Handle day timeSpanUnit case.
  return (
    dateIntegerToString(completionDateInfo.approximateDate) +
    ' to ' +
    dateIntegerToString(completionDateInfo.approximateDate + oneWeekInMS)
  );
}

function dateIntegerToString(dateInt) {
  return new Date(dateInt).toLocaleDateString();
}

function getProjectText(project) {
  var unit = project.neededTimeSpanTotal > 1 ? 'hours' : 'hour';
  return `${project.name} (${project.neededTimeSpanTotal} ${unit})`;
}

module.exports = renderTimeline;
