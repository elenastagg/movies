const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user-model');

// Check for existing user and create new user if it does not exist
module.exports.create = async (req, res) => {
  const hash = bcrypt.hashSync(req.body.password, 10);
  try {
    const [user, created] = await User.findOrCreate({
      where: { email: req.body.email },
      defaults: {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        username: req.body.username,
        email: req.body.email,
        password: hash,
      },
    });
    if (created) {
      res.status(201).json({ message: 'auth successful' });
    } else {
      res.status(400).json({ message: 'email already exists' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check for user and log in
module.exports.login = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { email: req.body.email },
    });
    if (user === null) {
      res.status(401).json({ message: 'Auth failed' });
    } else {
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (result) {
          const token = jwt.sign(
            {
              email: user.email,
              id: user.id,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: '1w',
            },
          );
          res.status(200).json({ message: 'Auth successful', token });
        } else {
          res.status(401).json({ message: 'Auth failed' });
        }
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Check for token and find profile
module.exports.getUser = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.id },
    });

    res.json({
      username: user.username,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
