const mongoose = require('mongoose');
const config = require('config');

module.exports = () => {
  mongoose.connect(
    `mongodb+srv://${config.get('use')}:${config.get(
      'pass'
    )}@speedtech.vyer8.gcp.mongodb.net/todoList1`,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
      if (err) console.log('DB Error', err);
      else console.log('Connented to Atlas');
    }
  );
};
