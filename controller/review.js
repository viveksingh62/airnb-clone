const Review = require("../models/review");
const listing =  require("../models/listing")

module.exports.createReview = async (req, res) => {
    console.log(req.body);
    let { id } = req.params;
    let listings = await listing.findById(id);

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview);
    listings.review.push(newReview);
    await newReview.save();
    await listings.save();
    console.log("new review saved");
    req.flash("success", "New review added!");
    res.redirect(`/listings/${id}`);
  }

  module.exports.destroyReview = async (req, res) => {
    let { id, reviewid } = req.params;

    await listing.findByIdAndUpdate(id, { $pull: { review: reviewid } });

    await Review.findByIdAndDelete(reviewid);
    req.flash("success", "One review deleted!");
    res.redirect(`/listings/${id}`);
  }