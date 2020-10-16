const sessionKey = 'signedIn';
const sessionValue = 'yes';

const Session = {
  signIn(request) {
    request.session[sessionKey] = sessionValue;
  },
  signedIn(request) {
    return request.session[sessionKey] === sessionValue;
  },
  signOut(request) {
    request.session[sessionKey] = null;
  },
};

module.exports = Session;