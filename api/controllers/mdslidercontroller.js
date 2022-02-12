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
        type: Schema.Types.ObjectId, ref: 'Product'
    },
}, { timestamps: true });

let sliderColl = mongoose.model("Slider", sliderSchema); //create schema of product slider

// API upload product preview file in productpreview collection/table
const uploadSlider = (req, res) => {
    const { productid } = req.body;
    console.log(productid);
    console.log(req.files.length);
    sliderColl.find({ productid: productid }).then((result) => {
        if (result.length > 0) {
            for (let j = 0; j < result.length; j++) {
                console.log("image Name "+ result[j].image);
                const pathToFile = './public/images/' + result[j].image
                fs.unlink(pathToFile, function (err) {
                    if (err) {
                        throw err
                    } else {
                        console.log("Successfully deleted the file.")
                    }
                })
            }
            deleteSlider(productid,req,res);
        }
        else {
            deleteSlider(productid,req,res);
        }
    })

}

const deleteSlider = (productid,req,res) => {
    sliderColl.deleteMany({ productid: productid }).then((data) => {
        console.log(data);
        if (data.ok > 0) {
            let sliderloaddata = [];
            for (let i = 0; i < req.files.length; i++) {
                let imageurl = req.files[i].filename;
                console.log("file name : " + imageurl);
                var loadData = { productid: productid, image: imageurl };
                sliderColl.create(loadData).then((result) => {
                    sliderloaddata.push(result);
                    console.log(result);
                    if (req.files.length === sliderloaddata.length) {
                        res.send({ status: 200, sliderdata: sliderloaddata, message: "You have save Slider successfully" });
                    }
                }).catch((err) => {
                    res.send(err);
                })
            }


        }

        // res.send(data)
    }).catch((err) => {
        res.send(err);
    })
}


module.exports = {
    uploadSlider,
    sliderColl
}