const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/User");
const Role = require("../models/Role")

const verifyToken = async (req, res, next) => {
      try {
            const token = req.headers["x-access-token"];
            if (!token) return res.status(403).json({ message: "No token provided" });

            const decoded = jwt.verify(token, config.SECRET);
            req.userId = decoded.id;

            const user = await User.findById(req.userId, { password: 0 });
            if (!user) return res.status(404).json({ message: "User doesn't exist" });

            next();
      } catch (error) {
            console.log(error);
      }
};

const isModerator = async (req, res, next) => {
      const user = await User.findById(req.userId);
      const roles = await Role.find({ _id: { $in: user.roles } });

      for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === "moderator") {
                  next();
                  return;
            };
      }

      return res.status(403).json({ message: "Require Moderator Role" })
};

const isAdmin = async (req, res, next) => {
      const user = await User.findById(req.userId);
      const roles = await Role.find({ _id: { $in: user.roles } });

      for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === "admin") {
                  next();
                  return;
            };
      }

      return res.status(403).json({ message: "Require Admin Role" })
};

module.exports = { verifyToken, isModerator, isAdmin }