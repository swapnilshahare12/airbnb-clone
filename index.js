require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const flash = require('connect-flash');
const Razorpay = require('razorpay');
const PORT = process.env.PORT || 3000;
const path = require('path');
require('./db/connection');
const listing = require('./models/listing.js');
const userRegistration = require('./models/user.js');
const adminRegistration = require('./models/admin.js');

const bcrypt = require('bcryptjs');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const images = require('./public/images')
const listingRoute = require('./routes/listing_route')
const userRoute = require('./routes/user_route')
const adminRoute = require('./routes/admin_route')


app.use(cookieParser());
app.use(session({
    secret: 'swapnil',
    resave: true,
    saveUninitialized: true,
  }));
app.use(flash());

app.use(function (req, res, next) {
  res.locals.message = req.flash();
  next();
});

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.get('/', async (req, res) => {
  const { city,minPrice,maxPrice } = req.query
  let query = {}

  if (city) {
    query.city = {$regex:new RegExp(city,'i')}
  }

  if (minPrice && maxPrice) {
    query.price = { $gte: minPrice, $lte: maxPrice}
  } else if (minPrice) {
    query.price = { $gte: minPrice };
  } else if (maxPrice) {
    query.price = { $gte: maxPrice };
  } 

  const data = await listing.find(query);
  const token = await req.cookies.jwt;
  if (token) {
    const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
    const useremail = await userRegistration.find({ _id: verifyUser._id });
    res.render('index', {
      images,
      data,
      useremail: useremail[0],
    });
  } else {
    res.render('index', {
      images,
      data,
      useremail: undefined,
    });
  }
});

app.use(listingRoute)
app.use(userRoute)
app.use(adminRoute)






app.get('/map', async(req, res) => {
  const token = await req.cookies.jwt;
  if (token) {
    const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
    const useremail = await userRegistration.find({ _id: verifyUser._id });
    res.render('index', {
      images,
      data,
      useremail: useremail[0],
    });
  } else {
    res.render('map', {
      images,
      useremail: undefined,
    });
  }
});




app.get('*', (req, res) => {
  res.render('404')
});

app.use((req, res, next) => {
    res.status(404).render("404")
})


app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
