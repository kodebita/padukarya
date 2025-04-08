const mongoose = require("mongoose");

const skkiLampiranSchema = new mongoose.Schema({
  nama_file: String,
  type: String,
  size: Number,
  uploader: mongoose.ObjectId,
  skki_id: mongoose.ObjectId,
  created_at: String,
  updated_at: String,
  deleted_at: String,
});

module.exports = mongoose.model("SkkiLampiran", skkiLampiranSchema);
