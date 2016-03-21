var config = {
development: {
    //Lyft Credentials
    lyftAuth: 'password',
    //Expedia Credentials
    expediaAuth: 'password',
    //Google Credentials
    googleAuth: 'password',

    //mongodb connection settings
    database: {
        host:   '127.0.0.1',
        port:   '27017',
        db:     'site_dev'
    }
},
production: {
    //Lyft Credentials
    lyftAuth: 'password',
    //Expedia Credentials
    expediaAuth: 'password',
    //Google Credentials
    googleAuth: 'password',
    
    //mongodb connection settings
    database: {
        host:   '127.0.0.1',
        port:   '27017',
        db:     'site_dev'
    }
    }
};
module.exports = config;