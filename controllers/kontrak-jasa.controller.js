const { validationResult } = require('express-validator');
const Tokens = require('csrf');

const tokens = new Tokens();
const secret = tokens.secretSync();

const formatError = require('../helper/error-formatter');

const Kontrak = require('../models/kontrak');
const Pengadaan = require('../models/pengadaan');
const PengadaanJasa = require('../models/pengadaanJasa');
const KontrakJasa = require('../models/kontrakJasa');

async function getKontrakJasa(req, res) {
  try {
    const kontrak = await Kontrak.findById(req.params.id).lean();
    if (!kontrak) {
      req.flash('toast', {
        success: false,
        message: 'Kontrak tidak ditemukan',
      });

      return res.redirect("/kontrak");
    }

    const jasas = await KontrakJasa.find({
      kontrak_id: req.params.id,
    }).lean();

    res.render("kontrak/detail/jasa/index", {
      title: "RAB Jasa Pengadaan",
      kontrak: kontrak,
      jasas: jasas,
      toast: req.flash('toast')[0] || false,
      errors: req.flash('errors')[0] || {},
      old: req.flash('old')[0] || {},
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createKontrakJasa(req, res) {
  try {
    const kontrak = await Kontrak.findById(req.params.id).lean();
    if(!kontrak) {
      req.flash('toast', {
        success: false,
        message: 'Kontrak tidak ditemukan',
      });

      return res.redirect("/kontrak");
    }

    res.render("kontrak/detail/jasa/create", {
      title: "Tambah RAB Jasa Pengadaan",
      kontrak: kontrak,
      errors: req.flash('errors')[0] || {},
      old: req.flash('old')[0] || {},
      token: tokens.create(secret),
      toast: req.flash('toast')[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function storeKontrakJasa(req, res) {
  try {
    const kontrak = await Kontrak.findById(req.params.id).lean();
    if(!kontrak) {
      req.flash('toast', {
        success: false,
        message: 'Kontrak tidak ditemukan',
      });

      return res.redirect("/kontrak");
    }
    const { 
      nama_jasa,
      harga,
      token,
     } = req.body;

    // validate token
    const valid = tokens.verify(secret, token);
    if (!valid) {
      req.flash('toast', {
        success: false,
        message: 'Token tidak valid',
      });

      return res.redirect("/kontrak/"+req.params.id+"/jasa/baru");
    }

    // validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('errors', formatError(errors));
      req.flash('old', req.body);
      return res.redirect("/kontrak/"+req.params.id+"/jasa/baru");
    }

    // store kontrak jasa
    const kontrakJasa = new KontrakJasa({
      nama_jasa: nama_jasa,
      harga: harga,
      kontrak_id: kontrak._id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const jasa = await kontrakJasa.save();
    if (!jasa) {
      req.flash('toast', {
        success: false,
        message: 'Gagal menambahkan RAB Jasa',
      });
      return res.redirect("/kontrak/"+req.params.id+"/jasa/baru");
    }

    req.flash('toast', {
      success: true,
      message: 'Berhasil menambahkan RAB Jasa',
    });
    res.redirect("/kontrak/"+req.params.id+"/jasa");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getKontrakJasaById(req, res) {
  try {
    const kontrak = await Kontrak.findById(req.params.id).lean();
    if (!kontrak) {
      req.flash('toast', {
        success: false,
        message: 'Kontrak tidak ditemukan',
      });

      return res.redirect("/kontrak");
    }
    const jasa = await KontrakJasa.findById(req.params.jasaId).lean();
    if (!jasa) {
      req.flash('toast', {
        success: false,
        message: 'RAB Jasa tidak ditemukan',
      });

      return res.redirect("/kontrak/"+req.params.id+"/jasa");
    }
    res.render("kontrak/detail/jasa/detail", {
      title: "Edit RAB Jasa Pengadaan",
      kontrak: kontrak,
      jasa: jasa,
      errors: req.flash('errors')[0] || {},
      old: req.flash('old')[0] || {},
      token: tokens.create(secret),
      toast: req.flash('toast')[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateKontrakJasaById(req, res) {
  try {
    const kontrak = await Kontrak.findById(req.params.id).lean();
    if (!kontrak) {
      req.flash('toast', {
        success: false,
        message: 'Kontrak tidak ditemukan',
      });

      return res.redirect("/kontrak");
    }

    const jasa = await KontrakJasa.findById(req.params.jasaId).lean();
    if (!jasa) {
      req.flash('toast', {
        success: false,
        message: 'RAB Jasa tidak ditemukan',
      });

      return res.redirect("/kontrak/"+req.params.id+"/jasa");
    }

    const {
      nama_jasa,
      harga,
      token,
     } = req.body;

    // validate token
    const valid = tokens.verify(secret, token);
    if (!valid) {
      req.flash('toast', {
        success: false,
        message: 'Token tidak valid',
      });

      return res.redirect("/kontrak/"+req.params.id+"/jasa/"+req.params.jasaId);
    }

    // validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('errors', formatError(errors));
      req.flash('old', req.body);
      return res.redirect("/kontrak/"+req.params.id+"/jasa/"+req.params.jasaId);
    }

    // update kontrak jasa
    const updateJasa = await KontrakJasa.findByIdAndUpdate(jasa._id, {
      nama_jasa: nama_jasa,
      harga: harga,
      updated_at: new Date().toISOString(),
    }, { new: true });
    if (!updateJasa) {
      req.flash('toast', {
        success: false,
        message: 'Gagal mengupdate RAB Jasa',
      });

      return res.redirect("/kontrak/"+req.params.id+"/jasa/"+req.params.jasaId);
    }

    req.flash('toast', {
      success: true,
      message: 'Berhasil mengupdate RAB Jasa',
    });

    res.redirect("/kontrak/"+req.params.id+"/jasa");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteKontrakById(req, res) {
  try {
    const kontrak = await Kontrak.findById(req.params.id).lean();
    if (!kontrak) {
      req.flash('toast', {
        success: false,
        message: 'Kontrak tidak ditemukan',
      });

      return res.redirect("/kontrak");
    }

    const jasa = await KontrakJasa.findById(req.params.jasaId).lean();
    if (!jasa) {
      req.flash('toast', {
        success: false,
        message: 'RAB Jasa tidak ditemukan',
      });

      return res.redirect("/kontrak/"+req.params.id+"/jasa");
    }
    const deleteJasa = await KontrakJasa.findByIdAndDelete(jasa._id);
    if (!deleteJasa) {
      req.flash('toast', {
        success: false,
        message: 'Gagal menghapus RAB Jasa',
      });
      return res.redirect("/kontrak/"+req.params.id+"/jasa");
    }
    req.flash('toast', {
      success: true,
      message: 'Berhasil menghapus RAB Jasa',
    });
    res.redirect("/kontrak/"+req.params.id+"/jasa");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getKontrakJasa,
  createKontrakJasa,
  storeKontrakJasa,
  getKontrakJasaById,
  updateKontrakJasaById,
  deleteKontrakById
}