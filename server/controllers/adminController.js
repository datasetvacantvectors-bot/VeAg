import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import SearchAnalytics from '../models/SearchAnalytics.js';
import ClickAnalytics from '../models/ClickAnalytics.js';

// Helper: build query that matches either _id or custom productId
const buildProductQuery = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { $or: [{ _id: id }, { productId: id }] };
  }
  return { productId: id };
};

// @desc    Admin login
// @route   POST /api/admin/login
export const login = async (req, res) => {
  try {
    const { adminId, password } = req.body;

    if (!adminId || !password) {
      return res.status(400).json({ message: 'adminId and password are required.' });
    }

    if (adminId !== process.env.ADMIN_ID || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    const token = jwt.sign(
      { adminId, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, expiresIn: 3600 });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Login failed.', error: error.message });
  }
};

// @desc    Verify admin JWT token
// @route   GET /api/admin/verify
export const verifyToken = async (req, res) => {
  try {
    res.status(200).json({ valid: true, admin: req.admin });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ message: 'Token verification failed.', error: error.message });
  }
};

// @desc    Get all products (including inactive) for admin panel
// @route   GET /api/admin/products
export const getAllProducts = async (req, res) => {
  try {
    const {
      q,
      page = 1,
      limit = 12,
      sort = 'newest',
      minPrice,
      maxPrice
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // No isActive filter — admin sees everything
    const filter = {};

    // Text search filter
    if (q && q.trim()) {
      filter.$text = { $search: q.trim() };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = parseFloat(maxPrice);
    }

    // Build sort object
    let sortObj = {};
    if (q && q.trim() && sort === 'relevance') {
      sortObj = { score: { $meta: 'textScore' } };
    } else {
      switch (sort) {
        case 'price_asc':
          sortObj = { price: 1 };
          break;
        case 'price_desc':
          sortObj = { price: -1 };
          break;
        case 'newest':
          sortObj = { createdAt: -1 };
          break;
        case 'oldest':
          sortObj = { createdAt: 1 };
          break;
        default:
          sortObj = { createdAt: -1 };
          break;
      }
    }

    // Build projection (include textScore if text search)
    const projection = q && q.trim()
      ? { score: { $meta: 'textScore' } }
      : {};

    const [products, totalProducts] = await Promise.all([
      Product.find(filter, projection)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalProducts / limitNum);

    res.status(200).json({
      products,
      totalProducts,
      totalPages,
      currentPage: pageNum
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ message: 'Failed to fetch products.', error: error.message });
  }
};

// @desc    Add a new product
// @route   POST /api/admin/products
export const addProduct = async (req, res) => {
  try {
    const { title, description, link, productLink, imageUrl, price } = req.body;
    const productUrl = link || productLink;

    if (!title || !description || !productUrl || price === undefined) {
      return res.status(400).json({ message: 'title, description, link, and price are required.' });
    }

    // Generate unique productId
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const productId = `PROD-${Date.now()}-${randomChars}`;

    const product = await Product.create({
      productId,
      title,
      description,
      link: productUrl,
      imageUrl: imageUrl || '',
      price: parseFloat(price)
    });

    res.status(201).json({ message: 'Product created successfully.', product });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ message: 'Failed to add product.', error: error.message });
  }
};

// @desc    Edit an existing product
// @route   PUT /api/admin/products/:productId
export const editProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { title, description, link, productLink, imageUrl, price } = req.body;
    const productUrl = link || productLink;

    const product = await Product.findOne(buildProductQuery(productId));

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Track changes in edit history
    const editEntries = [];
    const fieldsToCheck = { title, description, link: productUrl, imageUrl, price };

    for (const [field, newValue] of Object.entries(fieldsToCheck)) {
      if (newValue !== undefined) {
        const oldValue = String(product[field] ?? '');
        const newVal = String(newValue);

        if (oldValue !== newVal) {
          editEntries.push({
            field,
            oldValue,
            newValue: newVal,
            editedAt: new Date()
          });
        }
      }
    }

    // Build update object
    const updateData = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (productUrl !== undefined) updateData.link = productUrl;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (price !== undefined) updateData.price = parseFloat(price);

    const updatedProduct = await Product.findOneAndUpdate(
      buildProductQuery(productId),
      {
        $set: updateData,
        $push: { editHistory: { $each: editEntries } }
      },
      { new: true }
    );

    res.status(200).json({ message: 'Product updated successfully.', product: updatedProduct });
  } catch (error) {
    console.error('Edit product error:', error);
    res.status(500).json({ message: 'Failed to update product.', error: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/admin/products/:productId
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOneAndDelete(buildProductQuery(productId));

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product.', error: error.message });
  }
};

// @desc    Get search analytics (paginated)
// @route   GET /api/admin/analytics/searches
export const getSearchAnalytics = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      SearchAnalytics.find()
        .sort({ searchedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      SearchAnalytics.countDocuments()
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      data,
      total,
      totalPages,
      currentPage: pageNum
    });
  } catch (error) {
    console.error('Get search analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch search analytics.', error: error.message });
  }
};

// @desc    Get click analytics (paginated)
// @route   GET /api/admin/analytics/clicks
export const getClickAnalytics = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      ClickAnalytics.find()
        .sort({ clickedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ClickAnalytics.countDocuments()
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      data,
      total,
      totalPages,
      currentPage: pageNum
    });
  } catch (error) {
    console.error('Get click analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch click analytics.', error: error.message });
  }
};
