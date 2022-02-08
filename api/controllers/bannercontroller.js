const mongoose = require('mongoose');
var Schema = mongoose.Schema;

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

const getBanner= (req,res)=>{
    bannerColl.find().then((data) => {
        console.log("success banner data");
        let bannerData=[];
        if (data.length > 0) {
            for (let j = 0; j < data.length; j++) {
                bannerData.push(data[j]);
            }
            return res.status(200).send(bannerData);
        }
    }).catch((err) => {
        res.send(err);
    })
}

const deleteBanner=(req,res)=>{
    bannerColl.deleteOne({ _id: req.params.id }).then((data) => {
        res.send(data)
    }).catch((err) => {
        res.send(err);
    })
}


module.exports = {
    uploadBanner,
    getBanner,
    deleteBanner
}