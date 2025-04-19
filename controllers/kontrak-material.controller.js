const { validationResult } = require('express-validator');
const Tokens = require('csrf');

const tokens = new Tokens();
const secret = tokens.secretSync();

const formatError = require('../helper/error-formatter');

const Kontrak = require('../models/kontrak');
const Prk = require('../models/prk');
const PrkMaterial = require('../models/prkMaterial');
const Pengadaan = require('../models/pengadaan');
const PengadaanMaterial = require('../models/pengadaanMaterial');

async function getKontrakMaterial(req, res) {
  try {
    const kontrak = await Kontrak.findOne({ _id: req.params.id }).lean();
    if(!kontrak) {
      req.flash('toast', { 
        success: false,
        message: 'Kontrak tidak ditemukan' 
      });
    }

    const materials = await PengadaanMaterial.find({
      kontrak_id: kontrak._id,
    }).lean();

    res.render("kontrak/detail/material/index", {
      title: "Material Kontrak",
      kontrak: kontrak,
      materials: materials,
      token: tokens.create(secret),
      toast: req.flash("toast")[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createKontrakMaterial(req, res) {
  try {
    const kontrak = await Kontrak.findOne({ _id: req.params.id }).lean();

    if(!kontrak) {
      req.flash('toast', { 
        success: false,
        message: 'Kontrak tidak ditemukan' 
      });
      req.redirect('/kontrak/'+req.params.id+'/material');
    }

    res.render("kontrak/detail/material/create", {
      title: "Material Kontrak",
      kontrak: kontrak,
      token: tokens.create(secret),
      errors: req.flash("errors")[0] || {},
      old: req.flash("old")[0] || {},
      toast: req.flash("toast")[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function storeKontrakMaterial(req, res) {
  try {
    const kontrak = Kontrak.findOne({ _id: req.params.id }).lean();
    if(!kontrak) {
      req.flash('toast', { 
        success: false,
        message: 'Kontrak tidak ditemukan' 
      });
      req.redirect('/kontrak/'+req.params.id+'/material');
    }

    const pengadaan = Pengadaan.findOne({ _id: kontrak.pengadaan_id }).lean();
    if(!pengadaan) {
      req.flash('toast', { 
        success: false,
        message: 'Pengadaan tidak ditemukan' 
      });
      req.redirect('/kontrak/'+req.params.id+'/material');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('errors', formatError(errors.array()));
      req.flash('old', req.body);
      return res.redirect('/kontrak/'+req.params.id+'/material/baru');
    }

    const { 
      prk_id,
      prk_material_id,
      harga,
      jumlah,
      token
    } = req.body;
    if (!tokens.verify(secret, token)) {
      throw new Error('invalid token!')
    }

    const prk = await Prk.findOne({ _id: prk_id }).lean();
    if(!prk) {
      req.flash('toast', { 
        success: false,
        message: 'PRK tidak ditemukan' 
      });
      req.redirect('/kontrak/'+req.params.id+'/material');
    }

    const prkMaterial = await PrkMaterial.findOne({ _id: prk_material_id }).lean();
    if(!prkMaterial) {
      req.flash('toast', { 
        success: false,
        message: 'PRK Material tidak ditemukan' 
      });
      req.redirect('/kontrak/'+req.params.id+'/material');
    }

    const pengadaanMaterial = new PengadaanMaterial({
      kode_normalisasi: prkMaterial.kode_normalisasi,
      nama: prkMaterial.nama,
      satuan: prkMaterial.satuan,
      harga: harga,
      jumlah: jumlah,
      prk_id: prk_id,
      prk_material_id: prk_material_id,
      pengadaan_id: pengadaan._id,
      created_at: new Date().toISOString()
    });

    const saved = await pengadaanMaterial.save();
    if(!saved) {
      req.flash('toast', { 
        success: false,
        message: 'Gagal menambahkan material' 
      });
      return res.redirect('/kontrak/'+req.params.id+'/material/baru');
    }
    req.flash('toast', {
      success: true,
      message: 'Berhasil menambahkan material'
    });
    res.redirect('/kontrak/'+req.params.id+'/material');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateKontrakMaterialById(req, res) {
  try {
    const kontrak = Kontrak.findOne({ _id: req.params.id }).lean();
    if(!kontrak) {
      req.flash('toast', { 
        success: false,
        message: 'Kontrak tidak ditemukan' 
      });
      req.redirect('/kontrak/'+req.params.id+'/material');
    }

    const pengadaan = Pengadaan.findOne({ _id: kontrak.pengadaan_id }).lean();
    if(!pengadaan) {
      req.flash('toast', { 
        success: false,
        message: 'Pengadaan tidak ditemukan' 
      });
      req.redirect('/kontrak/'+req.params.id+'/material');
    }

    const pengadaanMaterial = PengadaanMaterial.findOne({ _id: req.params.materialId }).lean();
    if(!pengadaanMaterial) {
      req.flash('toast', { 
        success: false,
        message: 'Material tidak ditemukan' 
      });
      req.redirect('/kontrak/'+req.params.id+'/material');
    }

    await PengadaanMaterial.findByIdAndUpdate(
      { _id: req.params.materialId },
      {
        kode_normalisasi: req.body.kode_normalisasi,
        nama: req.body.nama,
        satuan: req.body.satuan,
        harga: req.body.harga,
        jumlah: req.body.jumlah,
        updated_at: new Date().toISOString()
      }
    );

    req.flash('toast', {
      success: true,
      message: 'Berhasil mengupdate material'
    });

    res.redirect('/kontrak/'+req.params.id+'/material');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getKontrakMaterial,
  createKontrakMaterial,
  storeKontrakMaterial,
}