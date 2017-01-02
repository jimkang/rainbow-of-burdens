var request = require('basic-browser-request');

const trelloAPIBase = 'https://api.trello.com/1';

function CallTrelloAPI({key, token}) {
  return callTrelloAPI;

  function callTrelloAPI({path}, done) {
    var reqOpts = {
      method: 'GET',
      url: `${trelloAPIBase}/${path}?key=${key}&token=${token}`,
      json: true
    };
    request(reqOpts, done);
  }
}

module.exports = CallTrelloAPI;
