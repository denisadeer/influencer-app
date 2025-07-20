module.exports = function (req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Přístup odepřen – pouze pro adminy.' });
  }
  next();
};
