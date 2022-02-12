const mongoose = require('mongoose');
const fs = require("fs")

const bannerSchema = new mongoose.Schema({

    image: {
        type: String,
        required: true,
        trim: true,
    },
}, { timestamps: true });

let bannerColl = mongoose.model("Banner", bannerSchema); //create schema of Banner slider

// API upload Banner slider
const uploadBanner = (req, res) => {
    console.log(req.files.length);
    let bannerloaddata = [];
    for (let i = 0; i < req.files.length; i++) {
        let imageurl = req.files[i].filename;
        console.log("file name : " + imageurl);
        var loadData = { image: imageurl };
        bannerColl.create(loadData).then((result) => {
            bannerloaddata.push(result);
            console.log(result);
            if (req.files.length === bannerloaddata.length) {
                res.send({ status: 200, sliderdata: bannerloaddata, message: "You have save banner slide successfully" });
            }
        }).catch((err) => {
            res.send(err);
        })
    }
}

const getBanner = (req, res) => {
    bannerColl.find().then((data) => {
        let bannerData = [];
        if (data.length > 0) {
            for (let j = 0; j < data.length; j++) {
                bannerData.push(data[j]);
            }
            return res.status(200).send(bannerData);
        }
        else{return res.status(200).send(bannerData);}
    }).catch((err) => {
        res.send(err);
    })
}

const deleteBanner = (req, res) => {
    bannerColl.findOne({ _id: req.params.id }).then((result)=>{
        console.log("banner image " +result.image)
        bannerColl.deleteOne({ _id: req.params.id }).then((data) => {
            if(data.deletedCount>0){
                const pathToFile = './public/images/' +result.image
                fs.unlink(pathToFile, function (err) {
                    if (err) {
                        throw err
                    } else {
                        console.log("Successfully deleted the file.")
                        res.send(data)
                    }
                })
            }
        }).catch((err) => {
            res.send(err);
        })
    }).catch((err) => {
        res.send(err);
    })
    
}


module.exports = {
    uploadBanner,
    getBanner,
    deleteBanner
}