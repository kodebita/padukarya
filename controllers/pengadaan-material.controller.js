const { validationResult } = require('express-validator');
const Tokens = require('csrf');

const tokens = new Tokens();
const secret = tokens.secretSync();

const formatError = require('../helper/error-formatter');

// Model
const Prk = require("../models/prk");
const Pengadaan = require("../models/pengadaan");
const PengadaanMaterial = require("../models/pengadaanMaterial");

async function getPengadaanMaterial(req, res) {
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
}

async function createPengadaanMaterial(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();

    res.render("pengadaan/detail/material/create", {
      title: "Tambah Material Pengadaan",
      pengadaan: pengadaan,
      toast: req.flash("toast")[0] || false,
      token: tokens.create(secret),
      errors: req.flash("errors")[0] || {},
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getPengadaanMaterial,
  createPengadaanMaterial
}