const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});
UserSchema.plugin(passportLocalMongoose);
// ^Adds on a username, field for password, makes sure
// usernames are unique, and provides additional methods 

module.exports = mongoose.model("User", UserSchema);