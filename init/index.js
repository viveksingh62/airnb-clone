const mongoose = require("mongoose");
const initData = require("./data.js")   
const listing = require("../models/listing.js")

main().then(()=>{"connected to db"}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');


}

const initDB = async ()=>{
    await listing.deleteMany({})
     initData.data =  initData.data.map((obj)=>({...obj,owner:"684d18f4030227588cf0cf44"}))
    await listing.insertMany(initData.data)
    console.log("data was intialized")
}

initDB(); 