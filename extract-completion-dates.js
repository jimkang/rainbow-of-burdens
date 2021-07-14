var pluck = require('lodash.pluck');
var compact = require('lodash.compact');

function extractCompletionDates({
  timeSpanLog,
  timeSpanMS,
  startDate,
  breakAfterEveryNSpans = -1,
  numberOfSpansInABreak = 0,
}) {
  var projectsCompletedPerSpan = pluck(timeSpanLog, 'projectsCompleted');
  if (breakAfterEveryNSpans !== -1) {
    projectsCompletedPerSpan = addBreakSpans(projectsCompletedPerSpan);
  }
  var startDateMS = startDate.getTime();
  return compact(projectsCompletedPerSpan.map(makeCompletionLog));

  function makeCompletionLog(projectsCompletedInSpan, spanIndex) {
    if (projectsCompletedInSpan && projectsCompletedInSpan.length > 0) {
      var completionDate = new Date(startDateMS + timeSpanMS * spanIndex);
      return {
        completedInSpan: spanIndex,
        completedSpanLabel: completionDate.toLocaleDateString(),
        approximateDate: completionDate.getTime(),
        completedProjects: projectsCompletedInSpan,
      };
    }
  }

  function addBreakSpans(projectsCompletedPerSpan) {
    var withBreaks = [];
    for (var i = 0; i < projectsCompletedPerSpan.length; ++i) {
      withBreaks.push(projectsCompletedPerSpan[i]);
      if ((i + 1) % breakAfterEveryNSpans === 0) {
        for (let j = 0; j < numberOfSpansInABreak; ++j) {
          withBreaks.push([]);
        }
      }
    }
    return withBreaks;
  }
}

module.exports = extractCompletionDates;
