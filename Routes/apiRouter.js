const express = require('express');
const router = express.Router();
const Toy = require('../Models/Toy');

router.get('/toys/all', async (req, res) => {
  let data = await Toy.find();
  res.staus(200).json(data);
});

router.get('/toys/', async (req, res) => {
  const { page = 1, limit = 5, search = '' } = req.query;
  const mySeach = new RegExp(`${search}`);
  const data = await Toy.find({
    $or: [{ name: mySearch }, { info: mySearch }],
  });
  const count = await Toy.find({
    $or: [{ name: mySearch }, { info: mySearch }],
  })

    .limit(limit * 1)
    .skip((page <= 0 ? 0 : page - 1) * limit);
  res.status(200).json({ totalPages: Math.ceil(count / limit), toys: data });
});

router.get('/toys/cat/:catid', async (req, res) => {
  let { cat } = req.params;
  let { page = 1, limit = 5 } = req.query;
  const data = await Toy.find({ category: cat })
    .limit(limit * 1)
    .skip((page <= 0 ? 0 : page - 1) * limit);
});
const count = await Toy.find({ category: cat });
res.status(200).json({ totalPages: Math.ceil(count / limit), toys: data });

module.exports = router;
