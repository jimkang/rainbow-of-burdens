var qs = require('qs');
var config = require('./config');
var findToken = require('./find-token');
var handleError = require('handle-error-web');
var waterfall = require('async-waterfall');
var callNextTick = require('call-next-tick');
var CallTrelloAPI = require('./call-trello-api');
var curry = require('lodash.curry');
var findWhere = require('lodash.findwhere');
var pluck = require('lodash.pluck');
var parseLists = require('./parse-lists');
var renderPortals = require('./representers/render-portals');
var renderPortalButtons = require('./representers/render-portal-buttons');
var renderTimeline = require('./representers/render-timeline');
var wireProjectCountSlider = require('./representers/wire-project-count-slider');
var dimensionKeyKit = require('./dimension-key-kit');
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
    tokenLifeInDays: 30
  });

  var timeSpanMS = routeDict.timeSpanMS;
  if (!timeSpanMS && routeDict.timeSpanUnit === 'day') {
    timeSpanMS = 24 * 60 * 60 * 1000;
  }

  if (token) {
    getDimensionsFromBoard({
      token: token,
      portalName: routeDict.portal,
      numberOfProjectsToRender: routeDict.projectcount || 1,
      breakAfterEveryNSpans: routeDict.breakAfterEveryNSpans,
      numberOfSpansInABreak: routeDict.numberOfSpansInABreak,
      timeSpanUnit: routeDict.timeSpanUnit,
      timeSpanMS: timeSpanMS,
      boardName: routeDict.board
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
        key: config.trello.key
      });
  }
}

function getDimensionsFromBoard({
  token,
  portalName,
  numberOfProjectsToRender,
  breakAfterEveryNSpans,
  numberOfSpansInABreak,
  timeSpanUnit = 'week',
  timeSpanMS = 7 * 24 * 60 * 60 * 1000,
  boardName = 'Dimensions'
}) {
  var callTrelloAPI = CallTrelloAPI({ key: config.trello.key, token: token });

  waterfall(
    [
      curry(callTrelloAPI)({ path: 'members/me/boards' }),
      getLists,
      curry(parseLists)(callTrelloAPI),
      getCompletionTimes,
      callRender
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

  function getCompletionTimes(portalsAndDimensions, done) {
    portalsAndDimensions.completionEstimate = calculateCompletion(
      portalsAndDimensions
    );
    console.log('completion estimate', portalsAndDimensions.completionEstimate);
    callNextTick(done, null, portalsAndDimensions);
  }

  function callRender(portalsAndDimensions, done) {
    console.log(portalsAndDimensions);
    var portalsToRender = portalsAndDimensions.portals;
    if (portalName) {
      portalsToRender = [findWhere(portalsToRender, { name: portalName })];
    }

    portalsToRender.forEach(addProjects);

    renderPortals({
      portalData: portalsToRender
    });

    renderPortalButtons({
      portalNames: pluck(portalsAndDimensions.portals, 'name')
    });

    var completionDates = extractCompletionDates({
      timeSpanLog: portalsAndDimensions.completionEstimate,
      timeSpanUnit: timeSpanUnit,
      timeSpanMS: timeSpanMS,
      startDate: new Date(),
      breakAfterEveryNSpans: breakAfterEveryNSpans,
      numberOfSpansInABreak: numberOfSpansInABreak
    });
    console.log('completionDates:', completionDates);
    renderTimeline({ completionDates: completionDates });

    callNextTick(done);

    function addProjects(portal) {
      var potentialKeys = portal.projectTypes;

      portal.mainProjects = [];

      portalsAndDimensions.projects.some(addProject);

      // keyMatches)
      // .slice(0, numberOfProjectsToRender);

      function addProject(project) {
        var dimensionKey = dimensionKeyKit.getDimensionKeyFromProjectTypes(
          project.projectTypes
        );

        if (potentialKeys.indexOf(dimensionKey) !== -1) {
          if (portal.mainProjects.length < numberOfProjectsToRender) {
            portal.mainProjects.push(project);
          }

          if (portal.mainProjects.length >= numberOfProjectsToRender) {
            // Stop adding projects; we have enough.
            return true;
          }
        }
        return false;
      }
    }
  }

  // function cutProjects(portal) {
  //   portal.dimensionKits.forEach(cutProjectsInDimension);
  // }

  // function cutProjectsInDimension(dimensionKit) {
  //   if (dimensionKit && dimensionKit.projects) {
  //     dimensionKit.projects = dimensionKit.projects.slice(0, numberOfProjectsToRender);
  //   }
  // }
}
