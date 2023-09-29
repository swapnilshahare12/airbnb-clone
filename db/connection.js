const mongoose = require('mongoose');
mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log('connection succesfull'))
  .catch((err) => console.log(err));
