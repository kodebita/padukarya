const { validationResult } = require('express-validator');
const Tokens = require('csrf');

const tokens = new Tokens();
const secret = tokens.secretSync();

const formatError = require('../helper/error-formatter');
const kontrak = require('../models/kontrak');
const kontrakCatatan = require('../models/kontrakCatatan');

async function getKontrakCatatan(req, res) {
  try {
    const kontrak = await kontrak.findOne({ _id: req.params.id }).lean();

    const catatans = await kontrakCatatan.find({
      kontrak_id: kontrak._id,
    }).lean();

    res.render("kontrak/detail/catatan/index", {
      title: "Catatan Kontrak",
      kontrak: kontrak,
      catatans: catatans,
      token: tokens.create(secret),
      toast: req.flash('toast')[0] || false,
      errors: req.flash('errors')[0] || {},
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function storeKontrakCatatan(req, res) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash('errors', formatError(errors.array()));
      req.flash('old', req.body);
      return res.redirect('/kontrak/'+req.params.id+'/catatan');
    }

    const { 
      catatan,
      token
    } = req.body;

    if (!tokens.verify(secret, token)) {
      throw new Error('invalid token!')
    }

    const kontrakCatatan = new kontrakCatatan({
      kontrak_id: req.params.id,
      catatan: catatan,
      created_at: new Date().toISOString()
    });

    await kontrakCatatan.save();

    req.flash('toast', {
      success: true,
      message: 'Berhasil menambahkan catatan'
    });

    res.redirect('/kontrak/'+req.params.id+'/catatan');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getKontrakCatatan,
  storeKontrakCatatan,
}