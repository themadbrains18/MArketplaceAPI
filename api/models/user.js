const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const bcrypt = require("bcrypt");
var Schema = mongoose.Schema;

const User = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        trim: true,
    },
    is_EmailVerified :{
        type: Boolean,
        default: false
    },
    passwordHash:{
        type: String,
        required: true,
        trim: true,
    }
}, { timestamps: true });

User.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.passwordHash);
};

User.virtual("password").set(function (value) {
    this.passwordHash = bcrypt.hashSync(value, 12);
});
// Export Model
User.plugin(passportLocalMongoose);

let userColl = mongoose.model("User", User); //create model/schema using mongoose

module.exports = {
    userColl
}