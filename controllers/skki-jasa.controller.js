const Skki = require("../models/skki");
const Prk = require("../models/prk");
const PrkJasa = require("../models/prkJasa");

async function getSkkiJasa(req, res) {
  try {
      const skki = await Skki.findOne({ _id: req.params.id }).lean();
  
      let jasas = [];
  
      const prks = await Prk.find({ prk_skki_id: skki._id }).lean();
      for (let prk of prks) {
        let prk_jasas = await PrkJasa.find({ prk_id: prk._id }).lean();
        for (let prk_jasa of prk_jasas) {
          prk_jasa.nomor_prk = prk.nomor_prk;
          jasas.push(prk_jasa);
        }
      }
  
      res.render("skki/detail/jasa/index", {
        title: "RAB Jasa SKKI",
        skki: skki,
        jasas: jasas,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}

module.exports = {
  getSkkiJasa,
};