require("dotenv").config();

const express = require("express");
const app = express();
// use for file upload
const multer = require("multer");
const { storage, cloudinary } = require("./coludConfig.js");
const upload = multer({ storage });
const router = express.Router({ mergeParams: true });
const mongoose = require("mongoose");
const listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { error } = require("console");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./router/user.js");
const {
  isLoggedin,
  isOwner,
  validateSchema,
  validateReview,
  isReviewAuthor,
} = require("./middlewares.js");

const listingController = require("./controller/listings.js");
const reviewController = require("./controller/review.js");

app.engine("ejs", ejsmate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

const dbUrl = process.env.ATLASDB_URL;
main()
  .then(() => {
    "connected to db";
  })
  .catch((err) => console.log(err));

async function main() {
  // await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
  await mongoose.connect(dbUrl);
}
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});
store.on("error", (err) => {
  console.log("error in mongo session store", err);
});
const sessionOptions = {
  store,
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
  // console.log(res.locals)
  next();
});
let port = 8080;
//router for user

app.use("/", userRouter);

// app.get("/demouser",async(req,res)=>{
//   let fakeUser = new User({
//       email:"student@gmail.com",
//       username:"delta-student"
//   })
//   let registeredUser=await User.register(fakeUser,"helloworld")
// res.send(registeredUser)
// })


// app.get("/", (req, res) => {
//   res.send("server is working");
// });

app
  .route("/listings")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedin,
    upload.single("listing[image]"),
    validateSchema,
    wrapAsync(listingController.post)
  );

app.get("/listing/new", isLoggedin, listingController.render);

app
  .route("/listings/:id")
  .get(wrapAsync(listingController.showListings))
  .put(
    isLoggedin,

    isOwner,
    upload.single("listing[image]"),
    validateSchema,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedin, isOwner, wrapAsync(listingController.deleteListing));

app.get(
  "/listing/:id/edit",
  isLoggedin,
  isOwner,
  wrapAsync(listingController.editListingform)
);

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong" } = err;
  // res.status(statusCode).send(message)
  res.status(statusCode).render("Error.ejs", { message });
});

//-------Review--------------------

app.post(
  "/listings/:id/reviews",
  isLoggedin,
  validateReview,
  wrapAsync(reviewController.createReview)
);

//delete review route

app.delete(
  "/listings/:id/reviews/:reviewid",
  isLoggedin,
  isReviewAuthor,
  wrapAsync(reviewController.destroyReview)
);

// app.get("/testListing",async (req,res)=>{
//   let sampleListing = new listing({

//     title:"my home",
//     description:"by the beach",
//     price:1200,
//      location : "mumbai,delhi",
//      country:"india"
//   }
//   )
//   await sampleListing.save();
//   console.log("sample was saved")
//   res.send("successfull")
// })
app.listen(port, () => {
  console.log("server is listening");
});
