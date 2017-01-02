var findWhere = require('lodash.findwhere');
var pluck = require('lodash.pluck');
var callNextTick = require('call-next-tick');
var curry = require('lodash.curry');
var sb = require('standard-bail')();
var waterfall = require('async-waterfall');

function parseLists(callTrelloAPI, res, lists, parseDone) {
  var portals;
  var projectsForTypes;

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
        curry(parseProjects)({projectsListId: projectsList.id, callTrelloAPI: callTrelloAPI}),
        saveProjectsForTypes,
        packResults
      ],
      parseDone
    );
    // callNextTick(done, null, {portals: portals, dimensions: dimensions});

  }

  function savePortals(parsed, done) {
    portals = parsed;
    console.log('portals', portals);
    callNextTick(done);
  }

  function saveProjectsForTypes(parsed, done) {
    projectsForTypes = parsed;
    callNextTick(done);
  }

  function packResults(done) {
    var results = {
      portals: portals,
      projectsForTypes: projectsForTypes
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

function parseProjects({projectsListId, callTrelloAPI}, done) {
  var projectsForTypes = {};
  callTrelloAPI({path: `lists/${projectsListId}/cards`}, sb(parseProjectCards, done));

  function parseProjectCards(res, cards) {
    // console.log('project cards', cards);
    cards.forEach(putProjectInDimensionsDict);
    callNextTick(done, null, projectsForTypes);
  }

  function putProjectInDimensionsDict(card) {
    var project = makeProjectFromCard(card);
    project.projectTypes.forEach(putProjectInDictForTypes);

    function putProjectInDictForTypes(projectType) {
      addToArrayInDict(projectsForTypes, projectType, project);
    }
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

module.exports = parseLists;
