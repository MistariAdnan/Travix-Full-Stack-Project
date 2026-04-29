const User = require("../models/user.js");


module.exports.rendersignupform = (req, res) => {
    res.render("users/signup.ejs");
}
module.exports.renderloginform = (req, res) => {
    res.render("users/login.ejs");
}



module.exports.Signup = async(req, res) => {
    try {

        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registerdUser = await User.register(newUser, password);
        console.log(registerdUser);
        req.login(registerdUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "User Was Registered Successfully ");
            res.redirect("/listings");
        })

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }


}


module.exports.successlogin = async(req, res) => {
    req.flash("success",
        "Login Succesfully");
    let redirectUrl = res.locals.redirectUrl || "/listings";

    res.redirect(redirectUrl);
    // res.redirect("/listings/new");
}


module.exports.successlogout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "you logget out");
        res.redirect("/listings");

    })
}