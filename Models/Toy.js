const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ToySchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  imgUrl: {
    type: String,
    default: 'https://toy-api-eli.herokuapp.com/img/default.jpg',
  },
  info: { type: String, default: 'This is a Toy' },
  price: { type: Number, required: true },
  created: {
    day: { type: Number, default: new Date().getDate() },
    month: { type: Number, default: new Date().getMonth() + 1 },
    year: { type: Number, default: new Date().getFullYear() },
    time: { type: String, default: new Date().toLocaleTimeString() },
  },
});

const Toy = mongoose.model('toy', ToySchema);

module.exports = Toy;
