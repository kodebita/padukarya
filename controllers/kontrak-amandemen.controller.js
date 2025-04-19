const { validationResult } = require('express-validator');
const Tokens = require('csrf');

const tokens = new Tokens();
const secret = tokens.secretSync();

const formatError = require('../helper/error-formatter');

const Kontrak = require('../models/kontrak');

async function createKontrakAmandemen(req, res) {
  try {
    const kontrak = await Kontrak.findOne({ _id: req.params.id }).lean();

    if (!kontrak) {
      req.flash('toast', {
        success: false,
        message: 'Kontrak tidak ditemukan'
      });
      return res.redirect('/kontrak/' + req.params.id);
    }

    res.render("kontrak/detail/amandemen/create", {
      title: "Amandemen Kontrak",
      kontrak: kontrak,
      token: tokens.create(secret),
      errors: req.flash("errors")[0] || {},
      old: req.flash("old")[0] || {},
      toast: req.flash("toast")[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function storeKontrakAmandemen(req, res) {
  try {
    const kontrak = await Kontrak.findById(req.params.id).lean();
    if (!kontrak) {
      req.flash('toast', {
        success: false,
        message: 'Kontrak tidak ditemukan'
      });
      return res.redirect('/kontrak/' + req.params.id);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('errors', formatError(errors.array()));
      req.flash('old', req.body);
      return res.redirect('/kontrak/' + req.params.id + '/amandemen');
    }

    const { 
      versi_amandemen,
      token
    } = req.body;

    if (!tokens.verify(secret, token)) {
      throw new Error('invalid token!')
    }

    // delete previous backup if any
    await Kontrak.deleteOne({
      kontrak_id: req.params.id,
      is_backup: true
    });

    // create new kontrak backup
    const kontrakBackup = {
      ...kontrak,
      kontrak_id: kontrak._id,
      _id: undefined,
      is_backup: true,
      created_at: new Date().toISOString()
    };
    await Kontrak.create(kontrakBackup);

    const update = await Kontrak.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          versi_amandemen: versi_amandemen,
          is_amandemen: true,
          created_at: new Date().toISOString()
        }
      },
      { 
        new: true,
        runValidators: true
      }
    );
    if (!update) {
      req.flash('toast', {
        success: false,
        message: 'Gagal memperbarui amandemen'
      });
      return res.redirect('/kontrak/' + req.params.id);
    }
    
    req.flash('toast', {
      success: true,
      message: 'Berhasil mengaktifkan amandemen'
    });
    res.redirect('/kontrak/' + req.params.id);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function cancelKontrakAmandemen(req, res) {
  try {
    const kontrak = await Kontrak.findById(req.params.id).lean();
    if (!kontrak) {
      req.flash('toast', {
        success: false,
        message: 'Kontrak tidak ditemukan'
      });
      return res.redirect('/kontrak/' + req.params.id);
    }

    console.log({'kontrak': kontrak})

    // cari backup kontrak
    const backupKontrak = await Kontrak.findOne({
      kontrak_id: req.params.id,
      is_backup: true
    }).lean();
    if (!backupKontrak) {
      req.flash('toast', {
        success: false,
        message: 'Kontrak backup tidak ditemukan'
      });
      return res.redirect('/kontrak/' + req.params.id);
    }

    console.log({'backup': backupKontrak})

    // update kontrak saat ini dengan data backup
    const update = await Kontrak.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...backupKontrak,
          _id: undefined,
          is_amandemen: false,
          is_backup: false,
          kontrak_id: undefined,
          updated_at: new Date().toISOString()
        }
      },
      { 
        new: true,
        runValidators: true
      }
    );
    console.log({'update': update})
    if (!update) {
      req.flash('toast', {
        success: false,
        message: 'Gagal membatalkan amandemen'
      });
      return res.redirect('/kontrak/' + req.params.id);
    }

    // delete backup
    await Kontrak.deleteOne({
      kontrak_id: req.params.id,
      is_backup: true
    });
    req.flash('toast', {
      success: true,
      message: 'Berhasil membatalkan amandemen'
    });
    res.redirect('/kontrak/' + req.params.id);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function doneKontrakAmandemen(req, res) {
  try {
    const kontrak = await Kontrak.findById(req.params.id).lean();
    if (!kontrak) {
      req.flash('toast', {
        success: false,
        message: 'Kontrak tidak ditemukan'
      });
      return res.redirect('/kontrak/' + req.params.id);
    }

    // delete backup kontrak
    await Kontrak.deleteOne({
      kontrak_id: req.params.id,
      is_backup: true
    });

    // update kontrak saat ini
    const update = await Kontrak.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          is_amandemen: false,
          updated_at: new Date().toISOString()
        }
      },
      { 
        new: true,
        runValidators: true
      }
    );
    if (!update) {
      req.flash('toast', {
        success: false,
        message: 'Gagal menyelesaikan amandemen'
      });

      return res.redirect('/kontrak/' + req.params.id);
    }
    req.flash('toast', {
      success: true,
      message: 'Berhasil menyelesaikan amandemen'
    });
    res.redirect('/kontrak/' + req.params.id);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createKontrakAmandemen,
  storeKontrakAmandemen,
  cancelKontrakAmandemen,
  doneKontrakAmandemen
}