const mongoose = require("mongoose");

const prkJasaSchema = new mongoose.Schema({
  nama_jasa: String,
  harga: Number,
  prk_id: mongoose.ObjectId, 
  kontrak_id: String,
  pengadaan_id: String,
  created_at: String,
  updated_at: String,
  deleted_at: String,
});

module.exports = mongoose.model("PrkJasa", prkJasaSchema);