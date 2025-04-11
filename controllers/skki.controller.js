const Prk = require("../models/prk");
const PrkMaterial = require("../models/prkMaterial");
const PrkJasa = require("../models/prkJasa");
const Skki = require("../models/skki");

async function getSkki(req, res) {
  try {
    const skkis = await Skki.find().lean();

    for (let skki of skkis) {
      let prks = await Prk.find({ prk_skki_id: skki._id }).lean();
      let rab_jasa = 0;
      let rab_material = 0;
      for (let prk of prks) {
        let materials = await PrkMaterial.find({ prk_id: prk._id }).lean();
        for (let material of materials) {
          rab_material += parseInt(material.harga) * parseInt(material.jumlah);
        }

        let jasas = await PrkJasa.find({ prk_id: prk._id }).lean();
        for (let jasa of jasas) {
          rab_jasa += parseInt(jasa.harga);
        }
      }

      skki.rab_jasa = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(rab_jasa);
      skki.rab_material = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(rab_material);
    }

    res.render("skki/index", {
      title: "SKKI",
      skkis: skkis,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getSkkiById(req, res) {
  try {
      const skki = await Skki.findOne({ _id: req.params.id }).lean();
  
      res.render("skki/detail/index", {
        title: "Informasi SKKI",
        skki: skki,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}

module.exports = {
  getSkki,
  getSkkiById,
};