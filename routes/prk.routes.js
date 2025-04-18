const express = require("express");
const router = express.Router();

// controller 
const prkController = require("../controllers/prk.controller");
const prkJasaController = require("../controllers/prk-jasa.controller");
const prkMaterialController = require("../controllers/prk-material.controller");
const prkLampiranController = require("../controllers/prk-lampiran.controller");
const prkCatatanController = require("../controllers/prk-catatan.controller");

const prkValidation = require("../validations/prk.validation");

// prk
router.get("/", prkController.getPrk);
router.get("/json", prkController.getPrkJson);
router.get("/baru", prkController.createPrk);
router.post("/baru", prkValidation.validatePrk, prkController.storePrk);
router.get("/:id", prkController.getPrkById);
router.post("/:id", prkValidation.validatePrk, prkController.updatePrkById);
router.get("/:id/json", prkController.getPrkByIdJson);
router.get("/:id/hapus", prkController.deletePrkById);

// prk jasa
router.get("/:id/jasa", prkJasaController.getPrkJasa);
router.get("/:id/jasa/baru", prkJasaController.createPrkJasa);
router.post("/:id/jasa/baru", prkValidation.validatePrkJasa, prkJasaController.storePrkJasa);
router.get("/:id/jasa/:jasaId", prkJasaController.getPrkJasaById);
router.post("/:id/jasa/:jasaId", prkValidation.validatePrkJasa, prkJasaController.updatePrkJasaById);
router.get("/:id/jasa/:jasaId/json", prkJasaController.getPrkJasaByIdJson);
router.get("/:id/jasa/:jasaId/hapus", prkJasaController.deletePrkJasaById);

// prk material
router.get("/:id/material", prkMaterialController.getPrkMaterial);
router.get("/:id/material/baru", prkMaterialController.createPrkMaterial);
router.post("/:id/material/baru", prkValidation.validatePrkMaterial, prkMaterialController.storePrkMaterial);
router.get("/:id/material/:materialId", prkMaterialController.getPrkMaterialById);
router.post("/:id/material/:materialId", prkValidation.validatePrkMaterial, prkMaterialController.updatePrkMaterialById);
router.get("/:id/material/:materialId/json", prkMaterialController.getPrkMaterialByIdJson);
router.get("/:id/material/:materialId/hapus", prkMaterialController.deletePrkMaterialById);

// prk lampiran
router.get("/:id/lampiran", prkLampiranController.getPrkLampiran);
router.get('/:id/lampiran/baru', prkLampiranController.createPrkLampiran);
router.post('/:id/lampiran/baru', prkLampiranController.storePrkLampiran);
router.get('/:id/lampiran/:lampiranId/hapus', prkLampiranController.deletePrkLampiranById);

// prk catatan
router.get("/:id/catatan", prkCatatanController.getPrkCatatan);
router.post("/:id/catatan/baru", prkValidation.validatePrkCatatan, prkCatatanController.storePrkCatatan);

module.exports = router;
