const express = require("express");
const router = express.Router();

const pengadaanController = require("../controllers/pengadaan.controller");
const pengadaanPrkController = require("../controllers/pengadaan-prk.controller");
const pengadaanJasaController = require("../controllers/pengadaan-jasa.controller");
const pengadaanMaterialController = require("../controllers/pengadaan-material.controller");
const pengadaanLampiranController = require("../controllers/pengadaan-lampiran.controller");
const pengadaanCatatanController = require("../controllers/pengadaan-catatan.controller");

const pengadaanValidation = require("../validations/pengadaan.validation");

router.get("/", pengadaanController.getPengadaan);
router.get("/baru", pengadaanController.createPengadaan);
router.post("/baru", pengadaanValidation.validatePengadaan, pengadaanController.storePengadaan);

router.get("/:id", pengadaanController.getPengadaanById);
router.get("/:id/hapus", pengadaanController.deletePengadaanById);

router.get("/:id/prk", pengadaanPrkController.getPengadaanPrk);
router.get("/:id/prk/baru", pengadaanPrkController.createPengadaanPrk);
router.post("/:id/prk/baru", pengadaanValidation.validatePengadaanPrk, pengadaanPrkController.storePengadaanPrk);
router.get("/:id/prk/:prk_id/hapus", pengadaanPrkController.deletePengadaanPrkById);

router.get("/:id/jasa", pengadaanJasaController.getPengadaanJasa);

router.get("/:id/material", pengadaanMaterialController.getPengadaanMaterial);

router.get("/:id/lampiran", pengadaanLampiranController.getPengadaanLampiran);

router.get("/:id/catatan", pengadaanCatatanController .getPengadaanCatatan);

module.exports = router;
