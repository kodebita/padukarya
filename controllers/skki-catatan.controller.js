const Skki = require("../models/skki");
const SkkiCatatan = require("../models/skkiCatatan");

async function getSkkiCatatan(req, res) {
  try {
    const skki = await Skki.findOne({ _id: req.params.id }).lean();

    const catatans = await SkkiCatatan.find({ skki_id: skki._id }).lean();

    res.render("skki/detail/catatan/index", {
      title: "catatan SKKI",
      skki: skki,
      catatans: catatans,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getSkkiCatatan,
}