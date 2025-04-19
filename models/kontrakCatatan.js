const mongoose = require("mongoose");

const kontrakCatatanSchema = new mongoose.Schema({
  catatan: String,
  user_id: mongoose.ObjectId,
  kontrak_id: mongoose.ObjectId,
  created_at: String,
  updated_at: String,
  deleted_at: String,
});

module.exports = mongoose.model("KontrakCatatan", kontrakCatatanSchema);
