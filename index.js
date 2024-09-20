const connectToMongo = require('./db');
const express = require('express');
var cors = require('cors')
connectToMongo();
require('dotenv').config();






const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())
// Available routes
app.use('/api/auth',require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))

app.listen(port,()=>{
    console.log(`connected to port ${port}`)
})
app.get('/',(req,res)=>{
    res.send('hello fvsfbsf')
})