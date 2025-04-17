// Model
const Prk = require("../models/prk");
const Pengadaan = require("../models/pengadaan");
const PengadaanMaterial = require("../models/pengadaanMaterial");

async function getPengadaanMaterial(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();
    const materials = await PengadaanMaterial.find({
      pengadaan_id: pengadaan._id,
    }).lean();

    for (material of materials) {
      let prk = await Prk.findOne({ _id: material.prk_id }).lean();
      material.nomor_prk = prk.nomor_prk;
    }

    res.render("pengadaan/detail/material/index", {
      title: "RAB Material Pengadaan",
      pengadaan: pengadaan,
      materials: materials,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getPengadaanMaterial
}