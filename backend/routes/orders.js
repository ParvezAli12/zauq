const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/orderController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');

router.post('/',          optionalAuth, ctrl.createOrder);
router.get('/my',         protect,      ctrl.getMyOrders);
router.get('/all',        ctrl.getAllOrders);
router.get('/:id',        optionalAuth, ctrl.getOrder);
router.put('/:id/status', ctrl.updateOrderStatus);

module.exports = router;