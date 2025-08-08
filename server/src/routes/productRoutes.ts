import express from 'express';
import {
  // product types
  listProductTypes,
  createProductType,
  // products
  createProduct,
  getAllProducts,
  getProductById,
  getProductsByType,
  deleteProduct,
  // children
  addVariant,
  addAddon,
} from '../controllers/productController';

const router = express.Router();

// Product types (kept under /api/products to avoid a new router file)
router.get('/types', listProductTypes);
router.post('/types', createProductType);

// Products
router.post('/', createProduct);
router.get('/', getAllProducts);
router.get('/type/:type', getProductsByType);
router.get('/:id', getProductById);
router.delete('/:id', deleteProduct);

// Children
router.post('/variant', addVariant);
router.post('/addon', addAddon);

export default router;