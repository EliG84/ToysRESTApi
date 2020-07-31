const express = require('express');
const cors = require('cors');
const path = require('path');
const atlasConnect = require('./DB/atlas');

atlasConnect();

const app = express();
const port = process.env.port || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '/public/')));

const apiRouter = require('./Routes/apiRouter');

app.use('/api', apiRouter);

app.listen(port, () => {
  console.log(`connected on port ${port}`);
});
