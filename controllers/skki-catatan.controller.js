const { validationResult } = require('express-validator');
const Tokens = require('csrf');

const Skki = require("../models/skki");
const SkkiCatatan = require("../models/skkiCatatan");

const formatError = require('../helper/error-formatter');

const tokens = new Tokens();
const secret = tokens.secretSync();

async function getSkkiCatatan(req, res) {
  try {
    const skki = await Skki.findOne({ _id: req.params.id }).lean();

    const catatans = await SkkiCatatan.find({ skki_id: skki._id }).lean();

    res.render("skki/detail/catatan/index", {
      title: "catatan SKKI",
      skki: skki,
      catatans: catatans,
      token: tokens.create(secret),
      errors: req.flash('errors')[0] || {},
      old: req.flash('old')[0] || {}
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function storeSkkiCatatan(req, res) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash('errors', formatError(errors.array()));
      req.flash('old', req.body);
      return res.redirect('/skki/'+req.params.id+'/catatan');
    }

    const { 
      catatan,
      token
    } = req.body;

    if (!tokens.verify(secret, token)) {
      throw new Error('invalid token!')
    }

    const skkiCatatan = new SkkiCatatan({
      skki_id: req.params.id,
      catatan: catatan,
      created_at: new Date().toISOString()
    });

    await skkiCatatan.save();

    req.flash('toast', req.flash('toast', {
      success: true,
      message: 'Catatan berhasil ditambahkan'
    }));

    res.redirect("/skki/"+req.params.id+"/catatan");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getSkkiCatatan,
  storeSkkiCatatan
}