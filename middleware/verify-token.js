const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  let token;
  if (req.header("authorization")) {
    let header = req.header("authorization");
    if (typeof header !== "undefined") {
      token = header.split(" ")[1];
    }
  } else {
    token = req.body.token || req.query.token || req.headers["x-access-token"];
  }

  if (token) {
    jwt.verify(token, req.app.get("api_secret_key"), (err, decoded) => {
      if (err) res.status(401).json({ status: false, error: "Auth failed!" });
      else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    res.status(401).json({
      status: false,
      error: "No token provided!",
      t: req.header["authorization"],
    });
  }
};
