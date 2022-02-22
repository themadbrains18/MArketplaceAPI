const mongoose = require('mongoose');
const fs = require("fs")
var Schema = mongoose.Schema;

const productDownloadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    file: {
        type: String,
        required: true,
        trim: true,
    },
    productid: {
        type: String,
        required: true,
    },
}, { timestamps: true });

let productDownloadColl = mongoose.model("ProductDownloadFile", productDownloadSchema); //create schema of product slider

// API upload product preview file in productpreview collection/table
const uploadDownloadFile = (req, res) => {
    const { productid } = req.body;
    console.log(productid);
    productDownloadColl.find({ productid: productid }).then((result) => {
        if (result.length > 0) {
            for (let j = 0; j < result.length; j++) {
                console.log("image Name "+ result[j].file);
                const pathToFile = './public/images/' + result[j].file
                fs.unlink(pathToFile, function (err) {
                    if (err) {
                        throw err
                    } else {
                        console.log("Successfully deleted the file.")
                    }
                })
            }
            deleteFile(productid,req,res);
        }
        else {
            deleteFile(productid,req,res);
        }
    })

}

const deleteFile = (productid, req, res) => {
    productDownloadColl.deleteMany({ productid: productid }).then((data) => {
        console.log(data);
        if (data.ok > 0) {
            for (let i = 0; i < req.files.length; i++) {
                let fileurl = req.files[i].filename;
                console.log("file name : " + fileurl);
                var loadData = { productid: productid, file: fileurl, name : fileurl };
                productDownloadColl.create(loadData).then((result) => {
                    res.send({ status: 200, message: "You have save download file successfully" });
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
    uploadDownloadFile,
    productDownloadColl
}