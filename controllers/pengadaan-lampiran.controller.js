// Model
const Pengadaan = require("../models/pengadaan");
const PengadaanLampiran = require("../models/pengadaanLampiran");

async function getPengadaanLampiran(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();

    const lampirans = await PengadaanLampiran.find({
      pengadaan_id: pengadaan._id,
    }).lean();
    res.render("pengadaan/detail/lampiran/index", {
      title: "Lampiran Pengadaan",
      pengadaan: pengadaan,
      lampirans: lampirans,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getPengadaanLampiran
}