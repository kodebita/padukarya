const Skki = require("../models/skki");
const Prk = require("../models/prk");
const PrkMaterial = require("../models/prkMaterial");

async function getSkkiMaterial(req, res) {
  try {
      const skki = await Skki.findOne({ _id: req.params.id }).lean();
  
      let materials = [];
  
      const prks = await Prk.find({ prk_skki_id: skki._id }).lean();
      for (let prk of prks) {
        let prk_materials = await PrkMaterial.find({ prk_id: prk._id }).lean();
        for (let prk_material of prk_materials) {
          prk_material.nomor_prk = prk.nomor_prk;
          materials.push(prk_material);
        }
      }
  
      res.render("skki/detail/material/index", {
        title: "RAB Material SKKI",
        skki: skki,
        materials: materials,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}

module.exports = {
  getSkkiMaterial,
};