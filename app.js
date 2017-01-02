var qs = require('qs');
var config = require('./config');
var findToken = require('./find-token');
var handleError = require('handle-error-web');
var waterfall = require('async-waterfall');
var findWhere = require('lodash.findwhere');
var callNextTick = require('call-next-tick');
var CallTrelloAPI = require('./call-trello-api');
var curry = require('lodash.curry');
var pluck = require('lodash.pluck');
var sb = require('standard-bail')();

((function go() {
  route();

  // trelloTest();
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
    getPipesFromBoard(token);
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

function getPipesFromBoard(token) {
  var callTrelloAPI = CallTrelloAPI({key: config.trello.key, token: token});

  waterfall(
    [
      curry(callTrelloAPI)({path: 'members/me/boards'}),
      getLists,
      curry(parseLists)(callTrelloAPI)
    ],
    handleError
  );

  function getLists(res, boards, done) {
    var pipesBoard = findWhere(boards, {name: 'Pipes'});
    if (!pipesBoard) {
      callNextTick(done, new Error('No "Pipes" board found in Trello.'));
    }
    else {
      callTrelloAPI({path: `boards/${pipesBoard.id}/lists`}, done);
    }
  }
}

function parseLists(callTrelloAPI, res, lists, parseDone) {
  console.log(lists);
  var portals;
  var pipes;

  var portalsList = findWhere(lists, {name: 'Portals'});
  var projectsList = findWhere(lists, {name: 'Projects'});

  if (!portalsList) {
    callNextTick(parseDone, new Error('Missing Portals list from source board.'));
  }
  else if (!projectsList) {
    callNextTick(parseDone, new Error('Missing Portals list from source board.'));
  }
  else {
    waterfall(
      [
        curry(parsePortals)({portalsListId: portalsList.id, callTrelloAPI: callTrelloAPI}),
        savePortals,
        curry(parsePipes)({projectsListId: projectsList.id, callTrelloAPI: callTrelloAPI}),
        savePipes,
        packResults
      ],
      parseDone
    );
    // callNextTick(done, null, {portals: portals, pipes: pipes});

  }

  function savePortals(parsed, done) {
    portals = parsed;
    console.log('portals', portals);
    callNextTick(done);
  }

  function savePipes(parsed, done) {
    pipes = parsed;
    callNextTick(done);
  }

  function packResults(done) {
    var results = {
      portals: portals,
      pipes: pipes
    };
    callNextTick(done, null, results);
  }
}

function parsePortals({portalsListId, callTrelloAPI}, done) {
  callTrelloAPI({path: `lists/${portalsListId}/cards`}, sb(parseTunnelCards, done));

  function parseTunnelCards(res, cards) {
    done(null, cards.map(makeTunnelFromCard));
  }
}

function makeTunnelFromCard(card) {
  var tunnel = {};
  var nameTimeSpanPair = card.name.split(' - ');
  if (nameTimeSpanPair.length > 0) {
    tunnel.name = nameTimeSpanPair[0];
  }
  if (nameTimeSpanPair.length > 1) {
    tunnel.weeklyTimeSpan = nameTimeSpanPair[1];
  }
  tunnel.projectTypes = pluck(card.labels, 'name');

  return tunnel;
}

function parsePipes({projectsListId, callTrelloAPI}, done) {
  callTrelloAPI({path: `lists/${projectsListId}/cards`}, sb(parseProjectCards, done));

  function parseProjectCards(res, cards) {
    console.log('project cards', cards);
    // TODO.
    callNextTick(done);
  }
}
