const { validationResult } = require('express-validator');
const Tokens = require('csrf');

const tokens = new Tokens();
const secret = tokens.secretSync();

const formatError = require('../helper/error-formatter');


// Model
const Pengadaan = require("../models/pengadaan");
const PengadaanCatatan = require("../models/pengadaanCatatan");

async function getPengadaanCatatan(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();

    const catatans = await PengadaanCatatan.find({
      pengadaan_id: pengadaan._id,
    }).lean();

    res.render("pengadaan/detail/catatan/index", {
      title: "Catatan Pengadaan",
      pengadaan: pengadaan,
      catatans: catatans,
      token: tokens.create(secret),
      toast: req.flash('toast')[0] || false,
      errors: req.flash('errors')[0] || {},
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function storePengadaanCatatan(req, res) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash('errors', formatError(errors.array()));
      req.flash('old', req.body);
      return res.redirect('/pengadaan/'+req.params.id+'/catatan');
    }

    const { 
      catatan,
      token
    } = req.body;

    if (!tokens.verify(secret, token)) {
      throw new Error('invalid token!')
    }

    const pengadaanCatatan = new PengadaanCatatan({
      pengadaan_id: req.params.id,
      catatan: catatan,
      created_at: new Date().toISOString()
    });

    await pengadaanCatatan.save();

    req.flash('toast', req.flash('toast', {
      success: true,
      message: 'Catatan berhasil ditambahkan'
    }));

    res.redirect("/pengadaan/"+req.params.id+"/catatan");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getPengadaanCatatan,
  storePengadaanCatatan
}