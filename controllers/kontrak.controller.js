const { validationResult } = require('express-validator');
const Tokens = require('csrf');

const tokens = new Tokens();
const secret = tokens.secretSync();

const formatError = require('../helper/error-formatter');

const Kontrak = require('../models/kontrak');
const KontrakJasa = require('../models/kontrakJasa');
const KontrakLampiran = require('../models/kontrakLampiran');
const KontrakCatatan = require('../models/kontrakCatatan');

const Pengadaan = require('../models/pengadaan');

async function getKontrak(req, res) {
  try {
    const kontraks = await Kontrak.find({
      $or: [
        { is_backup: null },
        { is_backup: false }
      ]
    }).lean();

    res.render("kontrak/index", {
      title: "Kontrak",
      kontraks: kontraks,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createKontrak(req, res) {
  try {
    res.render("kontrak/create", {
      title: "Kontrak Baru",
      data: {
        tahun: new Date().getFullYear(),
      },
      errors: req.flash('errors')[0] || {},
      old: req.flash('old')[0] || {},
      token: tokens.create(secret),
      toast: req.flash('toast')[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function storeKontrak(req, res) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash('errors', formatError(errors.array()));
      req.flash('old', req.body);
      return res.redirect('/kontrak/baru');
    }

    const { 
      tahun,
      basket,
      pengadaan_id,
      nomor_kontrak,
      tanggal_kontrak,
      tanggal_awal,
      tanggal_akhir,
      pelaksana,
      direksi,
      type,
      token
    } = req.body;

    if (!tokens.verify(secret, token)) {
      throw new Error('invalid token!')
    }

    // cek pengadaan
    const pengadaan = await Pengadaan.findOne({ _id: pengadaan_id });
    if (!pengadaan) {
      req.flash('toast', {
        success: false,
        message: 'Pengadaan tidak ditemukan'
      });
      res.redirect('/kontrak/baru');
    }

    // cek apakah pengadaan sudah ada kontrak
    const kontrakExisting = await Kontrak.findOne({ pengadaan_id: pengadaan_id });
    if (kontrakExisting) {
      req.flash('toast', {
        success: false,
        message: 'Pengadaan sudah ada kontrak'
      });
      res.redirect('/kontrak/baru');
    }

    const kontrak = new Kontrak({
      tahun: tahun,
      basket: basket,
      pengadaan_id: pengadaan_id,
      nomor_kontrak: nomor_kontrak,
      tanggal_kontrak: tanggal_kontrak,
      tanggal_awal: tanggal_awal,
      tanggal_akhir: tanggal_akhir,
      pelaksana: pelaksana,
      direksi: direksi,
      type: type,
      created_at: new Date().toISOString(),
    });

    const save = await kontrak.save();

    // update status pengadaan
    await Pengadaan.findOneAndUpdate(
      { _id: pengadaan_id },
      { status: 'terkontrak' }
    );

    // copy jasa ppengadaan ke kontrak jasa
    const pengadaanJasas = await PengadaanJasa.find({ pengadaan_id: pengadaan_id });
    if (pengadaanJasas.length > 0) {
      const jasa = pengadaanJasas.map(jasa => {
        return {
          kontrak_id: save._id,
          nama: jasa.nama,
          harga: jasa.harga,
          created_at: new Date().toISOString(),
        }
      });
      await KontrakJasa.insertMany(jasa);
    }

    res.redirect("/kontrak/"+save._id);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getKontrakById(req, res) {
  try {
    const kontrak = await Kontrak.findOne({ _id: req.params.id }).lean();
    kontrak.pengadaan = await Pengadaan.findOne({ _id: kontrak.pengadaan_id }).lean();

    res.render("kontrak/detail/index", {
      title: "Informasi Kontrak",
      kontrak: kontrak,
      token: tokens.create(secret),
      toast: req.flash('toast')[0] || false,
      errors: req.flash('errors')[0] || {},
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateKontrakById(req, res) {
  try {
    const kontrak = await Kontrak.findOne({ _id: req.params.id }).lean();
    if(!kontrak) {
      req.flash('toast', { 
        success: false,
        message: 'Kontrak tidak ditemukan' 
      });
      return res.redirect('/kontrak/');
    }

    console.log({
      'is_amandemen': kontrak.is_amandemen,
    })

    if(!kontrak.is_amandemen) {
      req.flash('toast', { 
        success: false,
        message: 'Kontrak tidak bisa diubah' 
      });
      return res.redirect('/kontrak/'+req.params.id);
    }

    const {
      tahun,
      basket,
      nomor_kontrak,
      tanggal_kontrak,
      tanggal_awal,
      tanggal_akhir,
      nomor_po,
      pelaksana,
      direksi,
      type,
      token
    } = req.body;

    if (!tokens.verify(secret, token)) {
      throw new Error('invalid token!')
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('errors', formatError(errors.array()));
      req.flash('old', req.body);
      req.flash('toast', {
        type: 'error',
        message: 'Gagal menambahkan RAB Jasa',
      });
      return res.redirect('/kontrak/'+req.params.id);
    }

    const update = await Kontrak.findOneAndUpdate(
      { _id: req.params.id },
      {
        tahun: tahun,
        nomor_kontrak: nomor_kontrak,
        nomor_po: nomor_po,
        pelaksana: pelaksana,
        direksi: direksi,
        type: type,
        basket: basket,
        tanggal_kontrak: tanggal_kontrak,
        tanggal_awal: tanggal_awal,
        tanggal_akhir: tanggal_akhir
      }
    );

    if (!update) {
      req.flash('toast', {
        success: false,
        message: 'Gagal memperbarui kontrak'
      });
      return res.redirect('/kontrak/' + req.params.id);
    }

    req.flash('toast', {
      success: true,
      message: 'Berhasil memperbarui kontrak'
    });
    res.redirect('/kontrak/' + req.params.id);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteKontrakById(req, res) {
  try {
    const kontrak = await Kontrak.findOne({ _id: req.params.id });
    if (!kontrak) {
      req.flash('toast', { 
        success: false,
        message: 'Kontrak tidak ditemukan' 
      });
    }

    // TODO: cek jika kontrak ada traksaksi di pelaksanaan jasa
    // TODO: cek jika kontrak ada traksaksi di pelaksanaan material

    // hapus kontrak jasa
    await KontrakJasa.deleteMany({ kontrak_id: kontrak._id });
    
    // hapus kontrak lampiran
    await KontrakLampiran.deleteMany({ kontrak_id: kontrak._id });

    // hapus kontrak catatan
    await KontrakCatatan.deleteMany({ kontrak_id: kontrak._id });

    // TODO: hapus pelaksanaan catatan
    // TODO: hapus pelaksanaan lampiran

    // TODO: hapus pembayaran catatan
    // TODO: hapus pembayaran lampiran

    // update status pengadaan status
    await Pengadaan.findOneAndUpdate(
      { _id: kontrak.pengadaan_id },
      { status: 'pproses' }
    );

    // hapus kontrak
    await Kontrak.deleteOne({ _id: kontrak._id });
    req.flash('toast', { 
      success: true,
      message: 'Kontrak berhasil dihapus' 
    });

    // hapus backup kontrak jika ada
    await Kontrak.deleteOne({
      kontrak_id: kontrak._id,
      is_backup: true
    });

    res.redirect("/kontrak");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getKontrak,
  getKontrakById,
  updateKontrakById,
  createKontrak,
  storeKontrak,
  deleteKontrakById
};  