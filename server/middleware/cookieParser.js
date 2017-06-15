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
  
  next();
};

module.exports = parseCookies;