const express = require("express");
const router = express.Router({ mergeParams: true }); //all post routes

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn, isOwner, isReviewAuthor } = require("../middleware.js")

const reviewConroller = require("../controllers/review.js")





//reviews route
// reviews ka post route he 

//common part--listings/:id/reviews
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewConroller.createReview));

//dlt review route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewConroller.deleteReview));

module.exports = router;