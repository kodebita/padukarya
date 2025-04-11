const Skki = require("../models/skki");
const SkkiLampiran = require("../models/skkiLampiran");

async function getSkkiLampiran(req, res) {
  try {
      const skki = await Skki.findOne({ _id: req.params.id }).lean();
  
      const lampirans = await SkkiLampiran.find({ skki_id: skki._id }).lean();
      res.render("skki/detail/lampiran/index", {
        title: "Lampiran SKKI",
        skki: skki,
        lampirans: lampirans,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}

module.exports = {
  getSkkiLampiran,
};