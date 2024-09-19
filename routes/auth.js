const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
require('dotenv').config();








const JWT_SECRET = process.env.JWT_SECRET;







// Route 1 : create a user using: Post "/api/auth/createuser" No Login required
router.post('/createuser',[
  body('name','Enter a name').isLength({min:3}),
  body('email','Enter valid email').isEmail(),
  body('password',"Minimum length is 3 characters").isLength({min:3}),
],
async (req,res)=>{
// if there are errors , return Bad request and errors
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    success = false;
    return res.status(400).json({success ,errors: errors.array()});
  }
// check if user with same email exist or not
try {
  

  let user = await User.findOne({email: req.body.email});
  console.log(user)
  if(user){
    success = false
    return res.status(400).json({success ,error: "user already exit"})
  }
// encrypt password with hash and salt
  const salt = await bcrypt.genSalt(10);
  const secretPassword = await bcrypt.hash(req.body.password,salt);
  // const secretPassword = req.body.password ; 
//create a user
   user = await User.create({
    name:req.body.name,
    password: secretPassword,
    email:req.body.email,
  })

  // JWT token
  

  const data = {
    user:{
      id : user.id
    }
  }
  const authToken = jwt.sign(data,JWT_SECRET);
console.log(authToken)
success = true
res.json({ success ,authToken})

  // res.json(user)
} catch (error) {
  success = false
  console.log(error.message)
  res.status(500).send("some error occured")
  
}
//   .then(user => res.json(user)).catch(err=>{console.log(err)
// res.json({error:"unique email" , message : err.message})})

  
  // console.log(req.body) ;
  // const user=User(req.body);
  // user.save()
  // res.send(req.body)
}) 














// Route 2 : Authenticate a user using: Post "/api/auth/login"  No Login required

router.post('/login',[
  body('email','Enter a valid email').isEmail(), // email pattern is correct or not
  body('password','password cannot be empty').exists(), // password is empty or not
], async (req , res) =>{
  const errors = validationResult(req);
  let success = false;
  if (!errors.isEmpty()){
     success = false;
    return res.status(400).json({success,errors: errors.array()});
  }
// check weather the user credentials are correct or not
  const{email , password} = req.body;
  
  try {
    let user = await User.findOne({email});
    if(!user){
      success = false;
      return res.status(400).json({success ,error: "incorrect email"})
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if(!passwordCompare){
      success = false;
      return res.status(400).json({ success ,error: "incorrect password"});
      
    }
    // returning auth token if user credentials are correct
    
  const data = {
    user:{
      id : user.id
    }
  }
  const authToken = jwt.sign(data,JWT_SECRET);
console.log(authToken)
console.log( user.id)
success = true;
res.json({ success,authToken})
    
  } catch (error) {
    console.log(error.message)
    res.status(500).send(error.message)
    
  }

})











// Route 3 : Get loggedin  user details using: Post "/api/auth/getuser"   Login required
router.post('/getuser',fetchuser,async (req,res)=>{
try {
 const userid = req.user.id;
  const user = await User.findById(userid).select('-password')
  res.send(user)
  
} catch (error) {
  console.log(error.message)
  res.status(500).send(error.message)
  
}
})










module.exports = router