const express = require("express");
const router = express.Router();

// Model
const Prk = require("../models/prk");
const PrkMaterial = require("../models/prkMaterial");
const PrkJasa = require("../models/prkJasa");
const Skki = require("../models/skki");
const SkkiLampiran = require("../models/skkiLampiran");
const SkkiCatatan = require("../models/skkiCatatan");

router.get("/", async (req, res) => {
  try {
    const skkis = await Skki.find().lean();

    for (let skki of skkis) {
      let prks = await Prk.find({ prk_skki_id: skki._id }).lean();
      let rab_jasa = 0;
      let rab_material = 0;
      for (let prk of prks) {
        let materials = await PrkMaterial.find({ prk_id: prk._id }).lean();
        for (let material of materials) {
          rab_material += parseInt(material.harga) * parseInt(material.jumlah);
        }

        let jasas = await PrkJasa.find({ prk_id: prk._id }).lean();
        for (let jasa of jasas) {
          rab_jasa += parseInt(jasa.harga);
        }
      }

      skki.rab_jasa = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(rab_jasa);
      skki.rab_material = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(rab_material);
    }

    res.render("skki/index", {
      title: "SKKI",
      skkis: skkis,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const skki = await Skki.findOne({ _id: req.params.id }).lean();

    res.render("skki/detail/index", {
      title: "Informasi SKKI",
      skki: skki,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/prk", async (req, res) => {
  try {
    const skki = await Skki.findOne({ _id: req.params.id }).lean();
    const prks = await Prk.find({ prk_skki_id: skki._id }).lean();
    for (let prk of prks) {
      let wbs_material = 0;
      let wbs_jasa = 0;

      let materials = await PrkMaterial.find({ prk_id: prk._id }).lean();
      for (let material of materials) {
        wbs_material += parseInt(material.harga) * parseInt(material.jumlah);
      }

      let jasas = await PrkJasa.find({ prk_id: prk._id }).lean();
      for (let jasa of jasas) {
        wbs_jasa += parseInt(jasa.harga);
      }

      prk.wbs_jasa = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(wbs_jasa);
      prk.wbs_material = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(wbs_material);
    }

    res.render("skki/detail/prk/index", {
      title: "List PRK SKKI",
      skki: skki,
      prks: prks,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/jasa", async (req, res) => {
  try {
    const skki = await Skki.findOne({ _id: req.params.id }).lean();

    let jasas = [];

    const prks = await Prk.find({ prk_skki_id: skki._id }).lean();
    for (let prk of prks) {
      let prk_jasas = await PrkJasa.find({ prk_id: prk._id }).lean();
      for (let prk_jasa of prk_jasas) {
        prk_jasa.nomor_prk = prk.nomor_prk;
        jasas.push(prk_jasa);
      }
    }

    res.render("skki/detail/jasa/index", {
      title: "RAB Jasa SKKI",
      skki: skki,
      jasas: jasas,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/material", async (req, res) => {
  try {
    const skki = await Skki.findOne({ _id: req.params.id }).lean();

    let materials = [];

    const prks = await Prk.find({ prk_skki_id: skki._id }).lean();
    for (let prk of prks) {
      let prk_materials = await PrkMaterial.find({ prk_id: prk._id }).lean();
      for (let prk_material of prk_materials) {
        prk_material.nomor_prk = prk.nomor_prk;
        materials.push(prk_material);
      }
    }

    res.render("skki/detail/material/index", {
      title: "RAB Material SKKI",
      skki: skki,
      materials: materials,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/lampiran", async (req, res) => {
  try {
    const skki = await Skki.findOne({ _id: req.params.id }).lean();

    const lampirans = await SkkiLampiran.find({ skki_id: skki._id }).lean();
    res.render("skki/detail/lampiran/index", {
      title: "Lampiran SKKI",
      skki: skki,
      lampirans: lampirans,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/catatan", async (req, res) => {
  try {
    const skki = await Skki.findOne({ _id: req.params.id }).lean();

    const catatans = await SkkiCatatan.find({ skki_id: skki._id }).lean();

    res.render("skki/detail/catatan/index", {
      title: "catatan SKKI",
      skki: skki,
      catatans: catatans,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
