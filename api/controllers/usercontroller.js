const passport = require('passport');  // authentication
const jwt = require('jsonwebtoken');
const axios = require("axios");
const { userColl } = require('../models/user');
const { downloadColl } = require('../models/download');
const { APIURL } = require('../../dbconfig');
const tokenSecret = 'mdb!@#123psd';

// API Save product
const register = async (req, res) => {
  userColl.findOne({username: req.body.username}).then((result)=>{
    console.log(result);
    if(result){
      return res.send({ status: 409, message : 'Username already exist!' });
    }
    else{
      userColl.create({ name: req.body.name, username: req.body.username, password: req.body.password }).then((data) => {
        console.log("registerdata " +data);
        return res.send({ status: 200, message : 'You have register successfully.' });
        // res.send(data)
      }).catch((err) => {
        res.send(err);
      })
    }
  }).catch((err) => {
    res.send(err);
  })
  
}

const login = async (req, res, next) => {
  try {
    let token = null;
    // Do email and password validation for the server
    passport.authenticate('local', (authErr, user, info) => {
      if (authErr) return next(authErr);
      console.log("user data " + user);
      if (!user) {
        console.log("UID:" + user.username)
        return res.send({ status: 401, message: "Unauthorized User" });
      }
      return req.logIn(user, (loginErr) => {
        if (loginErr) return res.sendStatus(401);
        token = jwt.sign({ _id: user._id }, tokenSecret, { expiresIn: 86400 });
        return res.send({ status: 200, auth: true, username: user.username, name: user.name, access_token: token });
      })
    })(req, res, next);
  } catch (error) {
    return res.status(500).send(error);
  }
}

const downloadTemplate = async (req, res) => {
  downloadColl.create({ name: req.body.name, email: req.body.email }).then((data) => {
    if (data) {
      axios.post(APIURL + 'sendDownloadEmail', { "url": "https://theuxuidesigner.com/market-place", "name": req.body.name, "email": req.body.email }).then((response) => {
        if (response.status == 200) {
          return res.send({ status: 200, message: 'Email has been sent' });
        }
      })
    }

  }).catch((err) => {
    res.send(err);
  })
}

module.exports = {
  register,
  login,
  downloadTemplate
}