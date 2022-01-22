const express = require("express");
const Users = require("../models/User");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const rateLimit = require('express-rate-limit')

const UserModal = require("../models/User");
const { hash } = require("bcryptjs");
const User = require("../models/User");
const app = require("../app");
const res = require("express/lib/response");


/**
* @api {post} /api/user Create user
* @apiName Create new user
* @apiPermission admin
* @apiGroup User
*
* @apiParam  {String} [userName] username
* @apiParam  {String} [email] Email
* @apiParam  {String} [phone] Phone number
* @apiParam  {String} [status] Status
*
* @apiSuccess (200) {Object} mixed `User` object
*/


const authLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 5, // Limit each IP to 10 auth account requests per `window` (here, per hour)
	message:
	{status:false, error:"Too many auth retry from this IP, please try again after an hour"},
	standardHeaders: true, 
	legacyHeaders: false, 
})

router.post("/auth", authLimiter, (req, res, next) => {
  const { username, password } = req.body;

  console.log(username);

  User.findOne(
    {
      username,
    },
    (err, user) => {
      if (err) throw err;

      if (!user) {
        res.json({ status: false, error: "Auth failed" });
      } else {
        //user exist
        bcrypt.compare(password, user.password).then((result) => {
          if (!result) {
            res.json({ status: false, error: "Auth failed" });
          } else {
            //loginSuccess
            const payload = { username };
            const token = jwt.sign(payload, req.app.get("api_secret_key"), {
              expiresIn: 720,
            });
            res.json({ status: true, token });
          }
        });
      }
    }
  );
});











/**
* @api {post} /api/user Create user
* @apiName Create new user
* @apiPermission admin
* @apiGroup User
*
* @apiParam  {String} [userName] username
* @apiParam  {String} [email] Email
* @apiParam  {String} [phone] Phone number
* @apiParam  {String} [status] Status
*
* @apiSuccess (200) {Object} mixed `User` object
*/


const createAccountLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 1, // Limit each IP to 1 create account requests per `window` (here, per hour)
	message:
	{status:false, error:"Too many accounts created from this IP, please try again after an hour"},
	standardHeaders: true, 
	legacyHeaders: false, 
})

/**
* @api {post} /api/user Create user
* @apiName Create new user
* @apiPermission admin
* @apiGroup User
*
* @apiParam  {String} [userName] username
* @apiParam  {String} [email] Email
* @apiParam  {String} [phone] Phone number
* @apiParam  {String} [status] Status
*
* @apiSuccess (200) {Object} mixed `User` object
*/


router.post("/register",  createAccountLimiter, (req, res, next) => {
  const { username, password } = req.body;

  (!username || !password) ? res.json({ status: false, error: "username and password are required!" }):
  
  bcrypt.hash(password, 10).then((hash) => {
    const user = new User({
      username,
      password  : hash,
      type      : 'admin',
      deposit   : -1
    });

    const promise = user.save();
    promise
      .then((data) => {
        !data
          ? next({ message: "Not added!", code: 0 })
          : (data.password = "*******");
        res.json({ status: true, data: data });
      })
      .catch((e) => {
        res.json({ status: false, error: e.message });
      });
  });

  
});



/**
* @api {post} /api/user Create user
* @apiName Create new user
* @apiPermission admin
* @apiGroup User
*
* @apiParam  {String} [userName] username
* @apiParam  {String} [email] Email
* @apiParam  {String} [phone] Phone number
* @apiParam  {String} [status] Status
*
* @apiSuccess (200) {Object} mixed `User` object
*/

router.all("/", (req, res, next) => {
  res.json({ status: true, server: "Up", data: "welcome to the test api" });
});

module.exports = router;
