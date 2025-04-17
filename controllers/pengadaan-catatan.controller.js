// Model
const Pengadaan = require("../models/pengadaan");
const PengadaanCatatan = require("../models/pengadaanCatatan");

async function getPengadaanCatatan(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();

    const catatans = await PengadaanCatatan.find({
      pengadaan_id: pengadaan._id,
    }).lean();

    res.render("pengadaan/detail/catatan/index", {
      title: "catatan Pengadaan",
      pengadaan: pengadaan,
      catatans: catatans,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getPengadaanCatatan
}