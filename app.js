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
var wireProjectCountSlider = require('./representers/wire-project-count-slider');

((function go() {
  route();
  window.onhashchange = route;
  wireProjectCountSlider();
})());

function route() {
  // Skip the # part of the hash.
  var routeDict = qs.parse(window.location.hash.slice(1));

  var token = findToken({
    routeDict: routeDict,
    store: window.localStorage, 
    currentDate: new Date(),
    tokenLifeInDays: 30
  });

  if (token) {
    getDimensionsFromBoard({
      token: token,
      portalName: routeDict.portal,
      numberOfProjectsToRender: routeDict.projectcount || 1
    });
  }
  else {
    var callbackURL = window.location.protocol + '//' +
      window.location.host +
      window.location.pathname;

    window.location = 'https://trello.com/1/authorize?' +
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

function getDimensionsFromBoard({token, portalName, numberOfProjectsToRender}) {
  var callTrelloAPI = CallTrelloAPI({key: config.trello.key, token: token});

  waterfall(
    [
      curry(callTrelloAPI)({path: 'members/me/boards'}),
      getLists,
      curry(parseLists)(callTrelloAPI),
      callRender
    ],
    handleError
  );

  function getLists(res, boards, done) {
    var dimensionsBoard = findWhere(boards, {name: 'Dimensions'});
    if (!dimensionsBoard) {
      callNextTick(done, new Error('No "Dimensions" board found in Trello.'));
    }
    else {
      callTrelloAPI({path: `boards/${dimensionsBoard.id}/lists`}, done);
    }
  }

  function callRender(portalsAndDimensions, done) {
    console.log(portalsAndDimensions);
    var portalsToRender = portalsAndDimensions.portals;
    if (portalName) {
      portalsToRender = [findWhere(portalsToRender, {name: portalName})];
    }

    portalsToRender.forEach(cutProjects);

    renderPortals({
      portalData: portalsToRender
    });

    renderPortalButtons({
      portalNames: pluck(portalsAndDimensions.portals, 'name')
    });

    callNextTick(done);
  }

  function cutProjects(portal) {
    portal.dimensionKits.forEach(cutProjectsInDimension);
  }

  function cutProjectsInDimension(dimensionKit) {
    if (dimensionKit && dimensionKit.projects) {
      dimensionKit.projects = dimensionKit.projects.slice(0, numberOfProjectsToRender);
    }
  }
}
