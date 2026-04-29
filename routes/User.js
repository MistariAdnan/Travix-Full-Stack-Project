const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");

// SIGNUP PAGE
router.get("/signup", (req, res) => {
    res.render("users/signup");
});

// SIGNUP POST
router.post("/signup", async (req, res, next) => {
    try {
        let { username, email, password } = req.body;

        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);

            req.flash("success", "Welcome to the platform!");
            res.redirect("/listings");
        });

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
});

// LOGIN PAGE
router.get("/login", (req, res) => {
    res.render("users/login");
});

// LOGIN
router.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
    }),
    (req, res) => {
        req.flash("success", "Welcome back!");
        res.redirect("/listings");
    }
);

// LOGOUT
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);

        req.flash("success", "Logged out successfully!");
        res.redirect("/listings");
    });
});

module.exports = router;