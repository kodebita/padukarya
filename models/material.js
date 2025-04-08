const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
  kode_normalisasi: String,
  nama_material: String,
  satuan: String,
  harga: Number,
  deskripsi: String,
  created_at: String,
  updated_at: String,
  deleted_at: String,
});

module.exports = mongoose.model("Material", materialSchema);
