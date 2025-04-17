const mongoose = require("mongoose");

const pengadaanSchema = new mongoose.Schema({
  nodin: String,
  tanggal_nodin: Date,
  nama_project: String,
  nomor_pr_jasa: String,
  nomor_pr_material: String,
  type: String,
  status: String,
  basket: Number,
  skki_id: mongoose.ObjectId,
  tahun: Number,
  created_at: String,
  updated_at: String,
  deleted_at: String,
});

module.exports = mongoose.model("Pengadaan", pengadaanSchema);
