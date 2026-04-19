const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  try {
    const { category, intensity, sort, search } = req.query;
    let query = { isActive: true };

    if (category && category !== 'all') query.category = category;
    if (intensity && intensity !== 'all') query.intensity = intensity;
    if (search) query.name = { $regex: search, $options: 'i' };

    let products = Product.find(query);

    if (sort === 'price-asc')  products = products.sort({ price:  1 });
    if (sort === 'price-desc') products = products.sort({ price: -1 });
    if (sort === 'name')       products = products.sort({ name:   1 });

    const result = await products;
    res.json({ success: true, count: result.length, products: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.seedProducts = async (req, res) => {
  console.log('SEED ROUTE HIT');
  try {
    await Product.deleteMany({});

    const products = [
      {
        name: 'Laila Noir',
        number: 'No. 01',
        intensity: 'Intense',
        price: 8500,
        price100ml: 11500,
        category: 'oriental',
        notes: {
          top: 'Bergamot, Saffron',
          heart: 'Rose, Oud',
          base: 'Amber, Musk'
        },
        description: 'A night-blooming rose wrapped in smoky oud — seductive, timeless, unforgettable.',
        longDescription: 'Laila Noir opens with a burst of bergamot and golden saffron, before the heart reveals a deeply romantic accord of Bulgarian rose and pure Assam oud. The drydown is a warm embrace of amber and white musk that lasts well into the next morning.',
        tag: null,
        stock: 100,
        isActive: true
      },
      {
        name: 'Raat Ki Rani',
        number: 'No. 02',
        intensity: 'Moderate',
        price: 9200,
        price100ml: 12200,
        category: 'floral',
        notes: {
          top: 'Cardamom, Citrus',
          heart: 'Sandalwood, Iris',
          base: 'Vetiver, White Musk'
        },
        description: "Queen of the night. A veil of sandalwood and spice that lingers long after you've left.",
        longDescription: 'Named after the tuberose that blooms only after dark, Raat Ki Rani is a sophisticated floral built on a foundation of Mysore sandalwood. Cardamom and citrus open playfully before iris and sandalwood take over.',
        tag: 'Bestseller',
        stock: 100,
        isActive: true
      },
      {
        name: 'Subah-e-Noor',
        number: 'No. 03',
        intensity: 'Light',
        price: 7800,
        price100ml: 10800,
        category: 'fresh',
        notes: {
          top: 'Jasmine, Green Tea',
          heart: 'Peony, Cedarwood',
          base: 'Patchouli, Vanilla'
        },
        description: 'Morning light on jasmine petals. Fresh, luminous, and alive — a breath of pure dawn.',
        longDescription: 'Subah-e-Noor is the scent of early morning — dew on jasmine, steam rising from green tea. A luminous floral that transitions into a soft cedarwood and vanilla base.',
        tag: 'New',
        stock: 100,
        isActive: true
      },
      {
        name: 'Raakh',
        number: 'No. 04',
        intensity: 'Intense',
        price: 10500,
        price100ml: 13500,
        category: 'woody',
        notes: {
          top: 'Black Pepper, Incense',
          heart: 'Leather, Vetiver',
          base: 'Oud, Smoke'
        },
        description: 'Ash and smoke over warm leather. Raw, powerful, and deeply masculine.',
        longDescription: 'Raakh is for those who wear their fragrance like armour. Black pepper and incense open with authority, before a core of dark leather and vetiver emerges.',
        tag: null,
        stock: 100,
        isActive: true
      },
      {
        name: 'Gulab-e-Shab',
        number: 'No. 05',
        intensity: 'Moderate',
        price: 8900,
        price100ml: 11900,
        category: 'floral',
        notes: {
          top: 'Lychee, Raspberry',
          heart: 'Rose, Peony',
          base: 'Musk, Sandalwood'
        },
        description: 'A garden of roses after midnight rain — lush, romantic, and impossibly soft.',
        longDescription: "Gulab-e-Shab is the ultimate rose fragrance. Lychee and raspberry open with a juicy sweetness, drawing you into a heart of pure Bulgarian rose and white peony.",
        tag: null,
        stock: 100,
        isActive: true
      },
      {
        name: 'Safar',
        number: 'No. 06',
        intensity: 'Light',
        price: 7200,
        price100ml: 10200,
        category: 'fresh',
        notes: {
          top: 'Sea Salt, Citrus',
          heart: 'Driftwood, Jasmine',
          base: 'Ambergris, Musk'
        },
        description: 'The scent of open water and salt wind — freedom distilled into a bottle.',
        longDescription: 'Safar captures the feeling of departure — salt air, open horizons, and the particular freedom of being in motion.',
        tag: 'New',
        stock: 100,
        isActive: true
      }
    ];

    const created = await Product.create(products);

    res.json({
      success: true,
      message: `${created.length} products seeded successfully`,
      products: created
    });

  } catch (err) {
    console.error('SEED ERROR:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
// @route POST /api/products/:id/image
exports.uploadImage = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files received'
      });
    }

    const imageUrls = req.files.map(file =>
      `http://localhost:5000/uploads/products/${file.filename}`
    );

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $push: { images: { $each: imageUrls } } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log(`✅ Uploaded ${req.files.length} image(s) for product: ${product.name}`);

    res.json({
      success:   true,
      message:   `${req.files.length} image(s) uploaded`,
      imageUrls: imageUrls,
      images:    product.images,
      product
    });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};