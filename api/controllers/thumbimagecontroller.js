//thumbimagecontroller
const mongoose = require('mongoose');
const fs = require("fs")

const heroSchema = new mongoose.Schema({

    image: {
        type: String,
        required: true,
        trim: true,
    },
    productid: {
        type: String,
        required: true,
    },
}, { timestamps: true });

let productThumbImageColl = mongoose.model("ProductThumbImage", heroSchema);

// API upload product Hero image file in product hero image collection/table
const uploadThumbImage = (req, res) => {
    const { productid } = req.body;
    productThumbImageColl.find({ productid: productid }).then((result) => {
        deletePreview(productid,req,res);
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
        //     deletePreview(productid,req,res);
        // }
        // else {
        //     deletePreview(productid,req,res);
        // }
    })
}

const deletePreview = (productid,req,res) => {
    productThumbImageColl.deleteMany({ productid: productid }).then((data) => {
        if (data.ok > 0) {
            let preloaddata = [];
            for (let i = 0; i < req.files.length; i++) {
                let imageurl = req.files[i].filename;
                var loadData = { productid: productid, image: imageurl };
                productThumbImageColl.create(loadData).then((result) => {
                    preloaddata.push(result);
                    if (req.files.length === preloaddata.length) {
                        res.send({ status: 200, previewloaddata: preloaddata, message: "You have save thumb image successfully" });
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
    uploadThumbImage,
    productThumbImageColl
}