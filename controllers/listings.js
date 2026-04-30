const Listing = require("../models/listing.js");

/* =========================
   INDEX + SEARCH + SORT
========================= */
module.exports.index = async (req, res) => {

    const search = req.query.search || "";
    const sort = req.query.sort || "";

    let query = {};

    // SEARCH LOGIC
    if (search.trim() !== "") {
        query = {
            $or: [
                { title: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
                { country: { $regex: search, $options: "i" } }
            ]
        };
    }

    let listingsQuery = Listing.find(query);

    // SORT LOGIC
    if (sort === "low") {
        listingsQuery = listingsQuery.sort({ price: 1 });
    } else if (sort === "high") {
        listingsQuery = listingsQuery.sort({ price: -1 });
    }

    const allListing = await listingsQuery;

    res.render("listings/index", {
        allListing,
        search,
        sort
    });
};


/* =========================
   NEW FORM
========================= */
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};


/* =========================
   SHOW LISTING
========================= */
module.exports.ShowListing = async (req, res) => {

    let { id } = req.params;

   const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    })
    .populate("owner");

    if (!listing) {
        req.flash("error", "Requested Listing Does Not Exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};


/* =========================
   CREATE LISTING (SAFE)
========================= */
module.exports.createListing = async (req, res, next) => {
    try {

        const newListing = new Listing(req.body.listing);

        newListing.owner = req.user._id;

        // SAFE IMAGE HANDLING
        if (req.file) {
            newListing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        } else {
            newListing.image = {
                url: "https://via.placeholder.com/400",
                filename: "default"
            };
        }

        await newListing.save();

        req.flash("success", "New Listing Created!");
        res.redirect(`/listings/${newListing._id}`);

    } catch (err) {
        next(err);
    }
};


/* =========================
   EDIT FORM
========================= */
module.exports.renderEditForm = async (req, res) => {

    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Requested Listing Does Not Exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image?.url;

    if (originalImageUrl) {
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_200");
    }

    res.render("listings/edit", {
        listing,
        originalImageUrl,
    });
};


/* =========================
   UPDATE LISTING
========================= */
module.exports.updateListing = async (req, res) => {

    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { new: true }
    );

    // IMAGE UPDATE SAFE
    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};


/* =========================
   DELETE LISTING
========================= */
module.exports.deleteListing = async (req, res) => {

    let { id } = req.params;

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};