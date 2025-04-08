const mongoose = require("mongoose");

const pengadaanJasaSchema = new mongoose.Schema({
  nama_jasa: String,
  harga: Number,
  prk_id: mongoose.ObjectId,
  pengadaan_id: mongoose.ObjectId,
  created_at: String,
  updated_at: String,
  deleted_at: String,
});

module.exports = mongoose.model("PengadaanJasa", pengadaanJasaSchema);
