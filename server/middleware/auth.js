const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  var currentId;

  Promise.resolve(req.cookies.shortlyid)
    .then(hash => {
      if (!hash) {
        throw hash;
      } 
      return models.Sessions.get({ hash });
    })
    .then(session => {
      if (session.userAgent === req.headers['user-agent'] || session.userAgent === null) {
        req.session = session;
        next();
      } else {
        models.Sessions.delete({ id: session.id })
          .then(() => {
            next();
          });
      }
    })
    .catch(() => {
      console.log('creating session');
      return models.Sessions.create(new Date())
        .then(session => {
          console.log('session', session);
          currentId = session.insertId;
          return models.Sessions.update({ id: session.insertId }, { userAgent: req.headers['user-agent'] });
        })
        .then(session => {
          return models.Sessions.get({ id: currentId });
        })
        .then(session => {
          req.session = session;
          res.cookie('shortlyid', session.hash);
          next();
        });
    });
};

module.exports.verifySession = (req, res, next) => {
  if (!models.Sessions.isLoggedIn(req.session)) {
    res.redirect('/login');
  } else {
    next();
  }
};