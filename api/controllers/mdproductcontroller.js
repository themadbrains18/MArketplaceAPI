const mongoose = require('mongoose');
const fs = require("fs");
var { sliderColl } = require('./mdslidercontroller');
var { previewColl } = require('./mdpreviewcontroller');
var { productDownloadColl } = require('./mdproductdownloadcontroller');
var {productHeroImageColl}=require('./heroimagecontroller');
var {productThumbImageColl}=require('./thumbimagecontroller');
var{toolColl}=require('./mdtoolscontroller');

var Schema = mongoose.Schema;


const productSchema = new mongoose.Schema({
    adminname: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
    },
    category: {
        type: Schema.Types.ObjectId, ref: 'Category'
    },
    image: {
        type: String,
        required: true,
        trim: true,
    },
    overview: {
        type: String,
        trim: true,
    },
    highlight: {
        type: String,
        trim: true,
    },
    sharelink: {
        type: String,
    },
    subcategory: {
        type: Schema.Types.ObjectId, ref: 'Subcategory'
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    template: {
        type: String,
        required: true,
        trim: true,
    },
    tools:{
        type: String,
    },
    fonts:{
        type: String,
    }
    ,
    productstatus:{
        type: String,
        required: true,
        trim: true,
    },
    thumbNail:{
        type: String,
    },
    seodescription:{
        type: String,
    },
    seokeywords:{
        type: String,
    }

}, { timestamps: true });

let productColl = mongoose.model("Product", productSchema); //create model/schema using mongoose

// API Save product
const saveproduct = async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).send({ auth: false, message: 'unauthorized user.' });
    }
    let data = {
        "adminname": req.body.admin, "category": req.body.category, "highlight": req.body.highlight,
        "image": req.file.filename, "overview": req.body.overview, "sharelink": req.body.link, 
        "subcategory": req.body.subcategory, "title": req.body.title, "tools": req.body.tools,
        "template" : req.body.template, "fonts": req.body.fonts, "productstatus": req.body.productstatus,
        "seodescription": req.body.seodescription,"seokeywords":req.body.seokeywords
    }

    productColl.findOne({ title: req.body.title }).then(function (result) {
        if (result) {
            return res.send({ status: 401, message: 'Product already exist.' });
        }
        else {
            productColl.create(data).then((productdata) => {
                // update slider table productid
                sliderColl.find({ productid: req.body.tempId }).then((result) => {
                    if (result.length > 0) {
                        for (let j = 0; j < result.length; j++) {
                            sliderColl.findOneAndUpdate({ productid: req.body.tempId }, {"productid": productdata._id}).then((data) => {
                                console.log('slider productid update successfully');
                            }).catch((err) => {
                                res.send(err);
                            })
                        }
                    }
                })
                // update preview table productid
                previewColl.find({ productid: req.body.tempId }).then((resultpre) => {
                    if (resultpre.length > 0) {
                        for (let j = 0; j < resultpre.length; j++) {
                            previewColl.findOneAndUpdate({ productid: req.body.tempId }, {"productid": productdata._id}).then((data) => {
                                console.log('preview productid update successfully');
                            }).catch((err) => {
                                res.send(err);
                            })
                        }
                    }
                })

                // update downloadable table productid
                productDownloadColl.find({ productid: req.body.tempId }).then((fileitem)=>{
                    if (fileitem.length > 0){
                        productDownloadColl.findOneAndUpdate({ productid: req.body.tempId }, {"productid": productdata._id}).then((data) => {
                            console.log('download file productid update successfully');
                        }).catch((err) => {
                            res.send(err);
                        })
                    }
                })
                
                // update hero image table productid
                productHeroImageColl.find({ productid: req.body.tempId }).then((heroitem)=>{
                    if (heroitem.length > 0){
                        productHeroImageColl.findOneAndUpdate({ productid: req.body.tempId }, {"productid": productdata._id}).then((data) => {
                            console.log('hero image productid update successfully');
                        }).catch((err) => {
                            res.send(err);
                        })
                    }
                })
                
                // update thumb image table productid
                productThumbImageColl.find({ productid: req.body.tempId }).then((thumbitem)=>{
                    if (thumbitem.length > 0){
                        productThumbImageColl.findOneAndUpdate({ productid: req.body.tempId }, {"productid": productdata._id}).then((data) => {
                            console.log('thumb image productid update successfully');
                        }).catch((err) => {
                            res.send(err);
                        })
                    }
                })
                res.send({ status: 200, productdata: productdata, message: "You have save product successfully" });
            }).catch((err) => {
                res.send(err);
            })
        }
    }).catch((err) => {
        res.send(err);
    })
}

// API List of all  product 
const getAllProduct = async (req, res) => {
    // const token = req.headers['authorization'];
    // if (!token) {
    //     return res.status(401).send({ auth: false, message: 'unauthorized user.' });
    // }
    productColl.find().populate('category').populate('subcategory').then((data) => {
        let listData=data;
        if(data.length>0){
            let j=0;
            for(let i=0; i<listData.length;i++){
                productThumbImageColl.findOne({productid: listData[i]._id}).then((list)=>{
                    j++;
                    if(list){
                        listData[i].thumbNail=list.image;
                    }
                    else{
                        listData[i].thumbNail='';
                    }
                    if(listData.length==j){
                        console.log("return response");
                        res.status(200).send(listData)
                    }
                })
            }
        }
        
    }).catch((err) => {
        res.send(err);
    })
}

// API Delete  product using product id
const deleteproduct = async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).send({ auth: false, message: 'unauthorized user.' });
    }
    productColl.findOne({ _id: req.params.id }).then((result) => {
        if (result) {
            // product slider remove from productslider table and image file from directory
            sliderColl.find({ productid: req.params.id }).then((resultslider) => {
                if (resultslider.length > 0) {
                    for (let j = 0; j < resultslider.length; j++) {
                        const pathToFile = './public/images/' + resultslider[j].image
                        fs.unlink(pathToFile, function (err) {
                            if (err) {
                                throw err
                            } else {
                                console.log("Successfully deleted the file.")
                            }
                        })
                    }
                    sliderColl.deleteMany({ productid: req.params.id }).then((removedata) => {
                        console.log("slider remove : " + removedata);
                    })
                }
            }).catch((err) => {
                res.send(err);
            });

            // product preview remove from productpreview table and image file from directory
            previewColl.find({ productid: req.params.id }).then((resultpre) => {
                if (resultpre.length > 0) {
                    for (let j = 0; j < resultpre.length; j++) {
                        const pathToFile = './public/images/' + resultpre[j].image
                        fs.unlink(pathToFile, function (err) {
                            if (err) {
                                throw err
                            } else {
                                console.log("Successfully deleted the file.")
                            }
                        })
                    }
                    previewColl.deleteMany({ productid: req.params.id }).then((removedata) => {
                        console.log("preview remove : " + removedata);
                    })
                }
            }).catch((err) => {
                console.log("Product remove error");
                res.send(err);
            });

            // product remove from product table
            productColl.deleteOne({ _id: req.params.id }).then((data) => {
                const pathToFile = './public/images/' + result.image
                fs.unlink(pathToFile, function (err) {
                    if (err) {
                        throw err
                    } else {
                        console.log("Successfully deleted the file.")
                    }
                })
                res.send(data)
            }).catch((err) => {
                console.log("Product remove error");
                res.send(err);
            })
        }
    }).catch((err) => {
        res.send(err);
    })

}

// API Get data of product using product id
const getproductbyid = async (req, res) => {
    // const token = req.headers['authorization'];
    // if (!token) {
    //     return res.status(401).send({ auth: false, message: 'unauthorized user.' });
    // }
    let data = { product: {}, productslider: [], productPreview: [] , downloadablefile: {}, productHeroImage:[], productThumbImage:[], productCompatibility:[] };
    // get data of main product collection/table
    productColl.findOne({ _id: req.params.productid }).then((resproduct) => {
        if (resproduct) {
            data.product = resproduct;
            if(resproduct.tools!=''){
                let Compatibility=resproduct.tools.split(',');
                for(let k=0; k<Compatibility.length;k++){
                    toolColl.findOne({_id:Compatibility[k]}).then((tool)=>{
                        data.productCompatibility.push(tool);
                    })
                }
            }
            // get data of product slider by productid collection/table
            sliderColl.find({ productid: req.params.productid }).then((slider) => {
                if (slider.length > 0) {
                    for (let i = 0; i < slider.length; i++) {
                        data.productslider.push(slider[i]);
                    }
                }
                // get data of product preview by productid collection/table
                previewColl.find({ productid: req.params.productid }).then((preview) => {
                    if (preview.length > 0) {
                        for (let j = 0; j < preview.length; j++) {
                            data.productPreview.push(preview[j]);
                        }
                    }

                    // get Download File
                    productDownloadColl.find({productid: req.params.productid}).then((downloadfile)=>{
                        if(downloadfile){
                            data.downloadablefile=downloadfile;
                        }
                        productHeroImageColl.find({productid: req.params.productid}).then((heromimage)=>{
                            if (heromimage.length > 0) {
                                for (let j = 0; j < heromimage.length; j++) {
                                    data.productHeroImage.push(heromimage[j]);
                                }
                            }
                            productThumbImageColl.find({productid: req.params.productid}).then((thumbimage)=>{
                                if (thumbimage.length > 0) {
                                    for (let j = 0; j < thumbimage.length; j++) {
                                        data.productThumbImage.push(thumbimage[j]);
                                    }
                                    return res.status(200).send(data);
                                }
                                else {
                                    return res.status(200).send(data);
                                }
                            }).catch((err) => {
                                res.send(err);
                            })
                        })
                    }).catch((err) => {
                        res.send(err);
                    })
                    
                }).catch((err) => {
                    res.send(err);
                })
            }).catch((err) => {
                res.send(err);
            })
        }

    }).catch((err) => {
        res.send(err);
    })
}

// API Update product detail start
const modify = async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).send({ auth: false, message: 'unauthorized user.' });
    }
    const { id } = req.body;
    let data;

    if (req.file != undefined) {
        data = {
            "adminname": req.body.admin, "category": req.body.category, "highlight": req.body.highlight,
            "image": req.file.filename, "overview": req.body.overview, "sharelink": req.body.link, 
            "subcategory": req.body.subcategory, "title": req.body.title, "tools": req.body.tools,"template":req.body.template,
            "fonts": req.body.fonts, "productstatus": req.body.productstatus,
            "seodescription": req.body.seodescription,"seokeywords":req.body.seokeywords
        }
    }
    else {
        data = {
            "adminname": req.body.admin, "category": req.body.category, "highlight": req.body.highlight, 
            "overview": req.body.overview, "sharelink": req.body.link,
            "subcategory": req.body.subcategory, "title": req.body.title, "tools": req.body.tools,"template":req.body.template,
            "fonts": req.body.fonts, "productstatus": req.body.productstatus,
            "seodescription": req.body.seodescription,"seokeywords":req.body.seokeywords
        }
    }
    productColl.findOne({ title: req.body.title, _id: { $ne: id } }).then(function (result) {
        if (result) {
            return res.send({ status: 401, message: 'Product already exist.' });
        }
        else {
            productColl.findOneAndUpdate({ _id: id }, data).then((data) => {
                res.send({ status: 200, productdata: data, message: "You have update product successfully" });
            }).catch((err) => {
                res.send(err);
            })
        }
    }).catch((err) => {
        res.send(err);
    })

}
// API Update product detail start

// API List of all  product by subcategory eg: web, mobile
const getAllProductBySubcategory = async (req, res) => {
    // const token = req.headers['authorization'];
    // if (!token) {
    //     return res.status(401).send({ auth: false, message: 'unauthorized user.' });
    // }
    productColl.find({ template: req.params.type }).populate('category').populate('subcategory').then((data) => {
        res.status(200).send(data)
    }).catch((err) => {
        res.send(err);
    })
}

module.exports = {
    saveproduct,
    getAllProduct,
    deleteproduct,
    getproductbyid,
    modify,
    getAllProductBySubcategory
}