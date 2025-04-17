const { validationResult } = require('express-validator');
const Tokens = require('csrf');

const tokens = new Tokens();
const secret = tokens.secretSync();

const formatError = require('../helper/error-formatter');

// Model
const Prk = require("../models/prk");
const PrkMaterial = require("../models/prkMaterial");
const PrkJasa = require("../models/prkJasa");
const Pengadaan = require("../models/pengadaan");

async function getPengadaanPrk(req, res) {
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
      toast: req.flash('toast')[0] || false,
      token: tokens.create(secret),
      errors: req.flash('errors')[0] || {},
      old: req.flash('old')[0] || {}
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createPengadaanPrk(req, res) {
  try {
      const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();
  
      res.render("pengadaan/detail/prk/create", {
        title: "Tambah PRK Pengadaan",
        pengadaan: pengadaan,
        token: tokens.create(secret),
        errors: req.flash('errors')[0] || {},
        old: req.flash('old')[0] || {},
        toast: req.flash('toast')[0] || false,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}

async function storePengadaanPrk(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();

    if(!pengadaan) {
      req.flash('toast', {
        success: false,
        message: 'Pengadaan tidak ditemukan'
      })

      return res.redirect('/pengadaan/'+req.params.id+'/prk/baru');
    }

    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      req.flash('errors', formatError(errors.array()));
      req.flash('old', req.body);
      return res.redirect('/pengadaan/'+req.params.id+'/prk/baru');
    }

    const { 
      prk_id,
      token
    } = req.body;

    if (!tokens.verify(secret, token)) {
      throw new Error('invalid token!')
    }

    const updateData = {
      pengadaan_id: pengadaan._id,
      updated_at: new Date().toISOString(), // auto-update updated_at
    };

    const update = await Prk.findByIdAndUpdate(prk_id, updateData, {
      new: true, // return updated document
      runValidators: true,
    });

    if (!update) {
      req.flash('toast', {
        success: false,
        message: 'Terjadi kesalahan'
      });
      res.redirect("/pengadaan/" + req.params.id + '/prk/baru');
    }

    req.flash('toast', {
      success: true,
      message: 'PRK berhasil ditambahkan'
    });

    res.redirect("/pengadaan/" + req.params.id + '/prk');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deletePengadaanPrkById(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();

    if(!pengadaan) {
      req.flash('toast', {
        success: false,
        message: 'Pengadaan tidak ditemukan'
      })

      return res.redirect('/pengadaan/'+req.params.id+'/prk');
    }

    const prk = await Prk.findOne({ _id: req.params.prkId }).lean();

    if(!prk) {
      req.flash('toast', {
        success: false,
        message: 'PRK tidak ditemukan'
      })

      return res.redirect('/pengadaan/'+req.params.id+'/prk');
    }

    await Prk.findByIdAndUpdate(prk._id, {
      pengadaan_id: null,
      updated_at: new Date().toISOString(), // auto-update updated_at
    });

    req.flash('toast', {
      success: true,
      message: 'PRK berhasil dihapus'
    });

    res.redirect("/pengadaan/" + req.params.id + '/prk');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getPengadaanPrk,
  createPengadaanPrk,
  storePengadaanPrk,
  deletePengadaanPrkById
}