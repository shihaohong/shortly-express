const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  // if cookie doesnt exist
  var currentId;
  if (!req.cookies.shortlyid) {
    models.Sessions.create(new Date())
      .then(session => {
        currentId = session.insertId;
        return models.Sessions.update({ id: session.insertId }, { userAgent: req.headers['user-agent'] });
      })
      .catch(err => {
        console.error(err);
      })
      .then(session => {
        return models.Sessions.get({ id: currentId });
      })
      .catch(err => {
        console.error(err);
      })
      .then(session => {
        req.session = session;
        res.cookie('shortlyid', session.hash);
        next();
      }).catch(err => {
        console.error(err);
      });

  } else {
    models.Sessions.get({ hash: req.cookies.shortlyid })
      .then(session => {
        if (session === undefined) {
          models.Sessions.create(new Date())
            .then(session => {
              return models.Sessions.get({ id: session.insertId });
            })
            .catch(err => {
              console.error(err);
            })
            .then(session => {
              req.session = session;
              res.cookie('shortlyid', session.hash);
              next();
            })
            .catch(err => {
              console.error(err);
            });
        } else {
          if (session.userAgent === req.headers['user-agent'] || session.userAgent === null) {
            req.session = session;
            next();
          } else {
            models.Sessions.delete( { id: session.id } )
            .then(session => {
              next();
            })
            .catch(err => {
              console.error(err);
            });
          }
        }        
      })
      .catch(err => {
        console.error(err);
      });
  }  
};
