const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const Product = require("../models/product");

// Products

// create a product with an authenticated admin
router.post("/products", auth, async (req, res) => {
  const product = new Product({
    ...req.body,
    owner: req.admin._id,
  });

  try {
    await product.save();
    res.status(201).send(product);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Read all products GET /products?completed=true
// GET /products?limit=10&skip=20
// GET /products?sortBy=createdAt_asc (_desc or use : instead of _)

router.get("/products", auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    await req.product
      .populate({
        path: "products",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();

    res.send(req.admin.products);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Read products by ID
router.get("/products/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const product = await Product.findOne({ _id, owner: req.admin._id });

    if (!product) {
      return res.status(404).send();
    }
    res.send(product);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a product
router.patch("/product/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "expiryDate"];

  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({
      error: "Invalid Updates!",
    });
  }

  try {
    const product = await Product.findOne({
      _id: req.params.id,
      owner: req.admin._id,
    });

    if (!product) {
      return res.status(404).send();
    }
    updates.forEach((update) => (product[update] = req.body[update]));
    await product.save();
    res.send(product);
  } catch (error) {
    res.status(400).send(error);
  }
});

// delete a product

router.delete("/products/:id", auth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      owner: req.admin._id,
    });

    product ? res.send(product) : res.status(404).send();
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
