const { validationResult } = require('express-validator');
const Tokens = require('csrf');

const tokens = new Tokens();
const secret = tokens.secretSync();

const Prk = require("../models/prk");
const PrkMaterial = require("../models/prkMaterial");
const PrkJasa = require("../models/prkJasa");
const Skki = require("../models/skki");

const formatError = require('../helper/error-formatter');

async function getSkki(req, res) {
  try {
    const skkis = await Skki.find().lean();

    for (let skki of skkis) {
      let prks = await Prk.find({ prk_skki_id: skki._id }).lean();
      let rab_jasa = 0;
      let rab_material = 0;
      for (let prk of prks) {
        let materials = await PrkMaterial.find({ prk_id: prk._id }).lean();
        for (let material of materials) {
          rab_material += parseInt(material.harga) * parseInt(material.jumlah);
        }

        let jasas = await PrkJasa.find({ prk_id: prk._id }).lean();
        for (let jasa of jasas) {
          rab_jasa += parseInt(jasa.harga);
        }
      }

      skki.rab_jasa = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(rab_jasa);
      skki.rab_material = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(rab_material);
    }

    res.render("skki/index", {
      title: "SKKI",
      skkis: skkis,
      toast: req.flash('toast')[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getSkkiById(req, res) {
  try {
    const skki = await Skki.findOne({ _id: req.params.id }).lean();

    if(!skki) {
      req.flash('toast', {
        status: 'error',
        message: 'SKKI tidak ditemukan'
      });
      return res.redirect('/skki');
    }

    res.render("skki/detail/index", {
      title: "Informasi SKKI",
      skki: skki,
      token: tokens.create(secret),
      errors: req.flash('errors')[0] || {},
      old: req.flash('old')[0] || {},
      toast: req.flash('toast')[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createSkki(req, res) {
  try {
    const token = tokens.create(secret)

    return res.render("skki/create", {
      title: "SKKI Baru",
      token: token,
      data: {
        tahun: new Date().getFullYear(),
      },
      errors: req.flash('errors')[0] || {},
      old: req.flash('old')[0] || {},
      toast: req.flash('toast')[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function storeSkki(req, res) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash('errors', formatError(errors.array()));
      req.flash('old', req.body);
      return res.redirect('/skki/baru');
    }

    const { 
      tahun,
      basket,
      nama_project,
      nomor_skki,
      nomor_prk_skki,
      nomor_wbs_jasa,
      nomor_wbs_material,
      type,
      token
    } = req.body;

    if (!tokens.verify(secret, token)) {
      throw new Error('invalid token!')
    }

    const skki = new Skki({
      tahun: tahun,
      basket: basket,
      nama_project: nama_project,
      nomor_skki: nomor_skki,
      nomor_prk_skki: nomor_prk_skki,
      nomor_wbs_jasa: nomor_wbs_jasa,
      nomor_wbs_material: nomor_wbs_material,
      type: type,
      created_at: new Date().toISOString()
    });

    const save = await skki.save();

    res.redirect("/skki/"+save._id);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteSkkiById(req, res) {
  try {
    const skki = await Skki.findOne({ _id: req.params.id }).lean();

    if(!skki) {
      req.flash('toast', {
        success: false,
        message: 'SKKI tidak ditemukan'
      });
      return res.redirect('/skki');
    }

    // remove skki link from prk
    const prks = await Prk.find({ prk_skki_id: skki._id }).lean();
    for (let prk of prks) {
      await Prk.findByIdAndUpdate(prk._id, {
        prk_skki_id: null,
        updated_at: new Date().toISOString(), // auto-update updated_at
      }, {
        new: true, // return updated document
        runValidators: true,
      });
    }

    await Skki.deleteOne({ _id: req.params.id });

    req.flash('toast', {
      success: true,
      message: 'SKKI berhasil dihapus'
    });

    res.redirect('/skki');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getSkki,
  getSkkiById,
  createSkki,
  storeSkki,
  deleteSkkiById
};