const mongoose = require('mongoose');
const config = require('config');

module.exports = () => {
  mongoose.connect(
    config.get('remote'),
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
      if (err) throw new Error('Cannot connect to Atlas');
      else console.log('Connected to Atlas');
    }
  );
};
