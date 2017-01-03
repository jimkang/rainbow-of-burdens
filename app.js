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
var render = require('./render');

((function go() {
  route();
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

  console.log('token', token);

  if (token) {
    getDimensionsFromBoard(token);
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

function getDimensionsFromBoard(token) {
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
}

function callRender(portalsAndDimensions, done) {
  console.log(portalsAndDimensions);

  render({
    portalData: portalsAndDimensions.portals
  });
  callNextTick(done);
}
