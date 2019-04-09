const bcrypt = require("bcryptjs");

module.exports = {

// #1
  ensureAuthenticated(req, res, next) {
    if (!req.user){
      req.flash("notice", "You must be signed in to do that.")
      return res.redirect("/");
    } else {
      next();
    }
  },

// #2
  comparePassword(userPassword, databasePassword) {
    return bcrypt.compareSync(userPassword, databasePassword);
  }
}
