const mongoose = require("mongoose");

const prkLampiranSchema = new mongoose.Schema({
  nama_file: String,
  url_file: String,
  type_file: String,
  size_file: Number,
  uploader: mongoose.ObjectId,
  prk_id: mongoose.ObjectId,
  created_at: String,
  updated_at: String,
  deleted_at: String,
});

module.exports = mongoose.model("PrkLampiran", prkLampiranSchema);