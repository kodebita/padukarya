// Model
const Pengadaan = require("../models/pengadaan");
const PengadaanMaterial = require("../models/pengadaanMaterial");
const PengadaanJasa = require("../models/pengadaanJasa");

async function getPengadaan(req, res) {
  try {
    const pengadaans = await Pengadaan.find().lean();

    for (pengadaan of pengadaans) {
      let rab_material = 0;
      let rab_jasa = 0;

      const pengadaanMaterials = await PengadaanMaterial.find({
        pengadaan_id: pengadaan._id,
      }).lean();
      for (pengadaanMaterial of pengadaanMaterials) {
        rab_material +=
          parseInt(pengadaanMaterial.harga) *
          parseInt(pengadaanMaterial.jumlah);
      }

      const pengadaanJasas = await PengadaanJasa.find({
        pengadaan_id: pengadaan._id,
      }).lean();
      for (pengadaanJasa of pengadaanJasas) {
        rab_jasa += parseInt(pengadaanJasa.harga);
      }

      pengadaan.rab_material = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(rab_material);
      pengadaan.rab_jasa = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(rab_jasa);
    }

    res.render("pengadaan/index", {
      title: "Pengadaan",
      pengadaans: pengadaans,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getPengadaanById(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();

    res.render("pengadaan/detail/index", {
      title: "Informasi Pengadaan",
      pengadaan: pengadaan,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getPengadaan,
  getPengadaanById
}