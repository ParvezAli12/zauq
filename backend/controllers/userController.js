const User    = require('../models/User');
const Product = require('../models/Product');

// @route  GET /api/users/profile
exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist', 'name price number category');
  res.json({ success: true, user });
};

// @route  PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, phone },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/users/wishlist/:productId
exports.toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const pid  = req.params.productId;
    const idx  = user.wishlist.indexOf(pid);

    if (idx === -1) {
      user.wishlist.push(pid);
    } else {
      user.wishlist.splice(idx, 1);
    }

    await user.save();
    const added = idx === -1;
    res.json({ success: true, added, message: added ? 'Added to wishlist' : 'Removed from wishlist' });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/users/address
exports.addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses.push(req.body);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/users/address/:addressId
exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};