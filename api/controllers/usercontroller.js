const passport = require('passport');  // authentication
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const axios = require("axios");
const { userColl } = require('../models/user');
const { downloadColl } = require('../models/download');
const { APIURL } = require('../../dbconfig');
const tokenSecret = 'mdb!@#123psd';

// API Save product
const register = async (req, res) => {
  userColl.findOne({ username: req.body.username }).then((result) => {
    console.log(result);
    if (result) {
      return res.send({ status: 409, message: 'Email already exist!' });
    }
    else {
      userColl.create({ name: req.body.name, username: req.body.username, password: req.body.password }).then((data) => {
        axios.post(APIURL + 'sendVerificationEmail', { "name": req.body.name, "email": req.body.username }).then((response) => {
          if (response.status == 200) {
            return res.send({ status: 200, message: 'Verification Email has been sent' });
          }
        }).catch((err) => {
          res.send(err);
        })
        // return res.send({ status: 200, message : 'You have register successfully.' });
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
    userColl.findOne({ username: req.body.username }).then((result) => {
      if (result.is_EmailVerified == false) {
        return res.send({ status: 401, message: 'Your Email not verified. Please verify your email.' });
      }
      else {
        // Do email and password validation for the server
        passport.authenticate('local', (authErr, user, info) => {
          if (authErr) return next(authErr);
          if (!user) {
            return res.send({ status: 401, message: "Unauthorized User" });
          }
          return req.logIn(user, (loginErr) => {
            if (loginErr) return res.sendStatus(401);
            token = jwt.sign({ _id: user._id }, tokenSecret, { expiresIn: 86400 });
            return res.send({ status: 200, auth: true, username: user.username, name: user.name, access_token: token });
          })
        })(req, res, next);
      }
    }).catch((err) => {
      res.send(err);
    })
  } catch (error) {
    return res.status(500).send(error);
  }
}

const downloadTemplate = async (req, res) => {
  
  if(req.body.token == undefined){
    console.log('Token undefined');
    downloadColl.find({ email: req.body.email }).then((existuser) => {
      console.log('exist length '+ existuser.length);
      if (existuser.length == 3) {
        return res.send({ status: 202, message: 'register user' });
      }
      else {
        downloadColl.create({ name: req.body.name, email: req.body.email }).then((data) => {
          if (data) {
            if (existuser.length > 0 && existuser.length < 4) {
              return res.send({ status: 201, message: 'Download Template' });
            }
            else if (existuser.length > 3 && req.body.token == undefined) {
              return res.send({ status: 202, message: 'register user' });
            }
            else {
              axios.post(APIURL + 'sendDownloadEmail', { "url": req.body.url, "name": req.body.name, "email": req.body.email }).then((response) => {
                if (response.status == 200) {
                  return res.send({ status: 200, message: 'Email has been sent' });
                }
              })
            }
  
          }
        }).catch((err) => {
          res.send(err);
        })
      }
    }).catch((err) => {
      res.send(err);
    })

    
  }
  else{
    console.log('Token exist');
    downloadColl.create({ name: req.body.name, email: req.body.email }).then((data) => {
      if (data) {
        return res.send({ status: 201, message: 'Download Template' });
      }
    }).catch((err) => {
      res.send(err);
    })
  }
}

const verifyemail = async (req, res) => {
  userColl.findOne({ username: req.body.email }).then((user) => {
    if (user.is_EmailVerified == true) {
      return res.send({ status: 200, message: 'Your email has been already verified, you can now ' });
    }
    else {
      userColl.findOneAndUpdate({ username: req.body.email }, { "is_EmailVerified": true }).then((result) => {
        return res.send({ status: 200, message: 'Your account has been activated, you can now ' });
      }).catch((err) => {
        res.send(err);
      })
    }
  }).catch((err) => {
    res.send(err);
  })

}

const forgetpassword=async(req,res)=>{
  userColl.findOne({ username: req.body.email }).then((user) => {
    if (user) {
      axios.post(APIURL + 'sendForgetPassword', { "email": req.body.email }).then((response) => {
        if (response.status == 200) {
          return res.send({ status: 200, message: 'Verification Email has been sent' });
        }
      }).catch((err) => {
        res.send(err);
      })
    }
    else {
      return res.send({ status: 404, message: 'Email is not exist ' });
    }
  }).catch((err) => {
    res.send(err);
  })
}

const changepassword= async (req,res)=>{
  console.log('change Password ' +req.body.email)
  userColl.findOne({ username: req.body.email }).then((user) => {
    if (user) {
      let passpwd=bcrypt.hashSync(req.body.password, 12)
      userColl.findOneAndUpdate({ username: req.body.email }, { "passwordHash": passpwd }).then((result) => {
        console.log('change Password successfully');
        return res.send({ status: 200, message: 'Your password has been updated' });
      }).catch((err) => {
        res.send(err);
      })
    }
    else {
      return res.send({ status: 404, message: 'Email is not exist ' });
    }
  }).catch((err) => {
    res.send(err);
  })
}

module.exports = {
  register,
  login,
  verifyemail,
  downloadTemplate,
  forgetpassword,
  changepassword
}