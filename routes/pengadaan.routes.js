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
router.get("/:id/prk/:prkId/hapus", pengadaanPrkController.deletePengadaanPrkById);

router.get("/:id/jasa", pengadaanJasaController.getPengadaanJasa);
router.get("/:id/jasa/baru", pengadaanJasaController.createPengadaanJasa);
router.post("/:id/jasa/baru", pengadaanValidation.validatePengadaanJasa, pengadaanJasaController.storePengadaanJasa);
router.get("/:id/jasa/:jasaId", pengadaanJasaController.getPengadaanJasaById);
router.post("/:id/jasa/:jasaId", pengadaanValidation.validatePengadaanJasaUpdate, pengadaanJasaController.updatePengadaanJasaById);
router.get("/:id/jasa/:jasaId/hapus", pengadaanJasaController.deletePengadaanJasaById);

router.get("/:id/material", pengadaanMaterialController.getPengadaanMaterial);
router.get("/:id/material/baru", pengadaanMaterialController.createPengadaanMaterial);
router.post("/:id/material/baru", pengadaanValidation.validatePengadaanMaterial, pengadaanMaterialController.storePengadaanMaterial);
router.get("/:id/material/:materialId", pengadaanMaterialController.getPengadaanMaterialById);
router.post("/:id/material/:materialId", pengadaanValidation.validatePengadaanMaterialUpdate, pengadaanMaterialController.updatePengadaanMaterialById);
router.get("/:id/material/:materialId/hapus", pengadaanMaterialController.deletePengadaanMaterialById);

router.get("/:id/lampiran", pengadaanLampiranController.getPengadaanLampiran);
router.get("/:id/lampiran/baru", pengadaanLampiranController.createPengadaanLampiran);
router.post("/:id/lampiran/baru", pengadaanLampiranController.storePengadaanLampiran);
router.get("/:id/lampiran/:lampiranId/hapus", pengadaanLampiranController.deletePengadaanLampiranById);

router.get("/:id/catatan", pengadaanCatatanController .getPengadaanCatatan);
router.post("/:id/catatan/baru", pengadaanValidation.validatePengadaanCatatan, pengadaanCatatanController.storePengadaanCatatan);

module.exports = router;
