require('dotenv').config();
const express = require('express');
const Router = express.Router();
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
require('../db/connection');
const cookieParser = require('cookie-parser');
const userAuth = require('../middleware/userauthentication');
const listing = require('../models/listing');
const userRegistration = require('../models/user.js');
const adminRegistration = require('../models/admin.js');
const jwt = require('jsonwebtoken');
const images = require('../public/images');

Router.use(express.json());
Router.use(express.urlencoded({ extended: false }));

Router.get('/property-details/:propertyid', async (req, res) => {
  try {
    // const requestedProperty = mongoose.Types.ObjectId.isValid(req.params.propertyid)
    console.log(req.params.propertyid,"line no 21 listing route")
    const property = await listing.findOne({
      _id: req.params.propertyid,
    });
   
    const propertyowner = await adminRegistration.find({
      email: property.owner,
    });
   
    
    const token = await req.cookies.jwt;
    if (token) {
      const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
      const useremail = await userRegistration.find({ _id: verifyUser._id });
      res.render('propertydetails', {
        images,
        property: property,
        useremail: useremail[0],
        propertyowner: propertyowner[0]
      });
    } else {
      res.render('propertydetails', {
        images,
        property: property,
        useremail: undefined,
        propertyowner: propertyowner[0]
      });
    }
  } catch (err) {
    console.log(err, 'line no 49');
  }
  
});

Router.get('/my-bookings',userAuth, async (req, res) => {
  const token = await req.cookies.jwt;
  const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
  const useremail = await userRegistration.find({ _id: verifyUser._id });
    res.render('mybookings', {
      useremail: useremail[0],
    }); 
});


module.exports = Router;
