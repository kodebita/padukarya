const mongoose = require("mongoose");

const prkSchema = new mongoose.Schema({
  nomor_prk: String,
  nama_project: String,
  nomor_lot: Number,
  prioritas: Number,
  type: String,
  basket: Number,
  tahun: Number,
  prk_skki_id: mongoose.ObjectId,
  pengadaan_id: mongoose.ObjectId,
  created_at: String,
  updated_at: String,
  deleted_at: String,
});

module.exports = mongoose.model("Prk", prkSchema);
