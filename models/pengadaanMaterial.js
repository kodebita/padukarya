const mongoose = require("mongoose");

const pengadaanMaterialSchema = new mongoose.Schema({
  kode_normalisasi: String,
  nama_material: String,
  satuan: String,
  harga: Number,
  jumlah: String,
  prk_id: mongoose.ObjectId,
  pengadaan_id: mongoose.ObjectId,
  prk_material_id: mongoose.ObjectId,
  material_id: mongoose.ObjectId,
  created_at: String,
  updated_at: String,
  deleted_at: String,
});
module.exports = mongoose.model("PengadaanMaterial", pengadaanMaterialSchema);
