const Listing = require("./models/listing.js")
const Review= require("./models/review.js")
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
module.exports.isLoggedin = (req,res,next)=>{
    if(!req.isAuthenticated()){
      //redirectUrl save
      if (req.method === "GET") {
      req.session.redirectUrl = req.originalUrl;
    }
    req.flash("error","you must be logged in to create listing!")
   return res.redirect("/login")  // use return
  }
  next()
}

module.exports.saveRedirectUrl = (req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl = req.session.redirectUrl; 
  }
  next()
}

module.exports.isOwner = async(req,res,next)=>{
      let { id } = req.params;
let listing = await Listing.findById(id)
if(!listing.owner.equals(res.locals.currUser._id)){
  req.flash("error","you are not owner of the listing")
 return res.redirect(`/listings/${id}`);
}
next()
}

module.exports.validateSchema = (req, res, next) => {
 const { error } = listingSchema.validate(req.body);
  console.log(error);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
};
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  console.log(req.body.review);
  console.log(error);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
    next();
};

module.exports.isReviewAuthor = async(req,res,next)=>{
      let {id, reviewid } = req.params;
let review  = await Review.findById( reviewid)
if(!review.author.equals(res.locals.currUser._id)){
  req.flash("error","you are not owner of the review")
 return res.redirect(`/listings/${id}`);
}
next()
}