import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import { registrValidation } from './validations/auth.js';
import { validationResult } from 'express-validator';
import UserModel from './models/User.js';

mongoose
  .connect(
    'mongodb+srv://admin:123qwe@cluster0.jxugxuv.mongodb.net/blog?retryWrites=true&w=majority',
  )
  .then(() => console.log('DB connected'))
  .catch((err) => console.log('Error! DB not connected', err));

const app = express();

app.use(express.json());

app.post('/auth/login', async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return req.status(404).json({
        message: 'User not found',
      });
    }

    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

    if (!isValidPass) {
      return res.status(400).json({
        message: 'Incorrect password or login',
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      '123qwe',
      {
        expiresIn: '30d',
      },
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Authorization failed',
    });
  }
});

app.post('/auth/register', registrValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doc = new UserModel({
      login: req.body.login,
      email: req.body.email,
      passwordHash: hash,
      avtarUrl: req.body.avtarUrl,
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      '123qwe',
      {
        expiresIn: '30d',
      },
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to register',
    });
  }
});

app.listen(4000, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log('Server running');
});
