if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

console.log("DB_URL:", process.env.DB_URL); // 👈 debug line
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOveride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

//routers
const reviewsRouter = require("./routes/review.js");
const listingsRouter = require("./routes/listing.js");
const UserRouter = require("./routes/User.js");



const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log("DB Error:", err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOveride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions = {
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    // console.log(res.locals.success);
    next();
})

app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", UserRouter);

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "page not found"));

});
app.use((err, req, res, next) => {
    let { statusCode = 790, message = "kuch to gadbad he" } = err;
    res.status(statusCode).render("error.ejs", { message });
});
const port = process.env.PORT || 8081;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});