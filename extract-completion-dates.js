var pluck = require('lodash.pluck');
var toTitleCase = require('titlecase');
var compact = require('lodash.compact');

function extractCompletionDates({
  timeSpanLog,
  timeSpanUnit,
  timeSpanMS,
  startDate,
  breakAfterEveryNSpans = -1,
  numberOfSpansInABreak = 0
}) {
  var projectsCompletedPerSpan = pluck(timeSpanLog, 'projectsCompleted');
  if (breakAfterEveryNSpans !== -1) {
    projectsCompletedPerSpan = addBreakSpans(projectsCompletedPerSpan);
  }
  var startDateMS = startDate.getTime();
  return compact(projectsCompletedPerSpan.map(makeCompletionLog));

  function makeCompletionLog(projectsCompletedInSpan, spanIndex) {
    if (projectsCompletedInSpan && projectsCompletedInSpan.length > 0) {
      return {
        completedInSpan: spanIndex,
        completedSpanLabel: toTitleCase(timeSpanUnit + ' ' + (spanIndex + 1)),
        approximateDate: new Date(
          startDateMS + timeSpanMS * (spanIndex + 1)
        ).getTime(),
        completedProjects: projectsCompletedInSpan
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
