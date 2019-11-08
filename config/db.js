const mongoose = require('mongoose');
const config = require('config');
//retrieve URI from json file
const db = config.get('mongoURI');

//mongoose connection with db

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });
        console.log('mongoDB is connected...')
    } catch (err) {
        console.error(err.message);
        //Exit process if error
        process.exit(1);
    }
}

module.exports = connectDB;