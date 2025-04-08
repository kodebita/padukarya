const mongoose = require("mongoose");

const kontrakSchema = new mongoose.Schema({
  nomor_kontrak: String,
  nomor_po: String,
  se: String,
  vip: String,
  spk: String,
  tanggal_kontrak: String,
  tanggal_awal: String,
  tanggal_akhir: String,
  pelaksana: String,
  direksi: String,
  status: String,
  type: Number,
  is_amandemen: Boolean,
  versi_amandemen: String,
  basket: Number,
  pengadaan_id: mongoose.ObjectId,
  progress: Number,
  tahun: Number,
  created_at: String,
  updated_at: String,
  deleted_at: String,
});

module.exports = mongoose.model("Kontrak", kontrakSchema);
