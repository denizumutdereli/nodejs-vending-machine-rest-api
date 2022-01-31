const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");

const AccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Limit each IP to 1 create account requests per `window` (here, per hour)
  message: {
    status: false,
    message:"Too many conections by same IP, please follow-up x-limits and try again after an hour later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @api {post} /user /register Create user
 * @apiName Create new users
 * @apiPermission Registration
 * @apiGroup User
 *
 * @apiParam  {String} [userName] username unique
 * @apiParam  {String} [email] password
 * @apiParam  {String} [role] enum [seller, buyer] from Schema
 * 
 * @rateLimit 1 Hour Window (IP) / Request limit:10
 * 
 * @apiSuccess (200) {Object} mixed `User` object -> @apiHiddenParam {String} password
 * @apiError (200) {Object} {status: false, message: message}
 **/
 
router.post(['/user', '/register'], AccountLimiter, (req, res, next) => {
  const { username, password, role } = req.body;

  !username || !password || !role ? res.json({status: false, error: "username, password and user-types {seller or buyer} are required!"})
    : bcrypt.hash(password, 10).then((hash) => {
        const user = new User({
          username,
          password: hash,
          role,
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
            //res.json({ status: false, error: e.message });
            //Add here custom error messages with switch.
            res.json({status:false, error: 'Registration failed', e:e })
          });
      });
});

/**
 * @api {post} /auth Auth user
 * @apiName Auth users
 * @apiPermission JWT / 720 seconds / Active Session - no paralel use
 * @apiGroup User
 *
 * @apiParam  {String} [userName] username
 * @apiParam  {String} [email] password
 * 
 * @rateLimit 1 Hour Window (IP) / Request limit:10
 * 
 * @apiSuccess (200) {Object} mixed `JWT token` object
 * @apiError (401) {Object} {status: false, message: message}
 **/

router.post("/auth", AccountLimiter, (req, res, next) => {
    const { username, password } = req.body;

    !username || !password ? res.json({ status: false, error: "username and password are required!"}) : User.findOne({ username }, (err, user) => {
        if (err) throw err;

        !user ? res.json({ status: false, error: "Auth failed" }) : bcrypt.compare(password, user.password).then((result) => {
          if (!result) res.status(401).json({ status: false, error: "Auth failed" });
          else {
            //loginSuccess
            const role = user.role;
            const payload = { username, role }; //user-role not secure in jwt but this for demo-purpose and quick development.
            const token = jwt.sign(payload, req.app.get("api_secret_key"), {
            expiresIn: 6000,//dont forget to change!!
            });
            res.json({ status: true, token });
          }
        });
    });
});

/**
 * @api {all} / Default Welcome
 * @apiName Welcome
 * @apiPermission Guests
 * @apiGroup User
 * 
 * @rateLimit 1 Windwos (IP) / Request limit:100 - Default Limit app.js
 * 
 * @apiSuccess (200) {Object} mixed object
 * @apiError (404) {Object} {status: true, message: message}
 **/

router.all("/", (req, res, next) => {
  res.json({ status: true, server: "Up", data: "welcome to the test api" });
});

module.exports = router;
