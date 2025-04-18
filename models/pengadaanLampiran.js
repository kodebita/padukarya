const mongoose = require("mongoose");

const pengadaanLampiranSchema = new mongoose.Schema({
  nama_file: String,
  url_file: String,
  type_file: String,
  size_file: Number,
  uploader: mongoose.ObjectId,
  pengadaan_id: mongoose.ObjectId,
  created_at: String,
  updated_at: String,
  deleted_at: String,
});

module.exports = mongoose.model("PengadaanLampiran", pengadaanLampiranSchema);
