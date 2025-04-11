const Skki = require("../models/skki");
const Prk = require("../models/prk");
const PrkMaterial = require("../models/prkMaterial");
const PrkJasa = require("../models/prkJasa");

async function getSkkiPrk(req, res) {
  try {
    const skki = await Skki.findOne({ _id: req.params.id }).lean();
    const prks = await Prk.find({ prk_skki_id: skki._id }).lean();
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

    res.render("skki/detail/prk/index", {
      title: "List PRK SKKI",
      skki: skki,
      prks: prks,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getSkkiPrk,
};