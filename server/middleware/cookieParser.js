const parseCookies = (req, res, next) => {

  if (req.headers.cookie === undefined) {
    req.cookies = {};
  } else {
    var parsedCookie = req.headers.cookie.split('; ');
    var individualCookies = {};
    parsedCookie.forEach((cookie, idx) => {
      var splitCookies = cookie.split('=');
      individualCookies[splitCookies[0]] = splitCookies[1];
    });

    req.cookies = individualCookies;
  }
  
  res.end();
  next();
};

module.exports = parseCookies;

/*
'shortlyid=18ea4fb6ab3178092ce936c591ddbb90c99c9f66; 
otherCookie=2a990382005bcc8b968f2b18f8f7ea490e990e78; 
anotherCookie=8a864482005bcc8b968f2b18f8f7ea490e577b20'
*/