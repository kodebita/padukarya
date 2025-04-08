const mongoose = require("mongoose");

const prkMaterialSchema = new mongoose.Schema({
  kode_normalisasi: String,
  nama_material: String,
  satuan: String,
  harga: Number,
  jumlah: String,
  prk_id: mongoose.ObjectId,
  kontrak_id: String,
  pengadaan_id: String,
  created_at: String,
  updated_at: String,
  deleted_at: String,
});
module.exports = mongoose.model("PrkMaterial", prkMaterialSchema);