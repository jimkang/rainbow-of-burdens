var pluck = require('lodash.pluck');
var toTitleCase = require('titlecase');
var compact = require('lodash.compact');

function extractCompletionDates({timeSpanLog, timeSpanUnit, timeSpanMS, startDate}) {
  var projectsCompletedPerSpan = pluck(timeSpanLog, 'projectsCompleted');
  var startDateMS = startDate.getTime();
  return compact(projectsCompletedPerSpan.map(makeCompletionLog));

  function makeCompletionLog(projectsCompletedInSpan, spanIndex) {
    if (projectsCompletedInSpan && projectsCompletedInSpan.length > 0) {
      return {
        completedInSpan: spanIndex,
        completedSpanLabel: toTitleCase(timeSpanUnit + ' ' + (spanIndex + 1)),
        approximateDate: (new Date(startDateMS + timeSpanMS * (spanIndex + 1))).getTime(),
        completedProjects: projectsCompletedInSpan
      };
    }
  }
}

module.exports = extractCompletionDates;
