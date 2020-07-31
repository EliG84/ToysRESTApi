const mongoose = require('mongoose');
const config = require('config');

let local = 'mongodb://localhost/watchApiTest';
let remote = `mongodb+srv://${config.get('user')}:${config.get(
  'pass'
)}@speedtech.vyer8.gcp.mongodb.net/watchApi`;

module.exports = () => {
  mongoose.connect(
    local,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
      if (err) throw new Error('Cannot connect to Atlas');
      else console.log('Connected to Atlas');
    }
  );
};
