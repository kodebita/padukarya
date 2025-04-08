const mongoose = require("mongoose");

const pengadaanLampiranSchema = new mongoose.Schema({
  nama_file: String,
  type: String,
  size: Number,
  uploader: mongoose.ObjectId,
  pengadaan_id: mongoose.ObjectId,
  created_at: String,
  updated_at: String,
  deleted_at: String,
});

module.exports = mongoose.model("PengadaanLampiran", pengadaanLampiranSchema);
