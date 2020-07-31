const express = require('express');
const router = express.Router();
const Toy = require('../Models/Toy');

router.get('/toys/all', async (req, res) => {
  const data = await Toy.find();
  res.staus(200).json(data);
});

router.get('/toys/', async (req, res) => {
  const { page = 1, limit = 5, search = '' } = req.query;
  const mySearch = new RegExp(`${search}`, 'i');
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
  const { cat } = req.params;
  const { page = 1, limit = 5 } = req.query;
  const data = await Toy.find({ category: cat })
    .limit(limit * 1)
    .skip((page <= 0 ? 0 : page - 1) * limit);
  const count = await Toy.find({ category: cat });
  res.status(200).json({ totalPages: Math.ceil(count / limit), toys: data });
});

router.get('toys/prices/', async (req, res) => {
  const { page = 1, limit = 5, min = 0, max = 100 } = req.query;
  const data = await Toy.find({
    $and: [{ price: { $gte: min } }, { price: { $lte: max } }],
  })
    .limit(limit * 1)
    .skip((page <= 0 ? 0 : page - 1) * limit);
  const count = await Toy.find({
    $and: [{ price: { $gte: min } }, { price: { $lte: max } }],
  });
  res.status(200).json({ totalPages: Math.ceil(count / limit), toys: data });
});

router.post('/toys/add', async (req, res) => {
  const data = await Toy.find({ name: req.body.name });
  if (!data)
    return res.json({
      added: false,
      message: 'Toy already in database. Use delete or update requrest!',
    });
  try {
    await Toy.create(req.body);
    res
      .status(200)
      .json({ added: true, message: `${req.body.name} Added Successfuly!` });
  } catch (error) {
    console.log('In Add: ', error);
    res
      .status(400)
      .json({ added: false, message: 'Problem with DB, try again later.' });
  }
});

// pre-populate the edit page on client side!
router.get('/toys/edit', async (req, res) => {
  const data = await Toy.findById(req.body._id);
  res.status(200).json(data);
});

router.put('/toys/edit', async (req, res) => {
  const oldData = Toy.findById(req.body._id);
  if (!oldData)
    return res
      .status(400)
      .json({ updated: false, message: 'Original product not found!' });
  try {
    await Toy.updateOne({ _id: req.body._id }, req.body);
    const newData = Toy.findById(req.body._id);
    res.staus(200).json({ updated: true, old: oldData, new: newData });
  } catch (error) {
    console.log('In Edit: ', error);
    res
      .status(400)
      .json({ updated: false, message: 'Problem in DB, try again later.' });
  }
});

router.post('/toys/delete', async (req, res) => {
  const data = await findById(req.body._id);
  if (!data)
    return res.status({ deleted: false, message: 'Nothing to remove!' });
  try {
    await Toy.findByIdAndRemove(req.body._id);
    res.json({ deleted: true, message: `${data.name} was removed!` });
  } catch (error) {
    console.log('In Delete: ', error);
    res
      .status(400)
      .json({ deleted: false, message: 'Problem in DB, try again later.' });
  }
});

module.exports = router;
