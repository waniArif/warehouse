const express = require("express");

const auth = require("../middleware/auth");
const Admin = require("../models/admin");

const router = new express.Router();

// signup
router.post("/admins", async (req, res) => {
  const admin = new Admin(req.body);

  try {
    await admin.save();

    const token = await admin.generateAuthToken();
    res.status(201).send({ admin, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

// admin login
router.post("/admins/login", async (req, res) => {
  try {
    const admin = await Admin.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await admin.generateAuthToken();
    res.send({ admin /* : admin.getPublicProfile() */, token });
  } catch (error) {
    res.status(400).send();
  }
});

// log out route
router.post("/admins/logout", auth, async (req, res) => {
  try {
    req.admin.tokens = req.admin.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.admin.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

// logout all

router.post("/admins/logoutAll", auth, async (req, res) => {
  try {
    req.admin.tokens = [];
    await req.admin.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

router.get("/admins/me", auth, async (req, res) => {
  res.send(req.admin);
});

router.get("/admins/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const admin = await Admin.findById(_id);
    if (!admin) {
      return res.status(404).send();
    }

    res.send(admin);
  } catch (error) {
    res.status(500).send();
  }
});

router.patch("/admins/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password"];

  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({
      error: "Invalid Updates!",
    });
  }

  try {
    updates.forEach((update) => {
      req.admin[update] = req.body[update];
    });

    await req.admin.save();

    res.send(req.admin);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Deleting admins
router.delete("/admins/me", auth, async (req, res) => {
  try {
    // const admin = await Admin.findByIdAndDelete(req.admin._id);

    // admin ? res.send(admin) : res.status(404).send();
    await req.admin.remove();

    res.send(req.admin);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
