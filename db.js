const mongoose = require('mongoose');
require('dotenv').config();
const mongoURI =process.env.MONGODB_URI

const connectToMongo  = async()=>{
    await mongoose.connect(mongoURI)
    console.log('connected to mongo database')
}
module.exports = connectToMongo;
