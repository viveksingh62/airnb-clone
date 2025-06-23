const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const PassportLocalMongoose = require("passport-local-mongoose")

const userSchema = new Schema({
 email:{
        type:String,
        require:true
    },
}

)
userSchema.plugin(PassportLocalMongoose);

module.exports = mongoose.model('User', userSchema);