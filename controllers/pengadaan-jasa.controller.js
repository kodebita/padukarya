const { validationResult } = require('express-validator');
const Tokens = require('csrf');

const tokens = new Tokens();
const secret = tokens.secretSync();

const formatError = require('../helper/error-formatter');

// Model
const Prk = require("../models/prk");
const PrkJasa = require("../models/prkJasa");
const Pengadaan = require("../models/pengadaan");
const PengadaanJasa = require("../models/pengadaanJasa");
const Skki = require("../models/skki");

async function getPengadaanJasa(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();
    const jasas = await PengadaanJasa.find({
      pengadaan_id: pengadaan._id,
    }).lean();

    for (let jasa of jasas) {
      let prk = await Prk.findOne({ _id: jasa.prk_id }).lean();
      jasa.nomor_prk = prk.nomor_prk;
    }

    res.render("pengadaan/detail/jasa/index", {
      title: "RAB Jasa Pengadaan",
      pengadaan: pengadaan,
      jasas: jasas,
      toast: req.flash('toast')[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getPengadaanJasaJson(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();
    const jasas = await PengadaanJasa.find({
      pengadaan_id: pengadaan._id,
    }).lean();

    res.json({
      success: true,
      message: "Berhasil mendapatkan data RAB Jasa",
      data: jasas,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createPengadaanJasa(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({_id: req.params.id}).lean();

    res.render("pengadaan/detail/jasa/create", {
      title: "Tambah RAB Jasa Pengadaan",
      pengadaan: pengadaan,
      token: tokens.create(secret),
      errors: req.flash('errors')[0] || {},
      old: req.flash('old')[0] || {},
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function storePengadaanJasa(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();

    // validate pengadaan
    if(!pengadaan) {
      req.flash('toast', {
        success: false,
        message: 'Pengadaan tidak ditemukan',
      });
      return res.redirect('/pengadaan/'+req.params.id+'/jasa/baru');
    }

    const { 
      prk_jasa_id,
      nama_jasa,
      harga,
      token
    } = req.body;

    if (!tokens.verify(secret, token)) {
      throw new Error('invalid token!')
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('errors', formatError(errors.array()));
      req.flash('old', req.body);
      req.flash('toast', {
        type: 'error',
        message: 'Gagal menambahkan RAB Jasa',
      });
      return res.redirect('/pengadaan/'+req.params.id+'/jasa/baru');
    }

    // validate prk jasa
    const prkJasa = await PrkJasa.findOne({ _id: prk_jasa_id }).lean();
    if (!prkJasa) {
      req.flash('toast', {
        type: 'error',
        message: 'PRK Jasa tidak ditemukan',
      });
      return res.redirect('/pengadaan/'+req.params.id+'/jasa/baru');
    }
    
    // update pengadaan_id pada prk jasa
    const updateData = {
      pengadaan_id: req.params.id,
      updated_at: new Date().toISOString(), // auto-update updated_at
    };

    const update = await PrkJasa.findByIdAndUpdate(prkJasa, updateData, {
      new: true, // return updated document
      runValidators: true,
    });

    if (!update) {
      req.flash('toast', {
        success: false,
        message: 'Terjadi kesalahan'
      });
      res.redirect("/pengadaan/" + req.params.id + '/jasa/baru');
    }

    // insert jasa pada pengadaan jasa
    const jasa = new PengadaanJasa({
      pengadaan_id: req.params.id,
      prk_id: prkJasa.prk_id,
      prk_jasa_id: prkJasa._id,
      nama_jasa: nama_jasa,
      harga: harga,
      created_at: new Date().toISOString()
    });

    await jasa.save();

    req.flash('toast', {
      success: true,
      message: 'Berhasil menambahkan RAB Jasa'
    });

    res.redirect("/pengadaan/" + req.params.id + '/jasa');
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
}

async function getPengadaanJasaById(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();
    const skki = await Skki.findOne({ _id: pengadaan.skki_id }).lean();
    const jasa = await PengadaanJasa.findOne({ _id: req.params.jasaId }).lean();
    const prk = await Prk.findOne({ _id: jasa.prk_id }).lean();
    const prkJasa = await PrkJasa.findOne({ _id: jasa.prk_jasa_id }).lean();  

    if (!pengadaan) {
      req.flash('toast', {
        type: 'error',
        message: 'Pengadaan tidak ditemukan',
      });
      return res.redirect('/pengadaan/'+req.params.id+'/jasa');
    }

    if (!jasa) {
      req.flash('toast', {
        type: 'error',
        message: 'RAB Jasa tidak ditemukan',
      });
      return res.redirect('/pengadaan/'+req.params.id+'/jasa');
    }

    res.render("pengadaan/detail/jasa/detail", {
      title: "Informasi RAB Jasa Pengadaan",
      pengadaan: pengadaan,
      jasa: jasa,
      skki: skki,
      prk: prk,
      prkJasa: prkJasa,
      token: tokens.create(secret),
      errors: req.flash('errors')[0] || {},
      old: req.flash('old')[0] || {},
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getPengadaanJasaByIdJson(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();
    if (!pengadaan) {
      return res.status(404).json({
        success: false,
        message: 'Pengadaan tidak ditemukan',
      });
    }

    const jasa = await PengadaanJasa.findOne({ _id: req.params.jasaId }).lean();
    if (!jasa) {
      return res.status(404).json({
        success: false,
        message: 'RAB Jasa tidak ditemukan',
      });
    }

    res.json({
      success: true,
      message: 'Berhasil mendapatkan data RAB Jasa',
      data: jasa,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updatePengadaanJasaById(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();
    if(!pengadaan) {
      req.flash('toast', {
        success: false,
        message: 'Pengadaan tidak ditemukan',
      });
      return res.redirect('/pengadaan/'+req.params.id+'/jasa');
    }

    const jasa = await PengadaanJasa.findOne({ _id: req.params.jasaId }).lean();
    if(!jasa) {
      req.flash('toast', {
        success: false,
        message: 'RAB Jasa tidak ditemukan',
      });
      return res.redirect('/pengadaan/'+req.params.id+'/jasa');
    }

    const { 
      nama_jasa,
      harga,
      token
    } = req.body;

    if (!tokens.verify(secret, token)) {
      throw new Error('invalid token!')
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('errors', formatError(errors.array()));
      req.flash('old', req.body);
      req.flash('toast', {
        success: false,
        message: 'Gagal mengupdate RAB Jasa',
      });
      return res.redirect('/pengadaan/'+req.params.id+'/jasa/'+req.params.jasaId);
    }

    // update jasa pada pengadaan jasa
    const update = await PengadaanJasa.findByIdAndUpdate(jasa._id, {
      nama_jasa: nama_jasa,
      harga: harga,
      updated_at: new Date().toISOString(), // auto-update updated_at
    }, {
      new: true, // return updated document
      runValidators: true,
    });
    if (!update) {
      req.flash('toast', {
        success: false,
        message: 'Gagal mengupdate RAB Jasa',
      });
    }

    req.flash('toast', {
      success: true,
      message: 'Berhasil mengupdate RAB Jasa'
    });
    res.redirect("/pengadaan/" + req.params.id + '/jasa/');
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
}

async function deletePengadaanJasaById(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();
    const jasa = await PengadaanJasa.findOne({ _id: req.params.jasaId }).lean();

    if (!pengadaan) {
      req.flash('toast', {
        type: 'error',
        message: 'Pengadaan tidak ditemukan',
      });
      return res.redirect('/pengadaan/'+req.params.id+'/jasa');
    }

    if (!jasa) {
      req.flash('toast', {
        type: 'error',
        message: 'RAB Jasa tidak ditemukan',
      });
      return res.redirect('/pengadaan/'+req.params.id+'/jasa');
    }

    // update prk jasa
    await PrkJasa.findByIdAndUpdate(jasa.prk_jasa_id, {
      pengadaan_id: null,
      updated_at: new Date().toISOString(), // auto-update updated_at
    }, {
      new: true, // return updated document
      runValidators: true,
    });

    await PengadaanJasa.deleteOne({ _id: jasa._id });

    req.flash('toast', {
      success: true,
      message: 'Berhasil menghapus RAB Jasa'
    });

    res.redirect("/pengadaan/" + req.params.id + '/jasa');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getPengadaanJasa,
  getPengadaanJasaJson,
  createPengadaanJasa,
  storePengadaanJasa,
  getPengadaanJasaById,
  getPengadaanJasaByIdJson,
  updatePengadaanJasaById,
  deletePengadaanJasaById
}