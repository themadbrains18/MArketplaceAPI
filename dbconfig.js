const  config = {
    user:  'postgres', // sql user
    password:  '123456', //sql user password
    server:  'localhost', // if it does not work try- localhost
    database:  'marketplace',
    port:  5432,

    smtp_host : 'smtp.gmail.com',
    smtp_port : '587',
    smtp_user : 'surinderdhanjufss@gmail.com',
    smtp_password : 'lmmyrkpjsebbdgoj',
    SMTP_SECURE : false,
    APIURL:'http://localhost:3002/api/'
}

module.exports = config;
