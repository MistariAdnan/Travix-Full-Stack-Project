const express = require("express");
const router = express.Router();

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

const multer = require("multer");
const { storage } = require("../cloudconfig.js");
const upload = multer({ storage });

/* ===============================
   FILTER ROUTE
================================ */
router.get("/filter", async (req, res) => {

    let { category } = req.query;

    let filter = {};

    if (category && category !== "All") {
        filter.category = category;
    }

    let listings = await Listing.find(filter);

    res.render("listings/index", {
        allListing: listings   // ✅ FIXED
    });
});


/* ===============================
   INDEX + CREATE
================================ */
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single("image"),   // ✅ FIXED HERE
        validateListing,
        wrapAsync(listingController.createListing)
    );


/* ===============================
   NEW FORM
================================ */
router.get("/new", isLoggedIn, listingController.renderNewForm);


/* ===============================
   SHOW + UPDATE + DELETE
================================ */
router.route("/:id")
    .get(wrapAsync(listingController.ShowListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.single("image"),   // ✅ FIXED HERE
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.deleteListing)
    );


/* ===============================
   EDIT FORM
================================ */
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));


/* ===============================
   BOOKING ROUTE
================================ */
router.post("/:id/book", isLoggedIn, wrapAsync(async (req, res) => {

    let { id } = req.params;

    let listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    if (listing.isBooked) {
        req.flash("error", "Already Reserved!");
        return res.redirect(`/listings/${id}`);
    }

    listing.isBooked = true;
    listing.bookedBy = req.user._id;

    await listing.save();

    req.flash("success", "Reservation Successful 🎉");
    res.redirect(`/listings/${id}/success`);
}));


/* ===============================
   SUCCESS PAGE
================================ */
router.get("/:id/success", isLoggedIn, wrapAsync(async (req, res) => {

    let { id } = req.params;

    let listing = await Listing.findById(id);

    res.render("listings/success.ejs", { listing });
}));


module.exports = router;