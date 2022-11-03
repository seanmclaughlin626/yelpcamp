// Requirements
const User = require("../models/user");

// Controls
module.exports.renderRegister = (req, res) => {
    res.render("users/register");
}

module.exports.registerUser = async(req, res) => {
    try{
    const {email, username, password} = req.body;
    const user = new User({email, username});
    const registeredUser = await User.register(user, password);
    console.log(registeredUser);
    req.login(registeredUser, err => {
        if(err) return next(err);
        req.flash("success", `Welcome to YelpCamp, ${username}!`);
        const redirectUrl = req.session.returnTo || "/campgrounds";
        delete req.session.returnTo;
        res.redirect(redirectUrl);
    })
    }
    catch(e){
        req.flash("error", e.message);
        res.redirect("/register");
    }
}

module.exports.renderLogin = (req, res) => {
    res.render("users/login");
}

module.exports.login = (req, res) => {
    // ^Note the middleware that passport provides us with. Magic!
    // COMMA AFTER THE GODDAMN MIDDLEWARE (except wrapAsync)
        const {username} = req.body;
        req.flash("success", `Welcome back, ${username}`);
        const redirectUrl = req.session.returnTo || "/campgrounds";
        delete req.session.returnTo;
        res.redirect(redirectUrl);
    }

module.exports.logout = (req, res) => {
    req.logout(err => {
        if(err) {
            return next(err);
        }
    req.flash("success", "See ya later!");
    res.redirect("/campgrounds");
    });
}