const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../db/prisma");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate, authorize("OWNER"));

router.get("/stores", async (req, res, next) => {
  try {
    const stores = await prisma.store.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { users: true, orders: true, availabilities: true } }
      }
    });
    return res.json(stores);
  } catch (error) {
    return next(error);
  }
});

router.post("/stores", async (req, res, next) => {
  try {
    const { name, location, active } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Store name is required." });
    }

    const store = await prisma.store.create({
      data: { name: name.trim(), location: location?.trim() || null, active: active ?? true }
    });
    return res.status(201).json(store);
  } catch (error) {
    return next(error);
  }
});

router.put("/stores/:id", async (req, res, next) => {
  try {
    const storeId = Number(req.params.id);
    const { name, location, active } = req.body;

    const store = await prisma.store.update({
      where: { id: storeId },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(location !== undefined ? { location: location?.trim() || null } : {}),
        ...(active !== undefined ? { active: Boolean(active) } : {})
      }
    });
    return res.json(store);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Store not found." });
    }
    return next(error);
  }
});

router.delete("/stores/:id", async (req, res, next) => {
  try {
    const storeId = Number(req.params.id);
    const existing = await prisma.store.findUnique({
      where: { id: storeId },
      include: { _count: { select: { users: true, orders: true } } }
    });

    if (!existing) {
      return res.status(404).json({ message: "Store not found." });
    }
    if (existing._count.users > 0 || existing._count.orders > 0) {
      return res.status(400).json({ message: "Cannot delete store with users or orders." });
    }

    await prisma.store.delete({ where: { id: storeId } });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.get("/categories", async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" }
    });
    return res.json(categories);
  } catch (error) {
    return next(error);
  }
});

router.post("/categories", async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Category name is required." });
    }

    const category = await prisma.category.create({
      data: { name: name.trim(), createdById: req.user.id }
    });
    return res.status(201).json(category);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Category already exists." });
    }
    return next(error);
  }
});

router.put("/categories/:id", async (req, res, next) => {
  try {
    const categoryId = Number(req.params.id);
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Category name is required." });
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: { name: name.trim() }
    });
    return res.json(category);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Category already exists." });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Category not found." });
    }
    return next(error);
  }
});

router.delete("/categories/:id", async (req, res, next) => {
  try {
    const categoryId = Number(req.params.id);
    const productsInCategory = await prisma.product.count({ where: { categoryId } });
    if (productsInCategory > 0) {
      return res.status(400).json({ message: "Cannot delete category with products." });
    }
    await prisma.category.delete({ where: { id: categoryId } });
    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Category not found." });
    }
    return next(error);
  }
});

router.get("/products", async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }]
    });
    return res.json(products);
  } catch (error) {
    return next(error);
  }
});

router.post("/products", async (req, res, next) => {
  try {
    const { name, imageUrl, sizeDescription, categoryId, active } = req.body;
    if (!name || !categoryId) {
      return res.status(400).json({ message: "Product name and category are required." });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        imageUrl: imageUrl?.trim() || null,
        sizeDescription: sizeDescription?.trim() || null,
        categoryId: Number(categoryId),
        active: active ?? true,
        createdById: req.user.id
      }
    });
    return res.status(201).json(product);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "This product name/size combination already exists." });
    }
    return next(error);
  }
});

router.put("/products/:id", async (req, res, next) => {
  try {
    const productId = Number(req.params.id);
    const { name, imageUrl, sizeDescription, categoryId, active } = req.body;

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(imageUrl !== undefined ? { imageUrl: imageUrl?.trim() || null } : {}),
        ...(sizeDescription !== undefined ? { sizeDescription: sizeDescription?.trim() || null } : {}),
        ...(categoryId !== undefined ? { categoryId: Number(categoryId) } : {}),
        ...(active !== undefined ? { active: Boolean(active) } : {})
      }
    });
    return res.json(product);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "This product name/size combination already exists." });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Product not found." });
    }
    return next(error);
  }
});

router.delete("/products/:id", async (req, res, next) => {
  try {
    const productId = Number(req.params.id);
    const hasOrderItems = await prisma.orderItem.count({ where: { productId } });
    if (hasOrderItems > 0) {
      return res.status(400).json({ message: "Cannot delete product used in orders. Set it inactive instead." });
    }
    await prisma.product.delete({ where: { id: productId } });
    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Product not found." });
    }
    return next(error);
  }
});

router.get("/stores/:storeId/availability", async (req, res, next) => {
  try {
    const storeId = Number(req.params.storeId);
    const rows = await prisma.storeProductAvailability.findMany({
      where: { storeId },
      include: { product: { include: { category: true } } },
      orderBy: { product: { name: "asc" } }
    });
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
});

router.put("/stores/:storeId/availability", async (req, res, next) => {
  try {
    const storeId = Number(req.params.storeId);
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "items[] is required." });
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.storeProductAvailability.upsert({
          where: {
            storeId_productId: {
              storeId,
              productId: Number(item.productId)
            }
          },
          update: { isAvailable: Boolean(item.isAvailable) },
          create: {
            storeId,
            productId: Number(item.productId),
            isAvailable: Boolean(item.isAvailable)
          }
        })
      )
    );

    const updated = await prisma.storeProductAvailability.findMany({
      where: { storeId },
      include: { product: { include: { category: true } } },
      orderBy: { product: { name: "asc" } }
    });

    return res.json(updated);
  } catch (error) {
    return next(error);
  }
});

router.post("/users/storekeepers", async (req, res, next) => {
  try {
    const { email, password, storeId } = req.body;
    if (!email || !password || !storeId || password.length < 8) {
      return res.status(400).json({ message: "email, password (min 8), and storeId are required." });
    }

    const store = await prisma.store.findUnique({ where: { id: Number(storeId) } });
    if (!store) {
      return res.status(404).json({ message: "Store not found." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        role: "STORE",
        storeId: Number(storeId)
      },
      select: { id: true, email: true, role: true, storeId: true }
    });
    return res.status(201).json(user);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Email already in use." });
    }
    return next(error);
  }
});

router.get("/orders", async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        store: true,
        items: { include: { product: { include: { category: true } } } }
      },
      orderBy: { submittedAt: "desc" }
    });
    return res.json(orders);
  } catch (error) {
    return next(error);
  }
});

router.get("/orders/:id", async (req, res, next) => {
  try {
    const orderId = Number(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        store: true,
        items: { include: { product: { include: { category: true } } } }
      }
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.status === "SUBMITTED") {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "VIEWED" }
      });
      order.status = "VIEWED";
    }

    return res.json(order);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
