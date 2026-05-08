// const jwt = require("jsonwebtoken");

// // Authentication
// exports.authenticateUser = (req, res, next) => {
//   // Check whether access token exists in headers
//   if (!req.headers.authorization)
//     return res.status(401).send({ message: "Unauthorised" });
// // console.log(req.headers.authorization);
//   // Verify Token
//   try {
//     const user = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
// // console.log("user",user);
//     next();
//   } catch (err) {
//     console.error(err);
//     return res.status(401).send({ message: "Unauthorised" });
//   }
// };


// // Middleware to check authorization
// exports.isAuthenticated = (req, res, next) => {
//   const { token } = req.query;
// // console.log( req.query);
//   if (!token)
//     return res.status(401).send({ message: "Unauthorised" });
// // console.log(req.headers.authorization);
//   // Verify Token
//   try {
//     const user = jwt.verify(token, process.env.JWT_SECRET);
// // console.log("user",user);
//     next();
//   } catch (err) {
//     console.error(err);
//     return res.status(401).send({ message: "Unauthorised" });
//   }
// };





const jwt = require("jsonwebtoken");

// Authentication
exports.authenticateUser = (req, res, next) => {

  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;   // attach user to request

    next();

  } catch (err) {

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired"
      });
    }

    return res.status(401).json({
      message: "Invalid token"
    });
  }
};




exports.isAuthenticated = (req, res, next) => {

  const { token } = req.query;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();

  } catch (err) {

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired"
      });
    }

    return res.status(401).json({
      message: "Invalid token"
    });
  }
};