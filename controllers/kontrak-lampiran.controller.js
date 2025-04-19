const { validationResult } = require('express-validator');
const Tokens = require('csrf');

const tokens = new Tokens();
const secret = tokens.secretSync();

const formatError = require('../helper/error-formatter');
const Kontrak = require('../models/kontrak');
const KontrakLampiran = require('../models/kontrakLampiran');


async function getKontrakLampiran(req, res){
  try {
    const kontrak = await Kontrak.findOne({ _id: req.params.id }).lean();

    const lampirans = await KontrakLampiran.find({
      kontrak_id: kontrak._id,
    }).lean();
    res.render("kontrak/detail/lampiran/index", {
      title: "Lampiran Kontrak",
      kontrak: kontrak,
      lampirans: lampirans,
      token: tokens.create(secret),
      toast: req.flash("toast")[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createKontrakLampiran(req, res) {
  try {
    const kontrak = await Kontrak.findOne({ _id: req.params.id }).lean();

    res.render("kontrak/detail/lampiran/create", {
      title: "Lampiran Kontrak",
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

async function storeKontrakLampiran(req, res) {
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

        return res.redirect('/kontrak/' + id + '/lampiran/baru');
      } else if (err) {
        console.log(err);
        req.flash('errors', { file: 'Terjadi kesalahan unggah file' });
        return res.redirect('/kontrak/' + id + '/lampiran/baru');
      }

      if (!req.file) {
        req.flash('errors', { file: 'File wajib diunggah' });
        req.flash('toast', req.flash('toast', {
          success: false,
          message: 'Terjadi Kesalahan'
        }));
        return res.redirect('/kontrak/' + id + '/lampiran/baru');
      }

      const kontrak = await Kontrak.findOne({ _id: id }).lean();

      const lampiran = new KontrakLampiran({
        kontrak_id: kontrak._id,
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

      return res.redirect('/kontrak/' + id + '/lampiran');
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteKontrakLampiranById(req, res) {
  try {
    const id = req.params.id;
    const lampiranId = req.params.lampiranId;

    const lampiran = await KontrakLampiran.findOne({ _id: lampiranId }).lean();

    if (!lampiran) {
      req.flash('toast', {
        success: false,
        message: 'Lampiran tidak ditemukan'
      });

      return res.redirect('/kontrak/' + id + '/lampiran');
    }

    const fullPath = path.join(__dirname, '../public/uploads/lampiran/', lampiran.url_file);
    fs.unlink(fullPath, async (err) => {
      if (err) {
        req.flash('toast', {
          success: false,
          message: 'Terjadi kesalahan'
        });

        return res.redirect('/kontrak/' + id + '/lampiran');
      }
    });

    await KontrakLampiran.deleteOne({ _id: lampiranId });

    req.flash('toast', {
      success: true,
      message: 'Lampiran berhasil dihapus'
    });

    return res.redirect('/kontrak/' + id + '/lampiran');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getKontrakLampiran,
  createKontrakLampiran,
  storeKontrakLampiran,
  deleteKontrakLampiranById
}