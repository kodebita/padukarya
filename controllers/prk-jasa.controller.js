const { validationResult } = require('express-validator');
const Tokens = require('csrf');

const Prk = require("../models/prk");
const PrkJasa = require("../models/prkJasa");

const formatError = require('../helper/error-formatter');

const tokens = new Tokens();
const secret = tokens.secretSync();

async function getPrkJasa(req, res) {
  try {
    const prk = await Prk.findOne({ _id: req.params.id }).lean();

    const jasas = await PrkJasa.find({ prk_id: prk._id }).lean();

    res.render("prk/detail/jasa/index", {
      title: "RAB Jasa PRK",
      prk: prk,
      jasas: jasas,
      toast: req.flash('toast')[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createPrkJasa(req, res) {
  try {
      const token = tokens.create(secret);
      const prk = await Prk.findOne({ _id: req.params.id }).lean();
  
      res.render("prk/detail/jasa/create", {
        title: "RAB Jasa PRK",
        prk: prk,
        token: token,
        errors: req.flash('errors')[0] || {},
        old: req.flash('old')[0] || {},
        toast: req.flash('toast')[0] || false,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}

async function storePrkJasa(req, res) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash('errors', formatError(errors.array()));
      req.flash('old', req.body);
      return res.redirect('/prk/'+req.params.id+'/jasa/baru');
    }

    const { 
      nama_jasa,
      harga,
      token
    } = req.body;

    if (!tokens.verify(secret, token)) {
      throw new Error('invalid token!')
    }

    const prkJasa = new PrkJasa({
      prk_id: req.params.id,
      nama_jasa: nama_jasa.trim(),
      harga: harga,
    });

    await prkJasa.save();

    res.redirect("/prk/"+req.params.id+"/jasa");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getPrkJasaById(req, res) {
  try {
      const token = tokens.create(secret);
      const prk = await Prk.findOne({ _id: req.params.id }).lean();
      const jasa = await PrkJasa.findOne({ _id: req.params.jasaId }).lean();
  
      res.render("prk/detail/jasa/detail", {
        title: "RAB Jasa PRK",
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

async function getPrkJasaByIdJson(req, res) {
  try {
    const prk = await Prk.findOne({ _id: req.params.id }).lean();
    if (!prk) {
      return res.status(404).json({ message: 'PRK not found' });
    }

    const jasa = await PrkJasa.findOne({ _id: req.params.jasaId }).lean();

    if (!jasa) {
      return res.status(404).json({ message: 'Jasa not found' });
    }

    res.json({
      success: true,
      jasa: jasa,
      prk: prk,
      message: 'Jasa found'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updatePrkJasaById(req, res) {
  const id = req.params.id;
  const jasaId = req.params.jasaId;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('errors', formatError(errors.array()));
      req.flash('old', req.body);
      return res.redirect('/prk/' + id + '/jasa/' + jasaId);
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
    console.log(req.body)
    console.log(updateData)
    const updatedPrkJasa = await PrkJasa.findByIdAndUpdate(jasaId, updateData, {
      new: true, // return updated document
      runValidators: true,
    });
    if (!updatedPrkJasa) {
      req.flash('toast', {
        success: false,
        message: 'Terjadi kesalahan'
      });
      res.redirect("/prk/" + id + '/jasa/' + jasaId);
    }
    // success
    req.flash('toast', req.flash('toast', {
      success: true,
      message: 'Jasa berhasil diperbarui'
    }));
    // redirect to the same page
    res.redirect("/prk/" + id + '/jasa/' + jasaId);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deletePrkJasaById(req, res) {
  const id = req.params.id;
  const jasaId = req.params.jasaId;
  try {
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
    res.redirect("/prk/" + id + '/jasa');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { 
  getPrkJasa, 
  createPrkJasa, 
  storePrkJasa, 
  getPrkJasaById, 
  getPrkJasaByIdJson,
  updatePrkJasaById, 
  deletePrkJasaById 
};