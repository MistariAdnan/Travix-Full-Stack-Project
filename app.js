const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOveride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
// const wrapAsync = require("./utils/wrapAsync.js");
// const { listingSchema, reviewSchema } = require("./schema.js");
// const Review = require("./models/review.js");
// const review = require("./models/review.js");
// const Listing = require("./models/listing.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

//routers
const reviewsRouter = require("./routes/review.js");
const listingsRouter = require("./routes/listing.js");
const UserRouter = require("./routes/User.js");




const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
//to call function
main().then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

//databse k liyewrapAsync(
async function main() {
    await mongoose.connect(MONGO_URL);

}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOveride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};
// app.get("/", (req, res) => {
//     res.send("Hi,I am Root");
// });
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

// app.get("/demouser", async(req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "sigma-student"
//     });
//     const registerdUser = await User.register(fakeUser, "hiWorld");
//     res.send(registerdUser);
// })

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
app.listen(8081, () => {

    console.log("server is listening to port 8081");
});