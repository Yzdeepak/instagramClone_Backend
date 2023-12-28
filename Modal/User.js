const mongoose = require("mongoose")
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    email: {
        type: String,
        unique: true,
        require: true

    },
    profile: {
        type: String,
    },
    followers: {
        type: Array
    },
    following: {
        type: Array
    },
    password: {
        type: String,
        require: true
    }



}, { timestamps: true })
module.exports = mongoose.model("User", UserSchema)