const mongoose = require("mongoose");

const skkiCatatanSchema = new mongoose.Schema({
  user_id: String,
  catatan: String,
  user_id: mongoose.ObjectId,
  skki_id: mongoose.ObjectId,
  created_at: String,
  updated_at: String,
  deleted_at: String,
});

module.exports = mongoose.model("SkkiCatatan", skkiCatatanSchema);
