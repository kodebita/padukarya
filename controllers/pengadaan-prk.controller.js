// Model
const Prk = require("../models/prk");
const PrkMaterial = require("../models/prkMaterial");
const PrkJasa = require("../models/prkJasa");
const Pengadaan = require("../models/pengadaan");

async function getPengadaanPrk(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();

    const prks = await Prk.find({ pengadaan_id: pengadaan._id }).lean();
    for (let prk of prks) {
      let wbs_material = 0;
      let wbs_jasa = 0;

      let materials = await PrkMaterial.find({ prk_id: prk._id }).lean();
      for (let material of materials) {
        wbs_material += parseInt(material.harga) * parseInt(material.jumlah);
      }

      let jasas = await PrkJasa.find({ prk_id: prk._id }).lean();
      for (let jasa of jasas) {
        wbs_jasa += parseInt(jasa.harga);
      }

      prk.wbs_jasa = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(wbs_jasa);
      prk.wbs_material = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(wbs_material);
    }

    res.render("pengadaan/detail/prk/index", {
      title: "List PRK Pengadaan",
      pengadaan: pengadaan,
      prks: prks,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getPengadaanPrk
}