const jwt = require('jsonwebtoken');


const generateJWT = (userId) => {
  return jwt.sign(
    { id: userId }, 
    process.env.JWT_SECRET || 'fallback_secret_key', 
    { 
      expiresIn: process.env.JWT_EXPIRES_IN // صلاحية التوكن (افتراضي 7 أيام)
    }
  );
};

module.exports = generateJWT;