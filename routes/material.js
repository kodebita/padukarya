const express = require("express");
const router = express.Router();

const Material = require("../models/material");

router.get("/json", async (req, res) => {
  try {
    const materials = await Material.find().lean();

    return res.json({
      status: true,
      message: "List Material",
      data: materials,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/json", async (req, res) => {
  try {
    const material = await Material.findOne({_id: req.params.id}).lean();

    return res.json({
      status: true,
      data: material,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;