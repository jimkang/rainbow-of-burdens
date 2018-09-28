var test = require('tape');
var timeSpanLog = require('./fixtures/example-completion-results.json');
var testResults = require('./fixtures/example-completion-dates.json');
var testResultsWithBreaks = require('./fixtures/example-completion-dates-with-breaks.json');
var extractCompletionDates = require('../extract-completion-dates');

test('Extract dates', extractTest);
test('Extract with breaks', breaksTest);

function extractTest(t) {
  var completionDates = extractCompletionDates({
    timeSpanLog: timeSpanLog,
    timeSpanUnit: 'week',
    timeSpanMS: 7 * 24 * 60 * 60 * 1000,
    startDate: new Date('2017-01-08')
  });
  // console.log(JSON.stringify(completionDates, null, '  '));
  t.deepEqual(
    completionDates,
    testResults,
    'Resulting completion dates are correct.'
  );
  t.end();
}

function breaksTest(t) {
  var completionDates = extractCompletionDates({
    timeSpanLog: timeSpanLog,
    timeSpanUnit: 'day',
    timeSpanMS: 7 * 24 * 60 * 60 * 1000,
    startDate: new Date('2017-01-08'),
    breakAfterEveryNSpans: 5,
    numberOfSpansInABreak: 2
  });

  // console.log(JSON.stringify(completionDates, null, '  '));
  t.deepEqual(
    completionDates,
    testResultsWithBreaks,
    'Resulting completion dates are correct.'
  );
  t.end();
}
