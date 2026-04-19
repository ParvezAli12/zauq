const express = require('express');
const router  = express.Router();
const { getProfile, updateProfile, toggleWishlist, addAddress, deleteAddress } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/profile',                protect, getProfile);
router.put('/profile',                protect, updateProfile);
router.post('/wishlist/:productId',   protect, toggleWishlist);
router.post('/address',               protect, addAddress);
router.delete('/address/:addressId',  protect, deleteAddress);

module.exports = router;