var test = require('tape');
var testProjects = require('./fixtures/example-projects.json');
var testPortals = require('./fixtures/example-portals.json');
var testResults = require('./fixtures/example-completion-results.json');

var calculateCompletion = require('../calculate-completion');

test('Calculate completion', calculateTest);

function calculateTest(t) {
  var weeks = calculateCompletion({projects: testProjects, portals: testPortals});
  // console.log(JSON.stringify(weeks, null, '  '));
  console.log('Number of weeks:', weeks.length);
  t.deepEqual(weeks, testResults, 'Resulting weeks are correct.');
  t.end();
}
