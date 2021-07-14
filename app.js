var qs = require('qs');
var config = require('./config');
var findToken = require('./find-token');
var handleError = require('handle-error-web');
var waterfall = require('async-waterfall');
var callNextTick = require('call-next-tick');
var CallTrelloAPI = require('./call-trello-api');
var curry = require('lodash.curry');
var findWhere = require('lodash.findwhere');
var parseLists = require('./parse-lists');
var renderTimeline = require('./representers/render-timeline');
var wireProjectCountSlider = require('./representers/wire-project-count-slider');
var calculateCompletion = require('./calculate-completion');
var extractCompletionDates = require('./extract-completion-dates');

(function go() {
  route();
  window.onhashchange = route;
  wireProjectCountSlider();
})();

function route() {
  // Skip the # part of the hash.
  var routeDict = qs.parse(window.location.hash.slice(1));

  var token = findToken({
    routeDict: routeDict,
    store: window.localStorage,
    currentDate: new Date(),
    tokenLifeInDays: 30,
  });

  var timeSpanUnit = routeDict.timeSpanUnit;
  if (!timeSpanUnit) {
    timeSpanUnit = 'day';
  }
  var timeSpanMS = routeDict.timeSpanMS;
  if (!timeSpanMS && timeSpanUnit === 'day') {
    timeSpanMS = 24 * 60 * 60 * 1000;
  }

  if (token) {
    getDimensionsFromBoard({
      token: token,
      numberOfProjectsToRender: routeDict.projectcount || 1,
      breakAfterEveryNSpans: routeDict.breakAfterEveryNSpans,
      numberOfSpansInABreak: routeDict.numberOfSpansInABreak,
      timeSpanUnit,
      timeSpanMS: timeSpanMS,
      boardName: routeDict.board,
    });
  } else {
    var callbackURL =
      window.location.protocol +
      '//' +
      window.location.host +
      window.location.pathname;

    window.location =
      'https://trello.com/1/authorize?' +
      qs.stringify({
        callback_method: 'fragment',
        return_url: callbackURL,
        scope: 'read',
        expiration: '30days',
        name: 'Pipeland',
        key: config.trello.key,
      });
  }
}

function getDimensionsFromBoard({
  token,
  breakAfterEveryNSpans,
  numberOfSpansInABreak,
  timeSpanUnit,
  timeSpanMS = 7 * 24 * 60 * 60 * 1000,
  boardName = 'Dimensions',
}) {
  var hoursPerSpan = 4;
  if (timeSpanUnit === 'week') {
    hoursPerSpan = 20;
  }
  var callTrelloAPI = CallTrelloAPI({ key: config.trello.key, token: token });

  waterfall(
    [
      curry(callTrelloAPI)({ path: 'members/me/boards' }),
      getLists,
      curry(parseLists)(callTrelloAPI),
      getCompletionTimes,
      callRender,
    ],
    handleError
  );

  function getLists(res, boards, done) {
    var dimensionsBoard = findWhere(boards, { name: boardName });
    if (!dimensionsBoard) {
      callNextTick(done, new Error('No "Dimensions" board found in Trello.'));
    } else {
      callTrelloAPI({ path: `boards/${dimensionsBoard.id}/lists` }, done);
    }
  }

  function getCompletionTimes(projects, done) {
    var results = {
      projects,
      completionEstimate: calculateCompletion({ projects, hoursPerSpan }),
    };
    console.log('completion estimate', results.completionEstimate);
    callNextTick(done, null, results);
  }

  function callRender(results, done) {
    console.log(results);
    var completionDates = extractCompletionDates({
      timeSpanLog: results.completionEstimate,
      timeSpanMS,
      startDate: new Date(),
      breakAfterEveryNSpans: breakAfterEveryNSpans,
      numberOfSpansInABreak: numberOfSpansInABreak,
    });
    console.log('completionDates:', completionDates);
    renderTimeline({ completionDates: completionDates });
    callNextTick(done);
  }
}
