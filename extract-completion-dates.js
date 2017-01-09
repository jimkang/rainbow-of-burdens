var pluck = require('lodash.pluck');
var toTitleCase = require('titlecase');

function extractCompletionDates({timeSpanLog, timeSpanUnit, timeSpanMS, startDate}) {
  var projectsCompletedPerSpan = pluck(timeSpanLog, 'projectsCompleted');
  var startDateMS = startDate.getTime();
  return projectsCompletedPerSpan.reduce(addCompletionLog, []);

  function addCompletionLog(completionLogs, span, spanIndex) {
    if (span) {
      span.forEach(addLogForProject);
    }
    return completionLogs;

    function addLogForProject(project) {
      completionLogs.push({
        completedInSpan: spanIndex,
        completedSpanLabel: toTitleCase(timeSpanUnit + ' ' + (spanIndex + 1)),
        approximateDate: (new Date(startDateMS + timeSpanMS * (spanIndex + 1))).getTime(),
        completedProject: project
      });
    }
  }
}

module.exports = extractCompletionDates;
