const express = require('express');
const _ = require('lodash');
const config = require('config');
const router = express.Router();
const Toy = require('../Models/Toy');

router.get('/toys/all/', async (req, res) => {
  const data = await Toy.find().sort({ name: 1 });
  const count = await Toy.countDocuments();
  res
    .status(200)
    .json({ docs: config.get('docs'), totalRecords: count, toys: data });
});

// api/toys?search=robot&page=0$limit=2

router.get('/toys', async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const mySearch = new RegExp(`${search}`, 'i');
  const count = await Toy.countDocuments({
    $or: [{ name: mySearch }, { info: mySearch }],
  });
  const data = await Toy.find({
    $or: [{ name: mySearch }, { info: mySearch }],
  })

    .limit(limit * 1)
    .skip((page <= 0 ? 0 : page - 1) * limit);
  res.status(200).json({
    docs: config.get('docs'),
    totalPages: Math.ceil(count / limit),
    limitPerPage: Number(limit),
    totalFound: Number(count),
    toys: data,
  });
});

router.get('/toys/cat/:catName', async (req, res) => {
  const { catName } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const mySearch = new RegExp(`${catName}`, 'i');
  const data = await Toy.find({ category: mySearch })
    .limit(limit * 1)
    .skip((page <= 0 ? 0 : page - 1) * limit);
  const count = await Toy.countDocuments({ category: mySearch });
  res.status(200).json({
    docs: config.get('docs'),
    totalPages: Math.ceil(count / limit),
    limitPerPage: Number(limit),
    totalFound: Number(count),
    toys: data,
  });
});

// get list of all available categories in DB

router.get('/toys/catlist', async (req, res) => {
  let catList = await Toy.find();
  let unique = [];
  catList.map((item) => {
    if (!unique.includes(item.category)) {
      unique.push(item.category);
    }
  });
  res.status(200).json({ docs: config.get('docs'), catList: unique });
});

router.get('/toys/prices', async (req, res) => {
  const { page = 1, limit = 10, min = 0, max = 20 } = req.query;
  const data = await Toy.find({
    $and: [{ price: { $gte: min } }, { price: { $lte: max } }],
  })
    .limit(limit * 1)
    .skip((page <= 0 ? 0 : page - 1) * limit);
  const count = await Toy.countDocuments({
    $and: [{ price: { $gte: min } }, { price: { $lte: max } }],
  });
  res.status(200).json({
    docs: config.get('docs'),
    totalPages: Math.ceil(count / limit),
    limitPerPage: Number(limit),
    totalFound: Number(count),
    priceRange: `${min}-${max}`,
    toys: data,
  });
});

router.post('/toys/add', async (req, res) => {
  const mySearch = new RegExp(`${req.body.name}`, 'i');
  const data = await Toy.find({ name: mySearch });
  if (data.length)
    return res.json({
      added: false,
      message: 'Toy already in database. Use delete or update request!',
    });
  try {
    const data = await Toy.create(req.body);
    res.status(200).json({ docs: config.get('docs'), added: true, data });
  } catch (error) {
    console.log('In Add: ', error);
    res.status(400).json({
      docs: config.get('docs'),
      added: false,
      message: 'Rquired Fields: Name,Category,Price!',
    });
  }
});

// pre-populate the edit page on client side!

router.get('/toys/edit/:id', async (req, res) => {
  try {
    const data = await Toy.findById(req.params.id);
    res
      .status(200)
      .json(
        _.pick(data, ['_id', 'name', 'category', 'info', 'imgUrl', 'price'])
      );
  } catch (error) {
    res.status(400).json({
      docs: config.get('docs'),
      message: 'Invalid ID format!',
    });
  }
});

router.all('/toys/edit', async (req, res) => {
  if (
    req.method !== 'PUT' &&
    req.method !== 'POST' &&
    req.method !== 'put' &&
    req.method !== 'post'
  )
    return res.status(400).json('Only PUT or POST requests on this route!');
  let oldData;
  try {
    oldData = await Toy.findById(req.body._id);
    if (!oldData)
      return res.status(400).json({
        docs: config.get('docs'),
        updated: false,
        message: 'Original Toy not found!',
      });
  } catch (error) {
    return res.status(400).json({
      docs: config.get('docs'),
      updated: false,
      message: 'Id format does not match DB',
    });
  }
  try {
    await Toy.findOneAndUpdate({ _id: req.body._id }, req.body, {
      useFindAndModify: false,
    });
    const newData = await Toy.findById(req.body._id);
    res.status(200).json({
      docs: config.get('docs'),
      updated: true,
      old: _.pick(oldData, [
        'id',
        'name',
        'price',
        'info',
        'imgUrl',
        'category',
      ]),
      new: _.pick(newData, [
        'id',
        'name',
        'price',
        'info',
        'imgUrl',
        'category',
      ]),
    });
  } catch (error) {
    console.log('In Edit: ', error);
    res.status(400).json({
      docs: config.get('docs'),
      updated: false,
      message: 'Problem in DB, try again later.',
    });
  }
});

router.post('/toys/delete', async (req, res) => {
  let data;
  try {
    data = await Toy.findById(req.body._id);
    if (!data)
      return res.status(400).json({
        docs: config.get('docs'),
        deleted: false,
        message: 'Toy not found. Nothing to remove!',
      });
  } catch (error) {
    console.log('in Delete: ', error);
    return res.status(400).json({
      docs: config.get('docs'),
      deleted: false,
      message: 'Problem parsing ID check ID and try again',
    });
  }
  try {
    await Toy.findByIdAndRemove(req.body._id, { useFindAndModify: false });
    res.json({
      docs: config.get('docs'),
      deleted: true,
      message: `${data.name} was removed!`,
    });
  } catch (error) {
    console.log('In Delete: ', error);
    res.status(400).json({
      docs: config.get('docs'),
      deleted: false,
      message: 'Problem in DB, try again later.',
    });
  }
});

module.exports = router;
