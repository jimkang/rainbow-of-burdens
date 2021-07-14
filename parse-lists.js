var findWhere = require('lodash.findwhere');
var pluck = require('lodash.pluck');
var callNextTick = require('call-next-tick');
var sb = require('standard-bail')();

function parseLists(callTrelloAPI, res, lists, parseDone) {
  var projectsList = findWhere(lists, { name: 'Projects' });

  if (!projectsList) {
    callNextTick(
      parseDone,
      new Error('Missing Portals list from source board.')
    );
  } else {
    parseProjects(
      { projectsListId: projectsList.id, callTrelloAPI },
      parseDone
    );
  }
}

function parseProjects({ projectsListId, callTrelloAPI }, done) {
  // var dimensions = {};
  callTrelloAPI(
    { path: `lists/${projectsListId}/cards` },
    sb(parseProjectCards, done)
  );

  function parseProjectCards(res, cards) {
    callNextTick(done, null, cards.map(makeProjectFromCard));
  }
}

function makeProjectFromCard(card) {
  var project = parseNameTimeSpanString(card.name, 'neededTimeSpanTotal');
  project.id = card.id;
  project.projectTypes = pluck(card.labels, 'name');
  return project;
}

function parseNameTimeSpanString(s, timeSpanProperty) {
  var result = {};
  var nameTimeSpanPair = s.split(' - ');
  if (nameTimeSpanPair.length > 0) {
    result.name = nameTimeSpanPair[0];
  }
  if (nameTimeSpanPair.length > 1) {
    result[timeSpanProperty] = nameTimeSpanPair[1];
  } else {
    // Assume 1 hour.
    result[timeSpanProperty] = 1;
  }
  return result;
}

module.exports = parseLists;
