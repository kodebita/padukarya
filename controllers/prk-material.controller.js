const { validationResult } = require('express-validator');
const Tokens = require('csrf');

const Prk = require("../models/prk");
const PrkMaterial = require("../models/prkMaterial");
const Material = require("../models/material");

const formatError = require('../helper/error-formatter');

const tokens = new Tokens();
const secret = tokens.secretSync();

async function getPrkMaterial(req, res) {
  try {
    const prk = await Prk.findOne({ _id: req.params.id }).lean();

    const materials = await PrkMaterial.find({ prk_id: prk._id }).lean();

    res.render("prk/detail/material/index", {
      title: "RAB Material PRK",
      prk: prk,
      materials: materials,
      toast: req.flash('toast')[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createPrkMaterial(req, res) {
  try {
    const token = tokens.create(secret);
    const prk = await Prk.findOne({ _id: req.params.id }).lean();

    res.render("prk/detail/material/create", {
      title: "RAB Material PRK",
      prk: prk,
      token: token,
      errors: req.flash('errors')[0] || {},
      old: req.flash('old')[0] || {},
      toast: req.flash('toast')[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function storePrkMaterial(req, res) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash('errors', formatError(errors.array()));
      req.flash('old', req.body);
      return res.redirect('/prk/' + req.params.id + '/material/baru');
    }

    const {
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
      return res.redirect('/prk/' + req.params.id + '/material/baru');
    }

    const prkMaterial = new PrkMaterial({
      prk_id: req.params.id,
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

    res.redirect("/prk/" + req.params.id + "/material");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getPrkMaterialById(req, res) {
  try {
    const token = tokens.create(secret);
    const prk = await Prk.findOne({ _id: req.params.id }).lean();
    const material = await PrkMaterial.findOne({ _id: req.params.materialId }).lean();

    res.render("prk/detail/material/detail", {
      title: "RAB Material PRK",
      prk: prk,
      material: material,
      token: token,
      errors: req.flash('errors')[0] || {},
      old: req.flash('old')[0] || {},
      toast: req.flash('toast')[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updatePrkMaterialById(req, res) {
  try {
    const id = req.params.id;
    const materialId = req.params.materialId;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash('errors', formatError(errors.array()));
      req.flash('old', req.body);
      return res.redirect('/prk/' + id + '/material/' + materialId);
    }

    const {
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
      return res.redirect('/prk/' + id + '/material/baru');
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
      res.redirect("/prk/" + id + '/material/' + materialId);
    }

    req.flash('toast', req.flash('toast', {
      success: true,
      message: 'Material berhasil diperbarui'
    }));

    res.redirect("/prk/" + req.params.id + "/material/" + materialId);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deletePrkMaterialById(req, res) {
  const id = req.params.id;
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
    res.redirect("/prk/" + id + '/material');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getPrkMaterial, createPrkMaterial, storePrkMaterial, getPrkMaterialById, updatePrkMaterialById, deletePrkMaterialById };  