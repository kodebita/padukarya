const express = require("express");
const router = express.Router();
const Tokens = require('csrf');
const multer  = require('multer');
const { body, validationResult } = require('express-validator');
const formatError = require('../helper/error-formatter');
const fs = require('fs');
const path = require('path');

// generate token
const tokens = new Tokens();
const secret = tokens.secretSync();

// Model
const Prk = require("../models/prk");
const PrkMaterial = require("../models/prkMaterial");
const PrkJasa = require("../models/prkJasa");
const PrkLampiran = require("../models/prkLampiran");
const PrkCatatan = require("../models/prkCatatan");
const Material = require("../models/material");

// get upload helper
const upload = require('../helper/upload-helper');

router.get("/", async (req, res) => {
  try {
    const prks = await Prk.find().lean();
    for (const prk of prks) {
      let rab_material = 0;
      let rab_jasa = 0;

      let materials = await PrkMaterial.find({ prk_id: prk._id }).lean();
      for (let material of materials) {
        rab_material += parseInt(material.harga) * parseInt(material.jumlah);
      }

      let jasas = await PrkJasa.find({ prk_id: prk._id }).lean();
      for (let jasa of jasas) {
        rab_jasa += parseInt(jasa.harga);
      }

      prk.rab_material = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(rab_material);
      prk.rab_jasa = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(rab_jasa);
    }

    console.log(process.memoryUsage());

    res.render("prk/index", {
      title: "PRK",
      prks: prks,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/baru", async (req, res) => {
  const token = tokens.create(secret);

  res.render("prk/create", {
    title: "PRK Baru",
    token: token,
    data: {
      tahun: new Date().getFullYear(),
    },
    errors: req.flash('errors')[0] || {},
    old: req.flash('old')[0] || {}
  });
});

router.post("/baru",
  [
    body("tahun")
      .notEmpty().withMessage("Tahun tidak boleh kosong")
      .isNumeric().withMessage('Tahun harus berupa angka'),
    body("basket")
      .notEmpty().withMessage("Basket tidak boleh kosong")
      .isNumeric().withMessage('Basket harus berupa angka')
      .isIn([1, 2, 3]).withMessage('Basket harus 1, 2,  atau 3'),
    body("nama_project").notEmpty().withMessage("Nama Project tidak boleh kosong"),
    body("nomor_prk").notEmpty().withMessage("Nomor PRK tidak boleh kosong"), 
    body("type")
      .notEmpty().withMessage("Tipe tidak boleh kosong")
      .isIn(['murni', 'turunan']).withMessage('Tipe harus murni atau turunan'),
    body("nomor_lot").notEmpty().withMessage("Nomor Lot tidak boleh kosong"),
    body("prioritas")
      .notEmpty().withMessage("Prioritas tidak boleh kosong")
      .isIn([1, 2, 3, 4]).withMessage('Prioritas harus 1, 2, 3 atau 4'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
  
      if (!errors.isEmpty()) {
        req.flash('errors', formatError(errors.array()));
        req.flash('old', req.body);
        return res.redirect('/prk/baru');
      }
  
      const { 
        tahun,
        basket,
        nama_project,
        nomor_prk,
        type,
        nomor_lot,
        prioritas,
        token
      } = req.body;
  
      if (!tokens.verify(secret, token)) {
        throw new Error('invalid token!')
      }
  
      const prk = new Prk({
        tahun: tahun,
        basket: basket,
        nama_project: nama_project,
        nomor_prk: nomor_prk,
        type: type,
        nomor_lot: nomor_lot,
        prioritas: prioritas,
      });
  
      const save = await prk.save();
  
      res.redirect("/prk/"+save._id);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get("/:id", async (req, res) => {
  try {
    const token = tokens.create(secret)

    const prk = await Prk.findOne({ _id: req.params.id }).lean();

    res.render("prk/detail/index", {
      title: "Informasi PRK",
      prk: prk,
      token: token,
      errors: req.flash('errors')[0] || {},
      old: req.flash('old')[0] || {},
      toast: req.flash('toast')[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id",
  [
    body("tahun")
      .notEmpty().withMessage("Tahun tidak boleh kosong")
      .isNumeric().withMessage('Tahun harus berupa angka'),
    body("basket")
      .notEmpty().withMessage("Basket tidak boleh kosong")
      .isNumeric().withMessage('Basket harus berupa angka')
      .isIn([1, 2, 3]).withMessage('Basket harus 1, 2,  atau 3'),
    body("nama_project").notEmpty().withMessage("Nama Project tidak boleh kosong"),
    body("nomor_prk").notEmpty().withMessage("Nomor PRK tidak boleh kosong"), 
    body("type")
      .notEmpty().withMessage("Tipe tidak boleh kosong")
      .isIn(['murni', 'turunan']).withMessage('Tipe harus murni atau turunan'),
    body("nomor_lot").notEmpty().withMessage("Nomor Lot tidak boleh kosong"),
    body("prioritas")
      .notEmpty().withMessage("Prioritas tidak boleh kosong")
      .isIn([1, 2, 3, 4]).withMessage('Prioritas harus 1, 2, 3 atau 4'),
  ],
  async (req, res) => {
    const id = req.params.id;

    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        req.flash('errors', formatError(errors.array()));
        req.flash('old', req.body);
        return res.redirect('/prk/' + id);
      }

      const { token } = req.body;

      if (!tokens.verify(secret, token)) {
        throw new Error('invalid token!')
      }

      const updateData = {
        ...req.body,
        updated_at: new Date().toISOString(), // auto-update updated_at
      };

      const updatedPrk = await Prk.findByIdAndUpdate(id, updateData, {
        new: true, // return updated document
        runValidators: true,
      });

      if (!updatedPrk) {
        req.flash('toast', {
          success: false,
          message: 'PRK tidak ditemukan'
        });
        res.redirect("/prk/" + id);
      }

      // success
      req.flash('toast', req.flash('toast', {
        success: true,
        message: 'PRK berhasil diperbarui'
      }));

      // redirect to the same page
      res.redirect("/prk/" + id);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

router.get("/:id/jasa", async (req, res) => {
  try {
    const prk = await Prk.findOne({ _id: req.params.id }).lean();

    const jasas = await PrkJasa.find({ prk_id: prk._id }).lean();

    res.render("prk/detail/jasa/index", {
      title: "RAB Jasa PRK",
      prk: prk,
      jasas: jasas,
      toast: req.flash('toast')[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/jasa/baru", async (req, res) => {
  try {
    const token = tokens.create(secret);
    const prk = await Prk.findOne({ _id: req.params.id }).lean();

    res.render("prk/detail/jasa/create", {
      title: "RAB Jasa PRK",
      prk: prk,
      token: token,
      errors: req.flash('errors')[0] || {},
      old: req.flash('old')[0] || {},
      toast: req.flash('toast')[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

router.post("/:id/jasa/baru",
  [
    body("nama_jasa")
      .notEmpty().withMessage("Nama Jasa tidak boleh kosong"),
    body("harga")
      .notEmpty().withMessage("Nominal tidak boleh kosong")
      .customSanitizer(value => {
        return parseFloat(value.replace(/,/g, '')); // remove commas and convert to float
      })
      .isNumeric().withMessage('Nominal harus berupa angka'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
  
      if (!errors.isEmpty()) {
        req.flash('errors', formatError(errors.array()));
        req.flash('old', req.body);
        return res.redirect('/prk/'+req.params.id+'/jasa/baru');
      }
  
      const { 
        nama_jasa,
        harga,
        token
      } = req.body;
  
      if (!tokens.verify(secret, token)) {
        throw new Error('invalid token!')
      }
  
      const prkJasa = new PrkJasa({
        prk_id: req.params.id,
        nama_jasa: nama_jasa.trim(),
        harga: harga,
      });
  
      await prkJasa.save();
  
      res.redirect("/prk/"+req.params.id+"/jasa");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get("/:id/jasa/:jasaId", async (req, res) => {
  try {
    const token = tokens.create(secret);
    const prk = await Prk.findOne({ _id: req.params.id }).lean();
    const jasa = await PrkJasa.findOne({ _id: req.params.jasaId }).lean();

    res.render("prk/detail/jasa/detail", {
      title: "RAB Jasa PRK",
      prk: prk,
      jasa: jasa,
      token: token,
      errors: req.flash('errors')[0] || {},
      old: req.flash('old')[0] || {},
      toast: req.flash('toast')[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/jasa/:jasaId", [
    body("nama_jasa")
      .notEmpty().withMessage("Nama Jasa tidak boleh kosong"),
    body("harga")
      .notEmpty().withMessage("Nominal tidak boleh kosong")
      .customSanitizer(value => {
        return parseFloat(value.replace(/,/g, '')); // remove commas and convert to float
      })
      .isNumeric().withMessage('Nominal harus berupa angka'),
  ], async (req, res) => {
    const id = req.params.id;
    const jasaId = req.params.jasaId;

    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        req.flash('errors', formatError(errors.array()));
        req.flash('old', req.body);

        return res.redirect('/prk/' + id + '/jasa/' + jasaId);
      }

      const { token, nama_jasa, harga } = req.body;

      if (!tokens.verify(secret, token)) {
        throw new Error('invalid token!')
      }

      const updateData = {
        nama_jasa: nama_jasa.trim(),
        harga: harga,
        updated_at: new Date().toISOString(), // auto-update updated_at
      };

      const updatedPrkJasa = await PrkJasa.findByIdAndUpdate(jasaId, updateData, {
        new: true, // return updated document
        runValidators: true,
      });

      if (!updatedPrkJasa) {
        req.flash('toast', {
          success: false,
          message: 'Terjadi kesalahan'
        });
        res.redirect("/prk/" + id + '/jasa/' + jasaId);
      }

      // success
      req.flash('toast', req.flash('toast', {
        success: true,
        message: 'Jasa berhasil diperbarui'
      }));

      // redirect to the same page
      res.redirect("/prk/" + id + '/jasa/' + jasaId);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

router.get("/:id/jasa/:jasaId/hapus", async (req, res) => {
    const id = req.params.id;
    const jasaId = req.params.jasaId;

    try {
      const deletedPrkJasa = await PrkJasa.findByIdAndDelete(jasaId);

      if (!deletedPrkJasa) {
        req.flash('toast', req.flash('toast', {
          success: false,
          message: 'Terjadi kesalahan'
        }));
      } else {
        // success
        req.flash('toast', req.flash('toast', {
          success: true,
          message: 'Jasa berhasil dihapus'
        }));
      }

      // redirect to the same page
      res.redirect("/prk/" + id + '/jasa');
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

router.get("/:id/material", async (req, res) => {
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
});

router.get("/:id/material/baru", async (req, res) => {
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
});

router.post("/:id/material/baru",
  [
    body("material_id")
      .notEmpty().withMessage("Material tidak boleh kosong"),
    body("harga")
      .notEmpty().withMessage("Harga tidak boleh kosong")
      .customSanitizer(value => {
        return parseFloat(value.replace(/,/g, '')); // remove commas and convert to float
      })
      .isFloat({min: 1}).withMessage('Harga tidak valid'),
    body("jumlah")
      .notEmpty().withMessage("Jumlah tidak boleh kosong")
      .customSanitizer(value => {
        return parseFloat(value.replace(/,/g, '')); // remove commas and convert to float
      })
      .isFloat({min: 1}).withMessage('Jumlah tidak valid'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
  
      if (!errors.isEmpty()) {
        req.flash('errors', formatError(errors.array()));
        req.flash('old', req.body);
        return res.redirect('/prk/'+req.params.id+'/material/baru');
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
        return res.redirect('/prk/'+req.params.id+'/material/baru');
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
  
      res.redirect("/prk/"+req.params.id+"/material");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get("/:id/material/:materialId", async (req, res) => {
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
});

router.post("/:id/material/:materialId",
  [
    body("material_id")
      .notEmpty().withMessage("Material tidak boleh kosong"),
    body("harga")
      .notEmpty().withMessage("Harga tidak boleh kosong")
      .customSanitizer(value => {
        return parseFloat(value.replace(/,/g, '')); // remove commas and convert to float
      })
      .isFloat({min: 1}).withMessage('Harga tidak valid'),
    body("jumlah")
      .notEmpty().withMessage("Jumlah tidak boleh kosong")
      .customSanitizer(value => {
        return parseFloat(value.replace(/,/g, '')); // remove commas and convert to float
      })
      .isFloat({min: 1}).withMessage('Jumlah tidak valid'),
  ],
  async (req, res) => {
    try {
      const id = req.params.id;
      const materialId = req.params.materialId;
      const errors = validationResult(req);
  
      if (!errors.isEmpty()) {
        req.flash('errors', formatError(errors.array()));
        req.flash('old', req.body);
        return res.redirect('/prk/'+id+'/material/'+materialId);
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
        return res.redirect('/prk/'+id+'/material/baru');
      }

      const updateData = {
        ...req.body,
        updated_at: new Date().toISOString(), // auto-update updated_at
      }
  
      const updatedPrkMaterial = await PrkMaterial.findByIdAndUpdate(materialId, updateData, {
        new: true, // return updated document
        runValidators: true,
      });
  
      if(!updatedPrkMaterial) {
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
  
      res.redirect("/prk/"+req.params.id+"/material/"+materialId);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get("/:id/material/:materialId/hapus",
  async (req, res) => {
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
});

router.get("/:id/lampiran", async (req, res) => {
  try {
    const prk = await Prk.findOne({ _id: req.params.id }).lean();

    const lampirans = await PrkLampiran.find({ prk_id: prk._id }).lean();

    res.render("prk/detail/lampiran/index", {
      title: "Lampiran PRK",
      prk: prk,
      lampirans: lampirans,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/lampiran/baru', async (req, res) => {
  try {
    const token = tokens.create(secret);
    const prk = await Prk.findOne({ _id: req.params.id }).lean();

    res.render("prk/detail/lampiran/create", {
      title: "Lampiran PRK",
      prk: prk,
      token: token,
      errors: req.flash('errors')[0] || {},
      old: req.flash('old')[0] || {},
      toast: req.flash('toast')[0] || false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/lampiran/baru', async (req, res, next) => {
  try {
    const id = req.params.id;

    upload.single('file')(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          req.flash('errors', { file: 'Ukuran file maksimal 15MB' });
        } else {
          req.flash('errors', { file: 'Terjadi kesalahan unggah file' });
        }
        
        return res.redirect('/prk/'+id+'/lampiran/baru');
      } else if (err) {
        req.flash('errors', { file: err.message });
        return res.redirect('/prk/'+id+'/lampiran/baru');
      }
  
      if (!req.file) {
        req.flash('errors', { file: 'File wajib diunggah' });
        req.flash('toast', req.flash('toast', {
          success: false,
          message: 'Terjadi Kesalahan'
        }));
        return res.redirect('/prk/'+id+'/lampiran/baru');
      }

      // write to mongo
      const prkLampiran = new PrkLampiran({
        prk_id: req.params.id,
        nama_file: req.file.originalname,
        url_file: req.file.filename,
        type_file: req.file.mimetype,
        size_file: req.file.size,
        created_at: new Date().toISOString()
      });
  
      await prkLampiran.save();
  
      req.flash('toast', req.flash('toast', {
        success: true,
        message: 'Lampiran berhasil ditambahkan'
      }));

      return res.redirect('/prk/'+id+'/lampiran');
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/lampiran/:lampiranId/hapus', async (req, res) => {
  try{
    const id = req.params.id;
    const lampiranId = req.params.lampiranId;

    const lampiran = await PrkLampiran.findOne({ _id: lampiranId }).lean();
    if (!lampiran) {
      req.flash('toast', {
        success: false,
        message: 'Lampiran tidak ditemukan'
      });

      return res.redirect('/prk/'+id+'/lampiran');
    }
  
    const fullPath = path.join(__dirname, '../public/uploads/lampiran/', lampiran.url_file);
    
    fs.unlink(fullPath, async (err) => {
      if (err) {
        req.flash('toast', {
          success: false,
          message: 'Terjadi kesalahan'
        });

        return res.redirect('/prk/'+id+'/lampiran');
      }

      // delete from mongo
      await PrkLampiran.findOneAndDelete({ _id: lampiranId });
  
      req.flash('toast', {
        success: true,
        message: 'Lampiran berhasil dihapus'
      });
      return res.redirect('/prk/'+id+'/lampiran');
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/catatan", async (req, res) => {
  try {
    const prk = await Prk.findOne({ _id: req.params.id }).lean();

    const catatans = await PrkCatatan.find({ prk_id: prk._id }).lean();

    res.render("prk/detail/catatan/index", {
      title: "catatan PRK",
      prk: prk,
      catatans: catatans,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
