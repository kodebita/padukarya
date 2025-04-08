const mongoose = require("mongoose");

const prkLampiranSchema = new mongoose.Schema({
  nama_file: String,
  type: String,
  size: Number,
  uploader: mongoose.ObjectId,
  prk_id: mongoose.ObjectId,
  created_at: String,
  updated_at: String,
  deleted_at: String,
});

module.exports = mongoose.model("PrkLampiran", prkLampiranSchema);