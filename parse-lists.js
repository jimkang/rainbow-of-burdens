var findWhere = require('lodash.findwhere');
var pluck = require('lodash.pluck');
var callNextTick = require('call-next-tick');
var curry = require('lodash.curry');
var sb = require('standard-bail')();
var waterfall = require('async-waterfall');
var keyKit = require('./dimension-key-kit');

function parseLists(callTrelloAPI, res, lists, parseDone) {
  var portals;
  var dimensions;

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
        curry(parseDimensions)({projectsListId: projectsList.id, callTrelloAPI: callTrelloAPI}),
        saveDimensions,
        packResults
      ],
      parseDone
    );
    // callNextTick(done, null, {portals: portals, dimensions: dimensions});

  }

  function savePortals(parsed, done) {
    portals = parsed;

    callNextTick(done);
  }

  function saveDimensions(parsed, done) {
    dimensions = parsed;
    callNextTick(done);
  }

  function packResults(done) {
    var results = {
      portals: portals.map(curry(addDimensionKitsToPortal)(dimensions)),
      dimensions: dimensions
    };
    callNextTick(done, null, results);
  }
}

function parsePortals({portalsListId, callTrelloAPI}, done) {
  callTrelloAPI({path: `lists/${portalsListId}/cards`}, sb(parsePortalCards, done));

  function parsePortalCards(res, cards) {
    done(null, cards.map(makePortalFromCard));
  }
}

function makePortalFromCard(card) {
  var portal = parseNameTimeSpanString(card.name);
  portal.projectTypes = pluck(card.labels, 'name');
  return portal;
}

function parseDimensions({projectsListId, callTrelloAPI}, done) {
  var dimensions = {};
  callTrelloAPI({path: `lists/${projectsListId}/cards`}, sb(parseProjectCards, done));

  function parseProjectCards(res, cards) {
    // console.log('project cards', cards);
    cards.forEach(putProjectInDimensionsDict);
    callNextTick(done, null, dimensions);
  }

  function putProjectInDimensionsDict(card) {
    var project = makeProjectFromCard(card);
    var dimensionKey = keyKit.getDimensionKeyFromProjectTypes(project.projectTypes);
    addToArrayInDict(dimensions, dimensionKey, project);
  }
}

function addToArrayInDict(dict, key, value) {
  var array = dict[key];
  if (array) {
    array.push(value);
  }
  else {
    dict[key] = [value];
  }
}

function makeProjectFromCard(card) {
  var project = parseNameTimeSpanString(card.name);
  project.id = card.id;
  project.projectTypes = pluck(card.labels, 'name');
  return project;
}

function parseNameTimeSpanString(s) {
  var result = {};
  var nameTimeSpanPair = s.split(' - ');
  if (nameTimeSpanPair.length > 0) {
    result.name = nameTimeSpanPair[0];
  }
  if (nameTimeSpanPair.length > 1) {
    result.weeklyTimeSpan = nameTimeSpanPair[1];
  }
  return result;
}

function addDimensionKitsToPortal(dimensions, portal) {
  var dimensionKeysForPortal = keyKit.getPossibleDimensionKeysFromProjectTypes(
    portal.projectTypes
  );

  portal.dimensionKits = dimensionKeysForPortal.map(getDimensionKitForKey);
  return portal;

  function getDimensionKitForKey(key) {
    return {
      id: key.replace(/\|/g, '-'),
      projectTypes: keyKit.getProjectTypesFromKey(key),
      projects: dimensions[key]
    };
  }
}

module.exports = parseLists;
