const { validationResult } = require('express-validator');
const Tokens = require('csrf');

const Prk = require("../models/prk");
const PrkCatatan = require("../models/prkCatatan");

const formatError = require('../helper/error-formatter');

const tokens = new Tokens();
const secret = tokens.secretSync();

async function getPrkCatatan(req, res) {
try {
    const prk = await Prk.findOne({ _id: req.params.id }).lean();
    const token = tokens.create(secret);
    const catatans = await PrkCatatan.find({ prk_id: prk._id }).lean();

    res.render("prk/detail/catatan/index", {
      title: "Catatan PRK",
      prk: prk,
      catatans: catatans,
      token: token,
      errors: req.flash('errors')[0] || {},
      old: req.flash('old')[0] || {}
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function storePrkCatatan(req, res) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash('errors', formatError(errors.array()));
      req.flash('old', req.body);
      return res.redirect('/prk/'+req.params.id+'/catatan');
    }

    const { 
      catatan,
      token
    } = req.body;

    if (!tokens.verify(secret, token)) {
      throw new Error('invalid token!')
    }

    const prkCatatan = new PrkCatatan({
      prk_id: req.params.id,
      catatan: catatan,
      created_at: new Date().toISOString()
    });

    await prkCatatan.save();

    req.flash('toast', req.flash('toast', {
      success: true,
      message: 'Catatan berhasil ditambahkan'
    }));

    res.redirect("/prk/"+req.params.id+"/catatan");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getPrkCatatan, storePrkCatatan };