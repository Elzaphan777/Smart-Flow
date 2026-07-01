const jwt = require('jsonwebtoken');
const Teller = require('../models/Teller');

// Verify JWT and attach teller to req
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorised. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const teller = await Teller.findById(decoded.id);

    if (!teller) {
      return res.status(401).json({ success: false, message: 'Teller no longer exists.' });
    }

    req.teller = teller;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// Restrict to certain roles
const restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.teller.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.teller.role}' is not authorised to perform this action.`,
      });
    }
    next();
  };
};

module.exports = { protect, restrict };
