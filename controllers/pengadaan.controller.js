const { validationResult } = require('express-validator');
const Tokens = require('csrf');

const tokens = new Tokens();
const secret = tokens.secretSync();

const formatError = require('../helper/error-formatter');

// Model
const Pengadaan = require("../models/pengadaan");
const PengadaanMaterial = require("../models/pengadaanMaterial");
const PengadaanJasa = require("../models/pengadaanJasa");

async function getPengadaan(req, res) {
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
}

async function createPengadaan(req, res) {
  const token = tokens.create(secret);
  
  res.render("pengadaan/create", {
    title: "Pengadaan Baru",
    token: token,
    data: {
      tahun: new Date().getFullYear(),
    },
    errors: req.flash('errors')[0] || {},
    old: req.flash('old')[0] || {}
  });
}

async function storePengadaan(req, res) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash('errors', formatError(errors.array()));
      req.flash('old', req.body);
      return res.redirect('/pengadaan/baru');
    }

    const { 
      tahun,
      basket,
      nama_project,
      nodin,
      tanggal_nodin,
      nomor_pr_jasa,
      nomor_prk_skki,
      status,
      type,
      token
    } = req.body;

    if (!tokens.verify(secret, token)) {
      throw new Error('invalid token!')
    }

    const pengadaan = new Pengadaan({
      tahun: tahun,
      basket: basket,
      nama_project: nama_project,
      nodin: nodin,
      tanggal_nodin: tanggal_nodin,
      nomor_pr_jasa: nomor_pr_jasa,
      nomor_prk_skki: nomor_prk_skki,
      status: status,
      type: type,
      created_at: new Date().toISOString(),
    });

    const save = await pengadaan.save();

    res.redirect("/pengadaan/"+save._id);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getPengadaanById(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();

    res.render("pengadaan/detail/index", {
      title: "Informasi Pengadaan",
      pengadaan: pengadaan,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getPengadaan,
  createPengadaan,
  storePengadaan,
  getPengadaanById
}