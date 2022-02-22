const mongoose = require('mongoose');
const fs = require("fs")
var Schema = mongoose.Schema;

const sliderSchema = new mongoose.Schema({

    image: {
        type: String,
        required: true,
        trim: true,
    },
    productid: {
        type: String,
        required: true,
    }
}, { timestamps: true });

let sliderColl = mongoose.model("Slider", sliderSchema); //create schema of product slider

// API upload product preview file in productpreview collection/table
const uploadSlider = (req, res) => {
    const { productid } = req.body;
    sliderColl.find({ productid: productid }).then((result) => {
        deleteSlider(productid,req,res);
        // if (result.length > 0) {
        //     for (let j = 0; j < result.length; j++) {
        //         const pathToFile = './public/images/' + result[j].image
        //         fs.unlink(pathToFile, function (err) {
        //             if (err) {
        //                 throw err
        //             } else {
        //                 console.log("Successfully deleted the file.")
        //             }
        //         })
        //     }
        //     deleteSlider(productid,req,res);
        // }
        // else {
        //     deleteSlider(productid,req,res);
        // }
    })

}

const deleteSlider = (productid,req,res) => {
    sliderColl.deleteMany({ productid: productid }).then((data) => {
        if (data.ok > 0) {
            let sliderloaddata = [];
            for (let i = 0; i < req.files.length; i++) {
                let imageurl = req.files[i].filename;
                var loadData = { productid: productid, image: imageurl };
                sliderColl.create(loadData).then((result) => {
                    sliderloaddata.push(result);
                    if (req.files.length === sliderloaddata.length) {
                        res.send({ status: 200, sliderdata: sliderloaddata, message: "You have save Slider successfully" });
                    }
                }).catch((err) => {
                    res.send(err);
                })
            }
        }
    }).catch((err) => {
        res.send(err);
    })
}


module.exports = {
    uploadSlider,
    sliderColl
}