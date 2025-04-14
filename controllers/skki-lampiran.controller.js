const Tokens = require('csrf');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const Skki = require("../models/skki");
const SkkiLampiran = require("../models/skkiLampiran");

const upload = require('../helper/upload.helper');

const tokens = new Tokens();
const secret = tokens.secretSync();

async function getSkkiLampiran(req, res) {
  try {
      const skki = await Skki.findOne({ _id: req.params.id }).lean();
  
      const lampirans = await SkkiLampiran.find({ skki_id: skki._id }).lean();
      res.render("skki/detail/lampiran/index", {
        title: "Lampiran SKKI",
        skki: skki,
        lampirans: lampirans,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}

async function createSkkiLampiran(req, res) {
  try {
    const token = tokens.create(secret);
    const skki = await Skki.findOne({ _id: req.params.id }).lean();

    res.render("skki/detail/lampiran/create", {
      title: "Lampiran SKKI",
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

async function storeSkkiLampiran(req, res, next) {
  try {
    const id = req.params.id;

    upload.single('file')(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        console.log(err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          req.flash('errors', { file: 'Ukuran file maksimal 15MB' });
        } else {
          req.flash('errors', { file: 'Terjadi kesalahan unggah file' });
        }

        return res.redirect('/skki/' + id + '/lampiran/baru');
      } else if (err) {
        console.log(err);
        req.flash('errors', { file: 'Terjadi kesalahan unggah file' });
        return res.redirect('/skki/' + id + '/lampiran/baru');
      }

      if (!req.file) {
        req.flash('errors', { file: 'File wajib diunggah' });
        req.flash('toast', req.flash('toast', {
          success: false,
          message: 'Terjadi Kesalahan'
        }));
        return res.redirect('/prk/' + id + '/lampiran/baru');
      }

      const skki = await Skki.findOne({ _id: id }).lean();

      const lampiran = new SkkiLampiran({
        skki_id: skki._id,
        nama_file: req.file.originalname,
        url_file: req.file.filename,
        type_file: req.file.mimetype,
        size_file: req.file.size,
        created_at: new Date().toISOString()
      });

      await lampiran.save();

      req.flash('toast', {
        status: 'success',
        message: 'Lampiran berhasil ditambahkan'
      });

      return res.redirect('/skki/' + id + '/lampiran');
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteSkkiLampiranById(req, res) {
  try {
    const id = req.params.id;
    const lampiranId = req.params.lampiranId;

    const lampiran = await SkkiLampiran.findOne({ _id: lampiranId }).lean();

    if (!lampiran) {
      req.flash('toast', {
        success: false,
        message: 'Lampiran tidak ditemukan'
      });

      return res.redirect('/skki/' + id + '/lampiran');
    }
    
    const fullPath = path.join(__dirname, '../public/uploads/lampiran/', lampiran.url_file);
    fs.unlink(fullPath, async (err) => {
      if (err) {
        req.flash('toast', {
          success: false,
          message: 'Terjadi kesalahan'
        });

        return res.redirect('/skki/' + id + '/lampiran');
      }
    });

    await SkkiLampiran.deleteOne({ _id: lampiranId });

    req.flash('toast', {
      status: 'success',
      message: 'Lampiran berhasil dihapus'
    });

    return res.redirect('/skki/' + id + '/lampiran');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getSkkiLampiran,
  createSkkiLampiran,
  storeSkkiLampiran,
  deleteSkkiLampiranById
};