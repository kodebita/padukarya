const express = require("express");
const router = express.Router();

// Model
const Prk = require("../models/prk");
const PrkMaterial = require("../models/prkMaterial");
const PrkJasa = require("../models/prkJasa");
const Pengadaan = require("../models/pengadaan");
const PengadaanMaterial = require("../models/pengadaanMaterial");
const PengadaanJasa = require("../models/pengadaanJasa");
const PengadaanLampiran = require("../models/pengadaanLampiran");
const PengadaanCatatan = require("../models/pengadaanCatatan");

router.get("/", async (req, res) => {
  try {
    const pengadaans = await Pengadaan.find().lean();

    for (pengadaan of pengadaans) {
      let rab_material = 0;
      let rab_jasa = 0;

      const pengadaanMaterials = await PengadaanMaterial.find({
        pengadaan_id: pengadaan._id,
      }).lean();
      for (pengadaanMaterial of pengadaanMaterials) {
        rab_material +=
          parseInt(pengadaanMaterial.harga) *
          parseInt(pengadaanMaterial.jumlah);
      }

      const pengadaanJasas = await PengadaanJasa.find({
        pengadaan_id: pengadaan._id,
      }).lean();
      for (pengadaanJasa of pengadaanJasas) {
        rab_jasa += parseInt(pengadaanJasa.harga);
      }

      pengadaan.rab_material = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(rab_material);
      pengadaan.rab_jasa = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(rab_jasa);
    }

    res.render("pengadaan/index", {
      title: "Pengadaan",
      pengadaans: pengadaans,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();

    res.render("pengadaan/detail/index", {
      title: "Informasi Pengadaan",
      pengadaan: pengadaan,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/prk", async (req, res) => {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();

    const prks = await Prk.find({ pengadaan_id: pengadaan._id }).lean();
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

    res.render("pengadaan/detail/prk/index", {
      title: "List PRK Pengadaan",
      pengadaan: pengadaan,
      prks: prks,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/jasa", async (req, res) => {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();
    const jasas = await PengadaanJasa.find({
      pengadaan_id: pengadaan._id,
    }).lean();

    for (jasa of jasas) {
      let prk = await Prk.findOne({ _id: jasa.prk_id }).lean();
      jasa.nomor_prk = prk.nomor_prk;
    }

    res.render("pengadaan/detail/jasa/index", {
      title: "RAB Jasa Pengadaan",
      pengadaan: pengadaan,
      jasas: jasas,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/material", async (req, res) => {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();
    const materials = await PengadaanMaterial.find({
      pengadaan_id: pengadaan._id,
    }).lean();

    for (material of materials) {
      let prk = await Prk.findOne({ _id: material.prk_id }).lean();
      material.nomor_prk = prk.nomor_prk;
    }

    res.render("pengadaan/detail/material/index", {
      title: "RAB Material Pengadaan",
      pengadaan: pengadaan,
      materials: materials,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/lampiran", async (req, res) => {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();

    const lampirans = await PengadaanLampiran.find({
      pengadaan_id: pengadaan._id,
    }).lean();
    res.render("pengadaan/detail/lampiran/index", {
      title: "Lampiran Pengadaan",
      pengadaan: pengadaan,
      lampirans: lampirans,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/catatan", async (req, res) => {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();

    const catatans = await PengadaanCatatan.find({
      pengadaan_id: pengadaan._id,
    }).lean();

    res.render("pengadaan/detail/catatan/index", {
      title: "catatan Pengadaan",
      pengadaan: pengadaan,
      catatans: catatans,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
