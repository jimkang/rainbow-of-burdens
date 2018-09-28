// routeDict should be a dictionary derived from the URL route. It can be empty, but not undefined.
// store should be an object that behaves like localStorage. It can be empty, but not undefined.
function findToken({ routeDict, store, currentDate, tokenLifeInDays }) {
  var token;

  if ('token' in routeDict) {
    token = routeDict.token;
    store.tokenInfo = JSON.stringify({
      token: token,
      expires: currentDate.getTime() + tokenLifeInDays * 24 * 60 * 60 * 1000
    });
  } else if (store.tokenInfo) {
    var tokenInfo = JSON.parse(store.tokenInfo);
    if (tokenInfo.expires > currentDate.getTime()) {
      token = tokenInfo.token;
    }
  }

  return token;
}

module.exports = findToken;
