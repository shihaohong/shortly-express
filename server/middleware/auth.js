const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  // if cookie doesnt exist
  if (!req.cookies.shortlyid) {
    models.Sessions.create(new Date())
      .then(session => {
        return models.Sessions.get({ id: session.insertId });
      })
      .catch(err => {
        console.error(err);
        res.end();
      })
      .then(session => {
        // models.Sessions.update({ userAgent: req.headers['User-Agent'] });
        req.session = session;
        res.cookie('shortlyid', session.hash);
        res.end();
        next();
      })
      .catch(err => {
        console.error(err);
        res.end();
      });
  } else {
    // look at req.headers['User-Agent']
    // 
    models.Sessions.get({ hash: req.cookies.shortlyid })
      .then(session => {
        if (session === undefined) {
          models.Sessions.create(new Date())
            .then(session => {
              return models.Sessions.get({ id: session.insertId });
            })
            .catch(err => {
              console.error(err);
              res.end();
            })
            .then(session => {
              req.session = session;
              console.log('--------reqsession', req.session);
              res.cookie('shortlyid', session.hash);
              res.end();
              next();
            })
            .catch(err => {
              console.error(err);
              res.end();
            });
        } else {
          req.session = session;
          res.end();
          next();
        }        
      })
      .catch(err => {
        console.error(err);
        res.end();
      });
  }  
};
