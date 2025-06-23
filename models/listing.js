const mongoose = require("mongoose");
const Review = require("./review.js");

const Schema = mongoose.Schema;

const listSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url:String,
    filename:String
  },
  price: Number,
  location: String,
  country: String,
  review:[{
    type:Schema.Types.ObjectId,
    ref:"Review"
  }
  ],
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User"
  },
  geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
})

listSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
await Review.deleteMany({_id:{$in:listing.review}})
  }

})

const Listing = mongoose.model("Listing", listSchema);
module.exports = Listing;
