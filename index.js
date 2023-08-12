const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieparser = require('cookie-parser');

const salt = bcrypt.genSaltSync(10);
const secret = 'skdnfijnowfhnooqweirjoij';

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(cookieparser());

mongoose.connect('mongodb+srv://blog:7c4GmofwrTW6aM4J@testcluster0.pllyzbt.mongodb.net/blog', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });
  if (!userDoc) {
    return res.status(400).json({ error: 'User not found' });
  }

  const passOk = bcrypt.compareSync(password, userDoc.password);
//   loggedin
  if (passOk) { 
    jwt.sign({ username, id: userDoc._id }, secret, { expiresIn: '1h' }, (err, token) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to generate token' });
      } else {
        res.cookie('token', token, { httpOnly: true }).json({ message: 'Login successful' });
      }
    });
  } else {
    res.status(401).json({ error: 'Wrong credentials' });
  }
});

app.get('/profile', (req, res) => {
  const {token} = req.cookies;
  console.log(req.cookies);
  jwt.verify(token , secret , {} , (err,info) => {
    if(err) throw err;
  res.json(info);
});
});

app.listen(4000);
