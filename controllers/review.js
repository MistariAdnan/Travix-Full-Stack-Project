const Listing = require("../models/listing.js");
const Review = require("../models/review.js");


module.exports.createReview = async(req, res) => {
    console.log(req.params.id);
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Created!");

    // console.log("new review saved");
    res.redirect(`/listings/${listing._id}`);
}


module.exports.deleteReview = async(req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //listing mese dlt krne k liye (reviwe ko) or using pull vo pull krdets mtlb dlt krta matched condtionn usinf id
    await Review.findByIdAndDelete(reviewId); //this for to dlt review
    req.flash("success", "Review Deleted!");

    res.redirect(`/listings/${id}`);
}