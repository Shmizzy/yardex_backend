const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token)
    return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}

const isServicer = async (req, res, next) => {
  try {
    await auth(req, res, async () => {
      const user = await User.findById(req.user.id);
      if( user && user.role === 'servicer') next();
      else res.status(403).json({ message: 'Access is DENIED'})
    })
  } catch (error) {
    res.status(401).json({ message: error.message })
  }
}



const registerValidator = [
  body('username').not().isEmpty().trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
]

const loginValidator = [
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
]



module.exports = { registerValidator, loginValidator, auth, isServicer };