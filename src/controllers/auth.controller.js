const authControllers = {};

const User = require('../models/User');
const Role = require("../models/Role")

const jwt = require('jsonwebtoken')
const config = require('../config')

authControllers.signUp = async (req, res) => {
      const { username, email, password, roles } = req.body;

      const newUser = new User({
            username, 
            email,
            password: await User.encryptPassword(password)
      });

      if (roles) {
            const foundRoles = await Role.find({ name: { $in: roles } });
            newUser.roles = foundRoles.map(role => role._id)
      } else {    
            const role = await Role.findOne({ name: "user" });
            newUser.roles = [role._id]
      }

      const savedUser = await newUser.save();
      console.log(savedUser)

      const token = jwt.sign({
            id: savedUser._id}, 
            config.SECRET, 
            {
                  expiresIn: 86400 // 24 Hours
            });

      res.json({ token });
};

authControllers.signIn = async (req, res) => {
      const foundedUser = await User.findOne({ email: req.body.email }).populate('roles')
      
      if (!foundedUser) return res.status(400).json({ message: "User not founded" })

      const matchPassword = await User.comparePassword(req.body.password, foundedUser.password)
      
      if (!matchPassword) return res.status(401).json({ token: null, message: "Invalid password" })

      const token = jwt.sign({ id: foundedUser._id }, config.SECRET, { expiresIn: 86400 });

      res.json({ token });
};


module.exports = authControllers;