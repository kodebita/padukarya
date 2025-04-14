const { validationResult } = require('express-validator');
const formatError = require('../helper/error-formatter');
const Tokens = require('csrf');

const tokens = new Tokens();
const secret = tokens.secretSync();

const Skki = require("../models/skki");
const Prk = require("../models/prk");
const PrkMaterial = require("../models/prkMaterial");
const PrkJasa = require("../models/prkJasa");

async function getSkkiPrk(req, res) {
  try {
    const skki = await Skki.findOne({ _id: req.params.id }).lean();
    const prks = await Prk.find({ prk_skki_id: skki._id }).lean();
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

    res.render("skki/detail/prk/index", {
      title: "List PRK SKKI",
      skki: skki,
      prks: prks,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createSkkiPrk(req, res) {
  try {
    const skki = await Skki.findOne({ _id: req.params.id }).lean();

    res.render("skki/detail/prk/create", {
      title: "Tambah PRK SKKI",
      skki: skki,
      token: tokens.create(secret),
      errors: req.flash('errors')[0] || {},
      old: req.flash('old')[0] || {}
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function storeSkkiPrk(req, res) {
  try{
    const skkiId = req.params.id;

    const skki = await Skki.findOne({ _id: skkiId }).lean();
    if(!skki) {
      req.flash('errors', { skki_id: 'SKKI tidak ditemukan' });
      return res.redirect('/skki/'+skkiId+'/prk/baru');
    }
    
    const { 
      prk_id,
      token
    } = req.body;

    if(!tokens.verify(secret, token)) {
      throw new Error('invalid token!')
    }

    const prk = await Prk.findOne({ _id: prk_id }).lean();
    if(!prk) {
      req.flash('errors', { prk_id: 'PRK tidak ditemukan' });
      req.flash('old', req.body);
      return res.redirect('/skki/' + id + '/prk/baru');
    }

    await Prk.updateOne({ _id: prk._id }, { $set: { prk_skki_id: skki._id } });

    req.flash('toast', req.flash('toast', {
      success: true,
      message: 'PRK berhasil ditambahkan'
    }));

    res.redirect("/skki/"+skkiId+"/prk");
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteSkkiPrk(req, res) {
  try {
    const skkiId = req.params.id;
    const prkId = req.params.prkId;

    const updateData = {
      prk_skki_id: null,
      updated_at: new Date().toISOString(), // auto-update updated_at
    };

    const updatedPrk = await Prk.findByIdAndUpdate(prkId, updateData, {
      new: true, // return updated document
      runValidators: true,
    });

    if (!updatedPrk) {
      req.flash('toast', {
        success: false,
        message: 'PRK tidak ditemukan'
      });
      res.redirect("/skki/" + skkiId + "/prk");
    }

    // success
    req.flash('toast', req.flash('toast', {
      success: true,
      message: 'PRK berhasil dihapus dari SKKI'
    }));

    // redirect to the same page
    res.redirect("/skki/" + skkiId + "/prk");
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getSkkiPrk,
  createSkkiPrk,
  storeSkkiPrk,
  deleteSkkiPrk
};