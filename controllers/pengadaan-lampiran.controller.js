const Tokens = require('csrf');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const upload = require('../helper/upload.helper');

const tokens = new Tokens();
const secret = tokens.secretSync();

// Model
const Pengadaan = require("../models/pengadaan");
const PengadaanLampiran = require("../models/pengadaanLampiran");

async function getPengadaanLampiran(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();

    const lampirans = await PengadaanLampiran.find({
      pengadaan_id: pengadaan._id,
    }).lean();
    res.render("pengadaan/detail/lampiran/index", {
      title: "Lampiran Pengadaan",
      pengadaan: pengadaan,
      lampirans: lampirans,
      toast: req.flash("toast")[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createPengadaanLampiran(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();

    res.render("pengadaan/detail/lampiran/create", {
      title: "Lampiran Pengadaan",
      pengadaan: pengadaan,
      token: tokens.create(secret),
      errors: req.flash("errors")[0] || {},
      old: req.flash("old")[0] || {},
      toast: req.flash("toast")[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function storePengadaanLampiran(req, res) {
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

        return res.redirect('/pengadaan/' + id + '/lampiran/baru');
      } else if (err) {
        console.log(err);
        req.flash('errors', { file: 'Terjadi kesalahan unggah file' });
        return res.redirect('/pengadaan/' + id + '/lampiran/baru');
      }

      if (!req.file) {
        req.flash('errors', { file: 'File wajib diunggah' });
        req.flash('toast', req.flash('toast', {
          success: false,
          message: 'Terjadi Kesalahan'
        }));
        return res.redirect('/pengadaan/' + id + '/lampiran/baru');
      }

      const pengadaan = await Pengadaan.findOne({ _id: id }).lean();

      const lampiran = new PengadaanLampiran({
        pengadaan_id: pengadaan._id,
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

      return res.redirect('/pengadaan/' + id + '/lampiran');
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deletePengadaanLampiranById(req, res) {
  try {
    const id = req.params.id;
    const lampiranId = req.params.lampiranId;

    const lampiran = await PengadaanLampiran.findOne({ _id: lampiranId }).lean();

    if (!lampiran) {
      req.flash('toast', {
        success: false,
        message: 'Lampiran tidak ditemukan'
      });

      return res.redirect('/pengadaan/' + id + '/lampiran');
    }

    const fullPath = path.join(__dirname, '../public/uploads/lampiran/', lampiran.url_file);
    fs.unlink(fullPath, async (err) => {
      if (err) {
        req.flash('toast', {
          success: false,
          message: 'Terjadi kesalahan'
        });

        return res.redirect('/pengadaan/' + id + '/lampiran');
      }
    });

    await PengadaanLampiran.deleteOne({ _id: lampiranId });

    req.flash('toast', {
      success: true,
      message: 'Lampiran berhasil dihapus'
    });

    return res.redirect('/pengadaan/' + id + '/lampiran');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getPengadaanLampiran,
  createPengadaanLampiran,
  storePengadaanLampiran,
  deletePengadaanLampiranById
}