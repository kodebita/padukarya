const { validationResult } = require('express-validator');
const Tokens = require('csrf');

const tokens = new Tokens();
const secret = tokens.secretSync();

const formatError = require('../helper/error-formatter');

// Model
const Prk = require("../models/prk");
const PrkMaterial = require("../models/prkMaterial");
const Material = require("../models/material");
const Pengadaan = require("../models/pengadaan");
const PengadaanMaterial = require("../models/pengadaanMaterial");
const Skki = require("../models/skki");

async function getPengadaanMaterial(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();
    const materials = await PengadaanMaterial.find({
      pengadaan_id: pengadaan._id,
    }).lean();

    for (let material of materials) {
      let prk = await Prk.findOne({ _id: material.prk_id }).lean();
      material.prk = prk;
    }

    res.render("pengadaan/detail/material/index", {
      title: "RAB Material Pengadaan",
      pengadaan: pengadaan,
      materials: materials,
      toast: req.flash('toast')[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createPengadaanMaterial(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();

    res.render("pengadaan/detail/material/create", {
      title: "Tambah Material Pengadaan",
      pengadaan: pengadaan,
      toast: req.flash("toast")[0] || false,
      token: tokens.create(secret),
      errors: req.flash("errors")[0] || {},
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function storePengadaanMaterial(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();

    // validate pengadaan
    if (!pengadaan) {
      req.flash("errors", {
        success: false,
        message: "Pengadaan tidak ditemukan",
      });

      return res.redirect(
        `/pengadaan/${req.params.id}/material/baru`
      );
    }

    const {
      token,
      prk_material_id,
      harga,
      jumlah,
      satuan
    } = req.body;

    // validate token
    if(!tokens.verify(secret, token)) {
      throw new Error('invalid token!')
    }

    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      req.flash("errors", formatError(errors.array()));
      req.flash("old", req.body);
      req.flash("toast", {
        success: false,
        message: "Gagal menambahkan material",
      });

      return res.redirect(
        `/pengadaan/${req.params.id}/material/baru`
      );
    }

    // validate prk material
    const prkMaterial = await PrkMaterial.findOne({ _id: prk_material_id }).lean();
    
    if (!prkMaterial) {
      req.flash("errors", {
        msg: "PRK Material tidak ditemukan",
        param: "prk_material_id",
      });

      req.flash("old", req.body);

      return res.redirect(
        `/pengadaan/${req.params.id}/material/baru`
      );
    }

    // validate material_id
    const material = await Material.findOne({ _id: prkMaterial.material_id }).lean();
    if (!material) {
      req.flash("errors", {
        msg: "Material tidak ditemukan",
        param: "material_id",
      });

      req.flash("old", req.body);

      req.flash("toast", {
        success: false,
        message: "Material tidak ditemukan",
      });
      return res.redirect(
        `/pengadaan/${req.params.id}/material/baru`
      );
    }

    // update pengadaan_id pada prk material
    const update = await PrkMaterial.findByIdAndUpdate(prkMaterial._id, {
      pengadaan_id: pengadaan._id,
      updated_at: new Date().toISOString(), // auto-update updated_at
    }, {
      new: true, // return updated document
      runValidators: true,
    });

    if (!update) {
      req.flash('toast', {
        success: false,
        message: 'Terjadi kesalahan'
      });
      res.redirect("/pengadaan/" + req.params.id + '/material/baru');
    }

    // insert material pada pengadaan material
    const pengadaanMaterial = new PengadaanMaterial({
      kode_normalisasi: material.kode_normalisasi,
      nama_material: material.nama_material,
      satuan: material.satuan,
      harga: harga,
      jumlah: jumlah,
      prk_id: prkMaterial.prk_id,
      pengadaan_id: pengadaan._id,
      prk_material_id: prkMaterial._id,
      material_id: material._id,
      created_at: new Date().toISOString(),
    });

    await pengadaanMaterial.save();

    req.flash("toast", {
      success: true,
      message: "Berhasil menambahkan material",
    });

    res.redirect("/pengadaan/" + req.params.id + "/material");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getPengadaanMaterialById(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();
    if (!pengadaan) {
      req.flash("toast", {
        success: false,
        message: "Pengadaan tidak ditemukan",
      });
      return res.redirect("/pengadaan/" + req.params.id + "/material");
    }

    const pengadaanMaterial = await PengadaanMaterial.findOne({ _id: req.params.materialId }).lean();
    if (!pengadaanMaterial) {
      req.flash("toast", {
        success: false,
        message: "Material tidak ditemukan",
      });
      return res.redirect("/pengadaan/" + req.params.id + "/material");
    }

    const prkMaterial = await PrkMaterial.findOne({ _id: pengadaanMaterial.prk_material_id }).lean();

    const skki = await Skki.findOne({ _id: pengadaan.skki_id }).lean();
    const prk = await Prk.findOne({ _id: pengadaanMaterial.prk_id }).lean();

    res.render("pengadaan/detail/material/detail", {
      title: "Informasi Material Pengadaan",
      pengadaan: pengadaan,
      material: pengadaanMaterial,
      skki: skki,
      prk: prk,
      prkMaterial: prkMaterial,
      toast: req.flash("toast")[0] || false,
      token: tokens.create(secret),
      errors: req.flash("errors")[0] || {},
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updatePengadaanMaterialById(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();
    if (!pengadaan) {
      req.flash("toast", {
        success: false,
        message: "Pengadaan tidak ditemukan",
      });
      return res.redirect("/pengadaan/" + req.params.id + "/material");
    }

    // validate token
    if(!tokens.verify(secret, req.body.token)) {
      throw new Error('invalid token!')
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("errors", formatError(errors.array()));
      req.flash("old", req.body);
      req.flash("toast", {
        success: false,
        message: "Gagal menambahkan material",
      });

      return res.redirect(
        `/pengadaan/${req.params.id}/material/baru`
      );
    }

    const pengadaanMaterial = await PengadaanMaterial.findOne({ _id: req.params.materialId }).lean();
    if (!pengadaanMaterial) {
      req.flash("toast", {
        success: false,
        message: "Material tidak ditemukan",
      });
      return res.redirect("/pengadaan/" + req.params.id + "/material");
    }

    // update pengadaan material
    await PengadaanMaterial.findByIdAndUpdate(pengadaanMaterial._id, {
      harga: req.body.harga,
      jumlah: req.body.jumlah,
      updated_at: new Date().toISOString(),
    });

    req.flash("toast", {
      success: true,
      message: "Berhasil mengupdate material",
    });

    res.redirect("/pengadaan/" + req.params.id + "/material");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deletePengadaanMaterialById(req, res) {
  try {
    const pengadaan = await Pengadaan.findOne({ _id: req.params.id }).lean();
    if (!pengadaan) {
      req.flash("toast", {
        success: false,
        message: "Pengadaan tidak ditemukan",
      });
      return res.redirect("/pengadaan/" + req.params.id + "/material");
    }

    const pengadaanMaterial = await PengadaanMaterial.findOne({ _id: req.params.materialId }).lean();
    if (!pengadaanMaterial) {
      req.flash("toast", {
        success: false,
        message: "Material tidak ditemukan",
      });
      return res.redirect("/pengadaan/" + req.params.id + "/material");
    }

    const prkMaterial = await PrkMaterial.findOne({ _id: pengadaanMaterial.prk_material_id }).lean();
    if (!prkMaterial) {
      req.flash("toast", {
        success: false,
        message: "PRK Material tidak ditemukan",
      });
      return res.redirect("/pengadaan/" + req.params.id + "/material");
    }

    // delete pengadaan material
    await PengadaanMaterial.findByIdAndDelete(pengadaanMaterial._id);

    // update prk material
    await PrkMaterial.findByIdAndUpdate(prkMaterial._id, {
      pengadaan_id: null,
      updated_at: new Date().toISOString(),
    });

    req.flash("toast", {
      success: true,
      message: "Berhasil menghapus material",
    });

    res.redirect("/pengadaan/" + req.params.id + "/material");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getPengadaanMaterial,
  createPengadaanMaterial,
  storePengadaanMaterial,
  getPengadaanMaterialById,
  updatePengadaanMaterialById,
  deletePengadaanMaterialById
}