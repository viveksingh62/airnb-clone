const listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
//index
module.exports.index = async (req, res) => {
  const allListings = await listing.find({});
  res.render("./listings/index.ejs", { allListings });
};

//new form
module.exports.render = (req, res) => {
  res.render("./listings/new.ejs");
};
//
module.exports.post = async (req, res) => {
  //  if(!req.body.listing){
  //   throw new ExpressError(400, "Send valid dat for listings")
  //  }
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location, //query for map location example jaipur india
      limit: 1,
    })
    .send();
  // console.log(response.body.features[0].geometry);
  // ressend("done!");
  let url = req.file.path;
  let filename = req.file.filename;
  console.log(url, "...", filename);
  let listings = req.body.listing;

  const newListing = new listing(listings);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry=response.body.features[0].geometry;
 let savedListing= await newListing.save();
 console.log(savedListing)
  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

// show listings
module.exports.showListings = async (req, res) => {
  let { id } = req.params;
  const listings = await listing
    .findById(id)
    .populate({
      path: "review",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listings) {
    req.flash("error", "listing you requested for does not exist");
    return res.redirect("/listings");
  }
  // console.log(listings)
  res.render("./listings/show.ejs", { listings });
};

// edit listing form

module.exports.editListingform = async (req, res) => {
  let { id } = req.params;
  const listings = await listing.findById(id);
  if (!listings) {
    req.flash("error", "listing you requested for does not exist");
    return res.redirect("/listings");
  }

  let orginalImageUrl = listings.image.url;
  orginalImageUrl = orginalImageUrl.replace("/upload", "/upload/w_250");
  res.render("./listings/edit.ejs", { listings, orginalImageUrl });
};

//update listing

module.exports.updateListing = async (req, res) => {
  // if(!req.body.listing){
  //   throw new ExpressError(400, "Send valid dat for listings")
  //  }
  let { id } = req.params;

  let listings = await listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    listings.image = { url, filename };

    await listings.save();
  }

  req.flash("success", "listing updated!");
  res.redirect(`/listings/${id}`);
};

//delete listing
module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;

  await listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted");
  res.redirect("/listings");
};
