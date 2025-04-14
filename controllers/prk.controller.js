const { validationResult } = require('express-validator');
const Tokens = require('csrf');

const tokens = new Tokens();
const secret = tokens.secretSync();

const Prk = require("../models/prk");
const PrkMaterial = require("../models/prkMaterial");
const PrkJasa = require("../models/prkJasa");

const formatError = require('../helper/error-formatter');

async function getPrk(req, res) {
  try {
    const prks = await Prk.find().lean();
    for (const prk of prks) {
      let rab_material = 0;
      let rab_jasa = 0;

      let materials = await PrkMaterial.find({ prk_id: prk._id }).lean();
      for (let material of materials) {
        rab_material += parseInt(material.harga) * parseInt(material.jumlah);
      }

      let jasas = await PrkJasa.find({ prk_id: prk._id }).lean();
      for (let jasa of jasas) {
        rab_jasa += parseInt(jasa.harga);
      }

      prk.rab_material = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(rab_material);
      prk.rab_jasa = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(rab_jasa);
    }

    res.render("prk/index", {
      title: "PRK",
      prks: prks,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getPrkJson(req, res) {
  try {
    const prks = await Prk.find().lean();
  
    return res.json({
      success: true,
      message: "List PRK",
      data: prks,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createPrk(req, res) {
  const token = tokens.create(secret);
  
  res.render("prk/create", {
    title: "PRK Baru",
    token: token,
    data: {
      tahun: new Date().getFullYear(),
    },
    errors: req.flash('errors')[0] || {},
    old: req.flash('old')[0] || {}
  });
}

async function storePrk(req, res) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash('errors', formatError(errors.array()));
      req.flash('old', req.body);
      return res.redirect('/prk/baru');
    }

    const { 
      tahun,
      basket,
      nama_project,
      nomor_prk,
      type,
      nomor_lot,
      prioritas,
      token
    } = req.body;

    if (!tokens.verify(secret, token)) {
      throw new Error('invalid token!')
    }

    const prk = new Prk({
      tahun: tahun,
      basket: basket,
      nama_project: nama_project,
      nomor_prk: nomor_prk,
      type: type,
      nomor_lot: nomor_lot,
      prioritas: prioritas,
    });

    const save = await prk.save();

    res.redirect("/prk/"+save._id);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getPrkById(req, res) {
  try {
    const token = tokens.create(secret)

    const prk = await Prk.findOne({ _id: req.params.id }).lean();

    res.render("prk/detail/index", {
      title: "Informasi PRK",
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

async function getPrkByIdJson(req, res) {
  try {
    const prk = await Prk.findOne({ _id: req.params.id }).lean();

    if (!prk) {
      return res.status(404).json({
        status: false,
        message: "PRK tidak ditemukan",
      });
    }

    let rab_material = 0;
    let rab_jasa = 0;

    let materials = await PrkMaterial.find({ prk_id: prk._id }).lean();
    for (let material of materials) {
      rab_material += parseInt(material.harga) * parseInt(material.jumlah);
    }

    let jasas = await PrkJasa.find({ prk_id: prk._id }).lean();
    for (let jasa of jasas) {
      rab_jasa += parseInt(jasa.harga);
    }

    prk.rab_material = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(rab_material);
    prk.rab_jasa = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(rab_jasa);

    return res.json({
      success: true,
      message: "Detail PRK",
      data: prk,
    });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
}

async function updatePrkById(req, res) {
  const id = req.params.id;
  
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash('errors', formatError(errors.array()));
      req.flash('old', req.body);
      return res.redirect('/prk/' + id);
    }

    const { token } = req.body;

    if (!tokens.verify(secret, token)) {
      throw new Error('invalid token!')
    }

    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString(), // auto-update updated_at
    };

    const updatedPrk = await Prk.findByIdAndUpdate(id, updateData, {
      new: true, // return updated document
      runValidators: true,
    });

    if (!updatedPrk) {
      req.flash('toast', {
        success: false,
        message: 'PRK tidak ditemukan'
      });
      res.redirect("/prk/" + id);
    }

    // success
    req.flash('toast', req.flash('toast', {
      success: true,
      message: 'PRK berhasil diperbarui'
    }));

    // redirect to the same page
    return res.redirect("/prk/" + id);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = { 
  getPrk, 
  getPrkJson,
  createPrk, 
  storePrk, 
  getPrkById, 
  updatePrkById,
  getPrkByIdJson
};