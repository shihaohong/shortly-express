const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const cookieParser = require('./middleware/cookieParser');
const models = require('./models');
const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use(cookieParser);
app.use(Auth.createSession);


app.get('/', 
(req, res) => {
  res.render('index');
});

app.get('/create', 
(req, res) => {
  res.render('index');
});

app.get('/links', 
(req, res, next) => {
  models.Links.getAll()
    .then(links => {
      res.status(200).send(links);
    })
    .error(error => {
      res.status(500).send(error);
    });
});

app.post('/links', 
(req, res, next) => {
  var url = req.body.url;
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    return res.sendStatus(404);
  }

  return models.Links.get({ url })
    .then(link => {
      if (link) {
        throw link;
      }
      return models.Links.getUrlTitle(url);
    })
    .then(title => {
      return models.Links.create({
        url: url,
        title: title,
        baseUrl: req.headers.origin
      });
    })
    .then(results => {
      return models.Links.get({ id: results.insertId });
    })
    .then(link => {
      throw link;
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(link => {
      res.status(200).send(link);
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

// DO SOMETHING HERE FOR AUTH.JS
  // analyze cookies here

  // if cookie matches a session, log into user automatically
  // redirect to index

  // else, just stay in login

app.get('/login', (req, res, next) => {
  res.render('login');
});

app.get('/signup', (req, res, next) => {
  res.render('signup');
});

app.get('/logout', (req, res, next) => {
  // delete the session
  res.clearCookie('shortlyid');
    

  models.Sessions.delete({ hash: req.cookies['shortlyid'] })
    .then(session => {
      res.redirect('/login');
    })
    .catch(err => {
      console.error(err);
      res.redirect('/login');
    });
  // then, delete the cookie
});

app.post('/login', (req, res, next) => {
  var user = req.body; // stores user data

  models.Users.get({ username: user.username })
    .then(results => {
      if (results === undefined) {
        res.redirect('/login');
      } else {
        // validate password since user does exist
        var isPasswordCorrect = models.Users.compare(user.password, results.password, results.salt);
    
        if (isPasswordCorrect) {
          // call sessions somehow over here to check user's cookies or creates a cookie for the user
          res.redirect('/login');
        } else {
          res.redirect('/login');
        }
      }
    })
    .catch(err => {
      console.error('error', err);
      res.end();
    });

});

app.post('/signup', (req, res, next) => {
  var user = req.body; // stores user data

  // check to see if user exists
  models.Users.get({ username: user.username })
    .then(results => {
      if (results === undefined) {
        models.Users.create(user);
        res.redirect('/');
      } else {
        res.redirect('/signup');
      }
    })
    .catch(err => {
      console.error('error', err);
      res.end();
    });
});


/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
