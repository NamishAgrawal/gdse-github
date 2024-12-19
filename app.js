const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const { google } = require('googleapis');
const OAuth2Data = require('./credentials.json');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const coursesRouter = require('./routes/courses');
const courses_create_editRouter = require('./routes/courses_create_edit');
const courseworksRouter = require('./routes/courseworks');

const app = express();

// OAuth2 setup
const { client_id, client_secret, redirect_uris } = OAuth2Data.web;
const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: 'asdfasdgfghdsflg;uirotj fdn sgoj', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, 
  })
);
app.use(express.static(path.join(__dirname, 'public')));

const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    if (req.originalUrl === '/login' || req.originalUrl.startsWith('/auth')) {
      return next(); 
    }
    
    return res.redirect('/login'); 
  }
  next(); 
};

// Routes
app.use('/', indexRouter); 
app.use('/users', usersRouter);

app.use('/courses', isAuthenticated, coursesRouter);
app.use('/courses_create_edit', isAuthenticated, courses_create_editRouter); 
app.use('/courseworks', isAuthenticated, courseworksRouter); 

app.get('/login', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/classroom.courses.readonly'], 
  });
  res.redirect(authUrl);
});

app.get('/auth', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Code not found.');

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const people = google.people('v1');
    const me = await people.people.get({ resourceName: 'people/me', auth: oauth2Client });
    req.session.user = { username: me.data.names[0].displayName, email: me.data.emailAddresses[0].value };
    const redirectTo = req.session.redirectTo || '/courses_create_edit';
    delete req.session.redirectTo; 
    res.redirect(redirectTo);
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).send('Authentication failed');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Could not log out');
    }
    res.redirect('/login');
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
