const mongoose = require("mongoose");

const pengadaanCatatanSchema = new mongoose.Schema({
  user_id: String,
  catatan: String,
  user_id: mongoose.ObjectId,
  pengadaan_id: mongoose.ObjectId,
  created_at: String,
  updated_at: String,
  deleted_at: String,
});

module.exports = mongoose.model("PengadaanCatatan", pengadaanCatatanSchema);
