// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieSession = require('cookie-session');

const Posts = require('./posts');
const Session = require('./session');

app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser());
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.set('view engine', 'ejs');

function ifSignedIn(request, response, func) {
  if (!Session.signedIn(request)) {
    response.send(401, 'Not authorized');
  } else {
    func(request, response);
  }
}

function renderTemplate(response, request, template, locals={}) {
  response.render('layout', Object.assign({ template: template, signedIn: Session.signedIn(request) }, locals));
}

// HTML routes

app.post('/sessions', (request, response) => {
  if (request.body.password === process.env.PASSWORD) {
    Session.signIn(request);
    response.redirect('/');
  } else {
    renderTemplate(response, request, 'sessions/new', { error: true });
  }
});

app.delete('/sessions', (request, response) => {
  Session.signOut(request);
  response.redirect('/');
});

app.get('/sessions/new', (request, response) => {
  if (Session.signedIn(request)) { return response.redirect('/'); }
  renderTemplate(response, request, 'sessions/new', { error: false });
});

app.get('/', (request, response) => {
  Posts.all().then(posts => renderTemplate(response, request, 'posts/index', { posts: posts }));
});

app.get('/posts/new', (request, response) => {
  ifSignedIn(request, response, (request, response) => renderTemplate(response, request, 'posts/new'));
});

app.get('/posts/:id', (request, response) => {
  Posts.find(request.params.id).then(post => renderTemplate(response, request, 'posts/show', { post: post }));
});

app.post('/posts', (request, response) => {
  ifSignedIn(request, response, (request, response) => Posts.add(request.body).then(() => response.redirect('/')));
});

app.get('/posts/:id/edit', (request, response) => {
  ifSignedIn(request, response, (request, response) => Posts.find(request.params.id).then(post => renderTemplate(response, request, 'posts/edit', { post: post })));
});

app.put('/posts/:id', (request, response) => {
  ifSignedIn(request, response, (request, response) => Posts.update(request.params.id, request.body).then(() => response.redirect('/')));
});

app.delete('/posts/:id', (request, response) => {
  ifSignedIn(request, response, (request, response) => Posts.delete(request.params.id).then(() => response.redirect('/')));
});

// API routes

app.get('/api/posts', (request, response) => {
  Posts.all().then(posts => response.send({ posts: posts.map(post => post.forJson) }));
});

app.get('/api/posts/:id', (request, response) => {
  Posts.find(request.params.id).then(post => response.send(post.forJson));
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
