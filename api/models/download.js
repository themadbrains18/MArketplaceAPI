const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const bcrypt = require("bcrypt");
var Schema = mongoose.Schema;

const downloadSchema = new Schema({

    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    productid: {
        type: Schema.Types.ObjectId, ref: 'Product'
    },
}, { timestamps: true });


let downloadColl = mongoose.model("Download", downloadSchema); //create model/schema using mongoose

module.exports = {
    downloadColl
}