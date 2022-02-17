var express = require('express');
const session = require('express-session');
const passport = require('passport');  // authentication
const LocalStrategy = require("passport-local").Strategy;
var cors = require('cors');
const mailer = require('express-mailer');
const path = require('path');
var app = express();
var router = express.Router();


const { smtp_host, smtp_port, smtp_user, smtp_password, SMTP_SECURE } = require('./dbconfig');

const { userColl } = require('./api/models/user'); // User Model

if (smtp_user == '') {
  mailer.extend(app, {
    from: smtp_user,
    host: smtp_host,
    secureConnection: SMTP_SECURE,
    port: smtp_port,
    transportMethod: 'SMTP'
  });
} else {
  mailer.extend(app, {
    from: smtp_user,
    host: smtp_host,
    secureConnection: SMTP_SECURE,
    port: smtp_port,
    transportMethod: 'SMTP',
    auth: {
      user: smtp_user,
      pass: smtp_password
    }
  });
}

// Configure the path of email template
app.set('views', path.dirname('../') + '/api/views');
app.set('view engine', 'jade');

// Configure Sessions Middleware
app.use(session({
  secret: 'r8q,+&1LM3)CD*zAGpx1xm{NeQhc;#',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('tmp'));

app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy
// passport.use(userColl.createStrategy());
const local = new LocalStrategy((username, password, done) => {
  userColl.findOne({ username })
    .then(user => {
      if (!user || !user.validPassword(password)) {
        done(null, false, { message: "Invalid username/password" });
      } else {
        done(null, user);
      }
    })
    .catch(e => done(e));
});

passport.use("local", local);

// To use with sessions
passport.serializeUser(userColl.serializeUser());
passport.deserializeUser(userColl.deserializeUser());

// To read images from API for frontend 
app.use('/images', express.static('images'));

app.use(require('./api/init/routes')); // Initilized routes where setup API path

router.use((request, response, next) => {
  next();
});

// Send Mail Against when Download Template..
app.post('/api/sendDownloadEmail', (req, res, next) => {

  console.log("contact us email API");
  console.log(req.body.email);
  app.mailer.send('download', {
      to: req.body.email,
      subject: `Market Place Download Template`,
      data: { url: req.body.url, name : req.body.name }
  }, (err) => {
      if (err) {

          res.send({ errorMessage: 'There was an error sending the email', errorInfo: err });
          return;
      }
      res.send({ successMessage: 'Email has been sent', status: 200 });
  });
});

// Send Mail Against when Download Template..
app.post('/api/sendVerificationEmail', (req, res, next) => {

  const{email, name}=req.body;
  console.log(req.body.email);
  const confirmEmailUrl=`users/verifysuccess/${email}`;
  app.mailer.send('verificationemail', {
      to: req.body.email,
      subject: `MadBrains-Confirm your Email`,
      data:{greet:"Hi!"+" "+ email, hostName: 'https://themadbrains18.github.io/Marketplace-React/#', emailConfirmUrl: confirmEmailUrl}
  }, (err) => {
      if (err) {

          res.send({ errorMessage: 'There was an error sending the email', errorInfo: err });
          return;
      }
      res.send({ successMessage: 'Email has been sent', status: 200 });
  });
});

// Send Mail Against when Download Template..
app.post('/api/sendForgetPassword', (req, res, next) => {

  const{email}=req.body;
  console.log(req.body.email);
  const forgetpasswordUrl=`users/forgetpassword/${email}`;
  app.mailer.send('forgetpassword', {
      to: req.body.email,
      subject: `MadBrains-Forget Password`,
      data:{greet:"Hi!"+" "+ email, hostName: 'https://themadbrains18.github.io/Marketplace-React/#', forgetpasswordUrl: forgetpasswordUrl}
  }, (err) => {
      if (err) {

          res.send({ errorMessage: 'There was an error sending the email', errorInfo: err });
          return;
      }
      res.send({ successMessage: 'Email has been sent', status: 200 });
  });
});


var port = 3002;
app.listen(process.env.PORT || 3002);
console.log('Order API is runnning at ' + port);

