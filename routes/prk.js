const express = require("express");
const router = express.Router();

// Model
const Prk = require("../models/prk");
const PrkMaterial = require("../models/prkMaterial");
const PrkJasa = require("../models/prkJasa");
const PrkLampiran = require("../models/prkLampiran");
const PrkCatatan = require("../models/prkCatatan");

router.get("/", async (req, res) => {
  try {
    const prks = await Prk.find().lean();
    for (const prk of prks) {
      let rab_material = 0;
      let rab_jasa = 0;

      let materials = await PrkMaterial.find({ prk_id: prk._id }).lean();
      for (let material of materials) {
        rab_material += parseInt(material.harga) * parseInt(material.jumlah);
      }

      let jasas = await PrkJasa.find({ prk_id: prk._id }).lean();
      for (let jasa of jasas) {
        rab_jasa += parseInt(jasa.harga);
      }

      prk.rab_material = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(rab_material);
      prk.rab_jasa = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(rab_jasa);
    }

    console.log(process.memoryUsage());

    res.render("prk/index", {
      title: "PRK",
      prks: prks,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const prk = await Prk.findOne({ _id: req.params.id }).lean();

    res.render("prk/detail/index", {
      title: "Informasi PRK",
      prk: prk,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/jasa", async (req, res) => {
  try {
    const prk = await Prk.findOne({ _id: req.params.id }).lean();

    const jasas = await PrkJasa.find({ prk_id: prk._id }).lean();

    res.render("prk/detail/jasa/index", {
      title: "RAB Jasa PRK",
      prk: prk,
      jasas: jasas,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/material", async (req, res) => {
  try {
    const prk = await Prk.findOne({ _id: req.params.id }).lean();

    const materials = await PrkMaterial.find({ prk_id: prk._id }).lean();

    res.render("prk/detail/material/index", {
      title: "RAB Material PRK",
      prk: prk,
      materials: materials,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/lampiran", async (req, res) => {
  try {
    const prk = await Prk.findOne({ _id: req.params.id }).lean();

    const lampirans = await PrkLampiran.find({ prk_id: prk._id }).lean();

    res.render("prk/detail/lampiran/index", {
      title: "Lampiran PRK",
      prk: prk,
      lampirans: lampirans,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/catatan", async (req, res) => {
  try {
    const prk = await Prk.findOne({ _id: req.params.id }).lean();

    const catatans = await PrkCatatan.find({ prk_id: prk._id }).lean();

    res.render("prk/detail/catatan/index", {
      title: "catatan PRK",
      prk: prk,
      catatans: catatans,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
