const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/productController');
const upload  = require('../middleware/upload');

const handleUpload = (req, res, next) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Upload failed'
      });
    }
    next();
  });
};

router.get('/seed',       ctrl.seedProducts);
router.get('/',           ctrl.getProducts);
router.get('/:id',        ctrl.getProduct);
router.post('/',          ctrl.createProduct);
router.put('/:id',        ctrl.updateProduct);
router.delete('/:id',     ctrl.deleteProduct);
router.post('/:id/image', handleUpload, ctrl.uploadImage);

module.exports = router;