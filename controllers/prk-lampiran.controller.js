const Tokens = require('csrf');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const Prk = require("../models/prk");
const PrkLampiran = require("../models/prkLampiran");

const upload = require('../helper/upload.helper');

const tokens = new Tokens();
const secret = tokens.secretSync();

async function getPrkLampiran(req, res) {
  try {
    const prk = await Prk.findOne({ _id: req.params.id }).lean();

    const lampirans = await PrkLampiran.find({ prk_id: prk._id }).lean();

    res.render("prk/detail/lampiran/index", {
      title: "Lampiran PRK",
      prk: prk,
      lampirans: lampirans,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
async function createPrkLampiran(req, res) {
  try {
    const token = tokens.create(secret);
    const prk = await Prk.findOne({ _id: req.params.id }).lean();

    res.render("prk/detail/lampiran/create", {
      title: "Lampiran PRK",
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

async function storePrkLampiran(req, res, next) {
  try {
    const id = req.params.id;

    upload.single('file')(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          req.flash('errors', { file: 'Ukuran file maksimal 15MB' });
        } else {
          req.flash('errors', { file: 'Terjadi kesalahan unggah file' });
        }

        return res.redirect('/prk/' + id + '/lampiran/baru');
      } else if (err) {
        req.flash('errors', { file: err.message });
        return res.redirect('/prk/' + id + '/lampiran/baru');
      }

      if (!req.file) {
        req.flash('errors', { file: 'File wajib diunggah' });
        req.flash('toast', req.flash('toast', {
          success: false,
          message: 'Terjadi Kesalahan'
        }));
        return res.redirect('/prk/' + id + '/lampiran/baru');
      }

      const prk = await Prk.findOne({ _id: id }).lean();

      // write to mongo
      const lampiran = new PrkLampiran({
        prk_id: prk._id,
        nama_file: req.file.originalname,
        url_file: req.file.filename,
        type_file: req.file.mimetype,
        size_file: req.file.size,
        created_at: new Date().toISOString()
      });

      await lampiran.save();

      req.flash('toast', {
        success: true,
        message: 'Lampiran berhasil ditambahkan'
      })

      return res.redirect('/prk/' + id + '/lampiran');
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
async function deletePrkLampiranById(req, res) {
  try {
    const id = req.params.id;
    const lampiranId = req.params.lampiranId;

    const lampiran = await PrkLampiran.findOne({ _id: lampiranId }).lean();
    if (!lampiran) {
      req.flash('toast', {
        success: false,
        message: 'Lampiran tidak ditemukan'
      });

      return res.redirect('/prk/' + id + '/lampiran');
    }

    const fullPath = path.join(__dirname, '../public/uploads/lampiran/', lampiran.url_file);

    fs.unlink(fullPath, async (err) => {
      if (err) {
        req.flash('toast', {
          success: false,
          message: 'Terjadi kesalahan'
        });

        return res.redirect('/prk/' + id + '/lampiran');
      }

      // delete from mongo
      await PrkLampiran.findOneAndDelete({ _id: lampiranId });

      req.flash('toast', {
        success: true,
        message: 'Lampiran berhasil dihapus'
      });
      return res.redirect('/prk/' + id + '/lampiran');
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getPrkLampiran, createPrkLampiran, storePrkLampiran, deletePrkLampiranById }