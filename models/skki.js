const mongoose = require("mongoose");

const skkiSchema = new mongoose.Schema({
  nomor_skki: String,
  nomor_prk_skki: String,
  nama_project: Number,
  nomor_wbs_jasa: Number,
  nomor_wbs_material: Number,
  type: Number,
  basket: Number,
  tahun: Number,
  created_at: String,
  updated_at: String,
  deleted_at: String,
});

module.exports = mongoose.model("Skki", skkiSchema);