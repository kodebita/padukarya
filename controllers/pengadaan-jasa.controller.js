// Model
const Prk = require("../models/prk");
const Pengadaan = require("../models/pengadaan");
const PengadaanJasa = require("../models/pengadaanJasa");

async function getPengadaanJasa(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();
    const jasas = await PengadaanJasa.find({
      pengadaan_id: pengadaan._id,
    }).lean();

    for (jasa of jasas) {
      let prk = await Prk.findOne({ _id: jasa.prk_id }).lean();
      jasa.nomor_prk = prk.nomor_prk;
    }

    res.render("pengadaan/detail/jasa/index", {
      title: "RAB Jasa Pengadaan",
      pengadaan: pengadaan,
      jasas: jasas,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getPengadaanJasa
}