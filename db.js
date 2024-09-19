const mongoose = require('mongoose');
const mongoURI ="mongodb://0.0.0.0/inotebook"

const connectToMongo  = async()=>{
    await mongoose.connect(mongoURI)
    console.log('connected to mongo database')
}
module.exports = connectToMongo;
