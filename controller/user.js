const User = require("../models/user");

//signup form
module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

//loginform
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

//signup
module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "welcome to wanderlust");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

//login

module.exports.login = async (req, res) => {
  req.flash("success", "welcome to wanderlust! You are logged in!");
  res.redirect(res.locals.redirectUrl || "/listings");
  console.log(res.locals.redirectUrl);
};

//logout
module.exports.logout = (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you are logout");
    res.redirect("/listings");
  });
};
