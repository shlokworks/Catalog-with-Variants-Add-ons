import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ---------- PRODUCT TYPES ----------
 */

// GET /api/products/types
export const listProductTypes = async (_req: Request, res: Response) => {
  try {
    const types = await prisma.productType.findMany();
    res.json(types);
  } catch (err) {
    console.error('Error fetching product types:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/products/types
export const createProductType = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const created = await prisma.productType.create({ data: { name } });
    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating product type:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * ---------- PRODUCTS ----------
 */

// POST /api/products
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, productTypeId, images } = req.body;

    if (!name || !description || !productTypeId || !Array.isArray(images)) {
      return res.status(400).json({ error: 'Missing or invalid fields' });
    }

    const newProduct = await prisma.product.create({
      data: { name, description, productTypeId, images },
    });

    return res.status(201).json(newProduct);
  } catch (err) {
    console.error('Error creating product:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/products
export const getAllProducts = async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { productType: true, variants: true, addons: true },
    });
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/products/:id
export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { variants: true, addons: true, productType: true },
    });

    if (!product) return res.status(404).json({ error: 'Product not found' });

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/products/:id
export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deleted = await prisma.product.delete({ where: { id: Number(id) } });
    res.json({ message: 'Product deleted successfully', deleted });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/products/type/:type
export const getProductsByType = async (req: Request, res: Response) => {
  const { type } = req.params;
  try {
    const products = await prisma.product.findMany({
      where: { productType: { name: type } },
      include: { variants: true, addons: true, productType: true },
    });
    res.json(products);
  } catch (err) {
    console.error('Error fetching products by type:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * ---------- VARIANTS & ADD-ONS ----------
 */

// POST /api/products/variant
export const addVariant = async (req: Request, res: Response) => {
  try {
    const { productId, size, color, price, stock, sku } = req.body;

    if (!productId || price == null || stock == null || !sku) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const variant = await prisma.variant.create({
      data: { productId, size, color, price, stock, sku },
    });

    res.status(201).json(variant);
  } catch (err) {
    console.error('Error adding variant:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/products/addon
export const addAddon = async (req: Request, res: Response) => {
  try {
    const { productId, name, price } = req.body;

    if (!productId || !name || price == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
      include: { productType: true },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Only allow addons for Food
    if (product.productType?.name.toLowerCase() !== 'food') {
      return res.status(400).json({ error: 'Add-ons allowed only for Food items' });
    }

    const addon = await prisma.addon.create({
      data: { productId, name, price },
    });

    res.status(201).json(addon);
  } catch (err) {
    console.error('Error adding addon:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};