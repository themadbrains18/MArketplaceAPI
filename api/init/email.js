const mailer = require('express-mailer');
const path = require('path');
const { Router } = require('express');
const { smtp_host, smtp_port, smtp_user, smtp_password, SMTP_SECURE } = require('../../dbconfig');
// Setting up Mail propertites to sending mail.
module.exports = (app, db) => {
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
    app.set('views', path.dirname('../') + '/views');
    app.set('view engine', 'jade');

    // Send Mail Against when After ContactUs..
    app.post('/api/sendContactusEmail', (req, res, next) => {

        console.log("contact us email API");
        console.log(req.body.email);
        app.mailer.send('contactus', {
            to: req.body.email,
            subject: `Market Place Download Template`,
            data: { fname: req.body.firstName, lname: req.body.lastName, url: req.body.url }
        }, (err) => {
            if (err) {
                res.send({ errorMessage: 'There was an error sending the email', errorInfo: err });
                return;
            }
            res.send({ successMessage: 'Email has been sent', status: 200 });
        });
    });

};





