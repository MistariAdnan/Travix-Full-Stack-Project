const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");

// ==========================
// SIGNUP PAGE
// ==========================
router.get("/signup", (req, res) => {
    res.render("users/signup");
});


// ==========================
// SIGNUP POST
// ==========================
router.post("/signup", async (req, res, next) => {
    try {
        let { username, email, password } = req.body;

        // Create new user
        const user = new User({ email, username });

        // Register user with passport-local-mongoose
        const registeredUser = await User.register(user, password);

        // Auto login after signup
        req.login(registeredUser, (err) => {
            if (err) return next(err);

            req.flash("success", "Welcome to Travix 🎉");
            res.redirect("/listings");
        });

    } catch (e) {

        // 🔥 CUSTOM FRIENDLY ERROR HANDLING
        let msg = "Something went wrong";

        if (e.name === "UserExistsError") {
            msg = "Username already exists";
        } else if (e.code === 11000) {
            msg = "Email already registered";
        } else if (e.message.includes("Password")) {
            msg = "Password must be strong (min 6 characters)";
        } else {
            msg = e.message;
        }

        req.flash("error", msg);
        res.redirect("/signup");
    }
});


// ==========================
// LOGIN PAGE
// ==========================
router.get("/login", (req, res) => {
    res.render("users/login");
});


// ==========================
// LOGIN POST (FIXED)
// ==========================
router.post("/login", (req, res, next) => {

    passport.authenticate("local", (err, user, info) => {

        if (err) return next(err);

        // ❌ Login failed
        if (!user) {
            req.flash("error", "Invalid username or password");
            return res.redirect("/login");
        }

        // ✅ Login success
        req.logIn(user, (err) => {
            if (err) return next(err);

            req.flash("success", "Welcome back 👋");
            return res.redirect("/listings");
        });

    })(req, res, next);
});


// ==========================
// LOGOUT
// ==========================
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);

        req.flash("success", "Logged out successfully 👋");
        res.redirect("/listings");
    });
});

module.exports = router;