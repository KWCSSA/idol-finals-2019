const auth = require("basic-auth");
const dotenv = require("dotenv");
dotenv.config();
const admins = { admin: { password: "kwcssa2019" } };

module.exports = function(request, response, next) {
  var user = auth(request);
  if (!user || !admins[user.name] || admins[user.name].password !== user.pass) {
    response.set("WWW-Authenticate", 'Basic realm="example"');
    return response.status(401).send();
  }
  return next();
};
