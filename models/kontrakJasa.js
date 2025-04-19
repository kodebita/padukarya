const mongoose = require("mongoose");

const kontrakJasaSchema = new mongoose.Schema({
  nama: String,
  harga: Number,
  kontrak_id: mongoose.ObjectId,
  prk_id: mongoose.ObjectId,
  created_at: String,
  updated_at: String,
  deleted_at: String,
});

module.exports = mongoose.model("KontrakJasa", kontrakJasaSchema);