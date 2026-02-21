const express = require("express");
const prisma = require("../db/prisma");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

function getWeekRange(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + diffToMonday);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return { start, end };
}

router.use(authenticate, authorize("STORE"));

router.get("/products", async (req, res, next) => {
  try {
    const storeId = req.user.storeId;
    if (!storeId) {
      return res.status(400).json({ message: "Store user is not linked to a store." });
    }

    const rows = await prisma.storeProductAvailability.findMany({
      where: {
        storeId,
        isAvailable: true,
        product: { active: true }
      },
      include: {
        product: { include: { category: true } }
      },
      orderBy: [{ product: { category: { name: "asc" } } }, { product: { name: "asc" } }]
    });

    const grouped = rows.reduce((acc, row) => {
      const categoryName = row.product.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(row.product);
      return acc;
    }, {});

    return res.json(grouped);
  } catch (error) {
    return next(error);
  }
});

router.post("/orders", async (req, res, next) => {
  try {
    const storeId = req.user.storeId;
    const items = Array.isArray(req.body.items) ? req.body.items : [];

    if (!storeId) {
      return res.status(400).json({ message: "Store user is not linked to a store." });
    }
    if (items.length === 0) {
      return res.status(400).json({ message: "Order must include at least one item." });
    }

    const cleanItems = items
      .map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity)
      }))
      .filter((item) => Number.isInteger(item.productId) && Number.isInteger(item.quantity) && item.quantity > 0);

    if (cleanItems.length === 0) {
      return res.status(400).json({ message: "No valid order items found." });
    }

    const { start, end } = getWeekRange(new Date());
    const existingOrder = await prisma.order.findFirst({
      where: {
        storeId,
        submittedAt: { gte: start, lt: end }
      }
    });
    if (existingOrder) {
      return res.status(409).json({ message: "This store has already submitted an order this week." });
    }

    const productIds = [...new Set(cleanItems.map((item) => item.productId))];
    const availableCount = await prisma.storeProductAvailability.count({
      where: {
        storeId,
        productId: { in: productIds },
        isAvailable: true,
        product: { active: true }
      }
    });

    if (availableCount !== productIds.length) {
      return res.status(400).json({ message: "Order contains unavailable products." });
    }

    const order = await prisma.order.create({
      data: {
        storeId,
        status: "SUBMITTED",
        items: {
          create: cleanItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        }
      },
      include: {
        items: { include: { product: true } }
      }
    });

    return res.status(201).json(order);
  } catch (error) {
    return next(error);
  }
});

router.get("/orders", async (req, res, next) => {
  try {
    const storeId = req.user.storeId;
    const orders = await prisma.order.findMany({
      where: { storeId },
      include: {
        items: { include: { product: { include: { category: true } } } }
      },
      orderBy: { submittedAt: "desc" }
    });
    return res.json(orders);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
