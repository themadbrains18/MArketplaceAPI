const { Router } = require('express');
const mongoose = require('mongoose');
var multer = require('multer');
const app = Router();

// connection with mongoDB database start
mongoose.connect("mongodb+srv://surindermdb:Madbrains@2018@cluster0.hpf2a.mongodb.net/test", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false, })
  .then(() => {
    console.log("server Connected");
  }).catch((err) => {
    console.log(err);
  })
// connection with mongoDB database end

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/images');
  },
  filename: (req, file, cb) => {
    console.log(file);
    console.log('file mime type ' + file.mimetype);
    var filetype = '';
    if (file.mimetype === 'image/gif') {
      filetype = 'gif';
    }
    if (file.mimetype === 'image/png') {
      filetype = 'png';
    }
    if (file.mimetype === 'image/jpeg') {
      filetype = 'jpg';
    }
    if (file.mimetype == 'application/x-zip-compressed') {
      filetype = 'zip';
    }
    if (file.mimetype == 'application/octet-stream') {
      filetype = 'xd';
    }
    if(filetype == 'zip' || filetype == 'xd'){
      cb(null, 'templatefile-' + Date.now() + '.' + filetype);
    }
    else{
      cb(null, 'image-' + Date.now() + '.' + filetype);
    }
    
  }
});
var upload = multer({ storage: storage, limits: { fieldSize: 25 * 1024 * 1024 } });

const { getAll, savecategory, deletecategory, getcategorybyid, edit } = require('../controllers/mdcategorycontroller');
const { getAllsubcategory, savesubcategory, deletesubcategory, getsubcategorybyid, editsubcategory } = require('../controllers/mdsubcategorycontroller');
const { savetool, getAllTool, getToolsById, deleteTools, editTools } = require('../controllers/mdtoolscontroller');
const { saveproduct, getAllProduct, deleteproduct, getproductbyid, modify, getAllProductBySubcategory } = require('../controllers/mdproductcontroller');
const { uploadSlider } = require('../controllers/mdslidercontroller');
const { uploadPreview } = require('../controllers/mdpreviewcontroller');
const { register, login, downloadTemplate, verifyemail, forgetpassword, changepassword } = require('../controllers/usercontroller');
const { uploadBanner, getBanner, deleteBanner } = require('../controllers/bannercontroller');
const { uploadDownloadFile } = require('../controllers/mdproductdownloadcontroller');

app.post('/api/register', register);
app.post('/api/login', login);
app.post('/api/verifyemail', verifyemail);
app.post('/api/forgetpassword', forgetpassword);
app.post('/api/changepassword', changepassword)

app.post('/api/download', downloadTemplate);
// API Category with MongoDB
app.post('/api/category/save', savecategory);
app.get('/api/category/getAll', getAll);
app.delete('/api/category/delete/:id', deletecategory);
app.get('/api/category/getcategorybyid/:categoryid', getcategorybyid);
app.post('/api/category/update', edit);

// // Subcategory API Request
app.post('/api/subcategory/save', savesubcategory);
app.get('/api/subcategory/getAll', getAllsubcategory);
app.delete('/api/subcategory/delete/:id', deletesubcategory);
app.get('/api/subcategory/getcategorybyid/:id', getsubcategorybyid);
app.post('/api/subcategory/update', editsubcategory);

// Tool API Request
app.post('/api/tool/save', savetool);
app.get('/api/tool/getAll', getAllTool);
app.delete('/api/tool/delete/:id', deleteTools);
app.get('/api/tool/gettoolbyid/:id', getToolsById);
app.post('/api/tool/update', editTools);

// Product API Request
app.get('/api/product/getAll', getAllProduct);
app.post('/api/save', upload.single('file'), saveproduct);
app.delete('/api/product/delete/:id', deleteproduct);
app.post('/api/productslider', upload.array('sliderImage'), uploadSlider);
app.post('/api/productpreview', upload.array('previewImage'), uploadPreview);
app.get('/api/product/getproductbyid/:productid', getproductbyid);
app.post('/api/product/modify', upload.single('file'), modify);
app.get('/api/product/getAllBySubcategory/:type', getAllProductBySubcategory);

app.post('/api/productdownload', upload.array('downloadFile'), uploadDownloadFile);

// Banner Upload Request
app.post('/api/banner', upload.array('bannerimage'), uploadBanner);
app.get('/api/getbanner', getBanner);
app.delete('/api/removebanner/:id', deleteBanner);


module.exports = app;