const { validationResult } = require('express-validator');
const formatError = require('../helper/error-formatter');
const Tokens = require('csrf');

const tokens = new Tokens();
const secret = tokens.secretSync();

const Skki = require("../models/skki");
const Prk = require("../models/prk");
const PrkMaterial = require("../models/prkMaterial");
const Material = require("../models/material");

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
        toast: req.flash('toast')[0] || false,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}

async function getSkkiMaterialJson(req, res) {
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

      res.status(200).json({
        status: "success",
        message: "Data SKKI Material retrieved successfully",
        data: materials,
      })
  } catch (error) {
    
  }
}

async function createSkkiMaterial(req, res) {
  try {
    const skki = await Skki.findOne({ _id: req.params.id }).lean();

    res.render("skki/detail/material/create", {
      title: "Tambah Material SKKI",
      skki: skki,
      token: tokens.create(secret),
      errors: req.flash("errors")[0] || [],
      toast: req.flash("toast")[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function storeSkkiMaterial(req, res) {
  try {
    const skkiId = req.params.id;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash('errors', formatError(errors.array()));
      req.flash('old', req.body);
      return res.redirect('/skki/' + skkiId + '/material/baru');
    }

    const {
      prk_id,
      material_id,
      harga,
      jumlah,
      token
    } = req.body;

    if (!tokens.verify(secret, token)) {
      throw new Error('invalid token!')
    }

    // validate material_id
    const material = await Material.findOne({ _id: material_id }).lean();
    if (!material) {
      req.flash('errors', {
        msg: 'Material tidak ditemukan',
        param: 'material_id',
      });
      req.flash('old', req.body);
      return res.redirect('/skki/' + skkiId + '/material/baru');
    }

    const prkMaterial = new PrkMaterial({
      prk_id: prk_id,
      material_id: material._id,
      kode_normalisasi: material.kode_normalisasi,
      nama_material: material.nama_material,
      satuan: material.satuan,
      harga: harga,
      jumlah: jumlah,
    });

    await prkMaterial.save();

    req.flash('toast', req.flash('toast', {
      success: true,
      message: 'Material berhasil ditambahkan'
    }));

    res.redirect("/skki/" + skkiId + "/material");
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
}

async function getSkkiMaterialById(req, res) {
  try {
    const skkiId = req.params.id;
    const prkMaterialId = req.params.materialId;

    const skki = await Skki.findOne({ _id: skkiId }).lean();

    const material = await PrkMaterial.findOne({ _id: prkMaterialId }).lean();

    const prk = await Prk.findOne({ _id: material.prk_id }).lean();

    res.render("skki/detail/material/detail", {
      title: "Detail Material SKKI",
      skki: skki,
      material: material,
      prk: prk,
      toast: req.flash("toast")[0] || false,
      errors: req.flash("errors")[0] || {},
      token: tokens.create(secret),
    });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateSkkiMaterialById(req, res) {
  try {
    const skkiId = req.params.id;
    const materialId = req.params.materialId;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash('errors', formatError(errors.array()));
      req.flash('old', req.body);
      return res.redirect('/skki/' + skkiId + '/material/' + materialId);
    }

    const {
      material_id,
      token
    } = req.body;

    if (!tokens.verify(secret, token)) {
      throw new Error('invalid token!')
    }

    // validate material_id
    const material = await Material.findOne({ _id: material_id }).lean();
    if (!material) {
      req.flash('errors', {
        msg: 'Material tidak ditemukan',
        param: 'material_id',
      });
      req.flash('old', req.body);
      return res.redirect('/skki/' + skkiId + '/material/baru');
    }

    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString(), // auto-update updated_at
    }

    const updatedPrkMaterial = await PrkMaterial.findByIdAndUpdate(materialId, updateData, {
      new: true, // return updated document
      runValidators: true,
    });

    if (!updatedPrkMaterial) {
      req.flash('toast', {
        success: false,
        message: 'Terjadi kesalahan'
      });
      res.redirect("/skki/" + skkiId + '/material/' + materialId);
    }

    req.flash('toast', req.flash('toast', {
      success: true,
      message: 'Material berhasil diperbarui'
    }));

    res.redirect("/skki/" + skkiId + "/material/" + materialId);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteSkkiMaterialById(req, res) {
  const skkiId = req.params.id;
  const materialId = req.params.materialId;

  try {
    const deletedPrkMaterial = await PrkMaterial.findByIdAndDelete(materialId);

    if (!deletedPrkMaterial) {
      req.flash('toast', req.flash('toast', {
        success: false,
        message: 'Terjadi kesalahan'
      }));
    } else {
      // success
      req.flash('toast', req.flash('toast', {
        success: true,
        message: 'Material berhasil dihapus'
      }));
    }

    // redirect to the same page
    res.redirect("/skki/" + skkiId + '/material');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getSkkiMaterial,
  getSkkiMaterialJson,
  createSkkiMaterial,
  storeSkkiMaterial,
  getSkkiMaterialById,
  updateSkkiMaterialById,
  deleteSkkiMaterialById
};