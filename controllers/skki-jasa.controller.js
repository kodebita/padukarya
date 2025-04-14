const { validationResult } = require('express-validator');
const formatError = require('../helper/error-formatter');
const Tokens = require('csrf');

const tokens = new Tokens();
const secret = tokens.secretSync();

const Skki = require("../models/skki");
const Prk = require("../models/prk");
const PrkJasa = require("../models/prkJasa");

async function getSkkiJasa(req, res) {
  try {
    const skki = await Skki.findOne({ _id: req.params.id }).lean();

    let jasas = [];

    const prks = await Prk.find({ prk_skki_id: skki._id }).lean();
    for (let prk of prks) {
      let prk_jasas = await PrkJasa.find({ prk_id: prk._id }).lean();
      for (let prk_jasa of prk_jasas) {
        prk_jasa.nomor_prk = prk.nomor_prk;
        jasas.push(prk_jasa);
      }
    }

    res.render("skki/detail/jasa/index", {
      title: "RAB Jasa SKKI",
      skki: skki,
      jasas: jasas,
      toast: req.flash('toast')[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createSkkiJasa(req, res) {
  try {
    const token = tokens.create(secret);
    const skki = await Skki.findOne({ _id: req.params.id }).lean();

    res.render("skki/detail/jasa/create", {
      title: "RAB Jasa SKKI",
      skki: skki,
      token: token,
      errors: req.flash('errors')[0] || {},
      old: req.flash('old')[0] || {},
      toast: req.flash('toast')[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function storeSkkiJasa(req, res) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash('errors', formatError(errors.array()));
      req.flash('old', req.body);
      return res.redirect('/skki/' + req.params.id + '/jasa/baru');
    }

    const {
      prk_id,
      nama_jasa,
      harga,
      token
    } = req.body;

    if (!tokens.verify(secret, token)) {
      throw new Error('invalid token!')
    }

    const prkJasa = new PrkJasa({
      prk_id: prk_id,
      nama_jasa: nama_jasa.trim(),
      harga: harga,
    });

    await prkJasa.save();

    res.redirect("/skki/" + req.params.id + "/jasa");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getSkkiJasaById(req, res) {
  try {
    const token = tokens.create(secret);
    const skki = await Skki.findOne({ _id: req.params.id }).lean();
    const jasa = await PrkJasa.findOne({ _id: req.params.jasaId }).lean();
    const prk = await Prk.findOne({ _id: jasa.prk_id }).lean();

    res.render("skki/detail/jasa/detail", {
      title: "RAB Jasa SKKI",
      skki: skki,
      prk: prk,
      jasa: jasa,
      token: token,
      errors: req.flash('errors')[0] || {},
      old: req.flash('old')[0] || {},
      toast: req.flash('toast')[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateSkkiJasaById(req, res) {
  const skkiId = req.params.id;
  const jasaId = req.params.jasaId;
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('errors', formatError(errors.array()));
      req.flash('old', req.body);
      return res.redirect('/skki/' + skkiId + '/jasa/' + jasaId);
    }
    const { token, nama_jasa, harga } = req.body;
    if (!tokens.verify(secret, token)) {
      throw new Error('invalid token!')
    }
    const updateData = {
      nama_jasa: nama_jasa.trim(),
      harga: harga,
      updated_at: new Date().toISOString(), // auto-update updated_at
    };
    const updatedPrkJasa = await PrkJasa.findByIdAndUpdate(jasaId, updateData, {
      new: true, // return updated document
      runValidators: true,
    });

    if (!updatedPrkJasa) {
      req.flash('toast', {
        success: false,
        message: 'Terjadi kesalahan'
      });
      res.redirect("/skki/" + skkiId + '/jasa/' + jasaId);
    }

    // success
    req.flash('toast', req.flash('toast', {
      success: true,
      message: 'Jasa berhasil diperbarui'
    }));

    // redirect to the same page
    res.redirect("/skki/" + skkiId + '/jasa/' + jasaId);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteSkkiJasaById(req, res) {
  try {
    const skkiId = req.params.id;
    const jasaId = req.params.jasaId;

    const deletedPrkJasa = await PrkJasa.findByIdAndDelete(jasaId);
    if (!deletedPrkJasa) {
      req.flash('toast', req.flash('toast', {
        success: false,
        message: 'Terjadi kesalahan'
      }));
    } else {
      // success
      req.flash('toast', req.flash('toast', {
        success: true,
        message: 'Jasa berhasil dihapus'
      }));
    }

    // redirect to the same page
    res.redirect("/skki/" + skkiId + '/jasa');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getSkkiJasa,
  createSkkiJasa,
  storeSkkiJasa,
  getSkkiJasaById,
  updateSkkiJasaById,
  deleteSkkiJasaById
};