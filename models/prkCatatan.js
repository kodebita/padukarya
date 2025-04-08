const mongoose = require("mongoose");

const prkCatatanSchema = new mongoose.Schema({
  user_id: String,
  catatan: String,
  user_id: mongoose.ObjectId,
  prk_id: mongoose.ObjectId,
  created_at: String,
  updated_at: String,
  deleted_at: String,
});

module.exports = mongoose.model("PrkCatatan", prkCatatanSchema);