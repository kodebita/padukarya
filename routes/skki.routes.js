const express = require("express");
const router = express.Router();

const skkiController = require("../controllers/skki.controller");
const skkiPrkController = require("../controllers/skki-prk.controller");
const skkiJasaController = require("../controllers/skki-jasa.controller");
const skkiMaterialController = require("../controllers/skki-material.controller");
const skkiLampiranController = require("../controllers/skki-lampiran.controller");
const skkiCatatanController = require("../controllers/skki-catatan.controller");

const skkiValidation = require("../validations/skki.validation");

// skki
router.get("/", skkiController.getSkki);
router.get("/baru", skkiController.createSkki);
router.post("/baru", skkiValidation.validateSkki, skkiController.storeSkki);
router.get("/:id", skkiController.getSkkiById);
router.get("/:id/hapus", skkiController.deleteSkkiById);

// skki prk
router.get("/:id/prk", skkiPrkController.getSkkiPrk);
router.get("/:id/prk/baru", skkiPrkController.createSkkiPrk);
router.post("/:id/prk/baru", skkiValidation.validateSkkiPrk, skkiPrkController.storeSkkiPrk);
router.get("/:id/prk/:prkId/hapus", skkiPrkController.deleteSkkiPrk);

// skki jasa
router.get("/:id/jasa", skkiJasaController.getSkkiJasa);
router.get("/:id/jasa/baru", skkiJasaController.createSkkiJasa);
router.post("/:id/jasa/baru", skkiValidation.validatePrkJasa, skkiJasaController.storeSkkiJasa);
router.get("/:id/jasa/:jasaId", skkiJasaController.getSkkiJasaById);
router.post("/:id/jasa/:jasaId", skkiValidation.validatePrkJasa, skkiJasaController.updateSkkiJasaById);
router.get("/:id/jasa/:jasaId/hapus", skkiJasaController.deleteSkkiJasaById);

// skki material
router.get("/:id/material", skkiMaterialController.getSkkiMaterial);
router.get("/:id/material/baru", skkiMaterialController.createSkkiMaterial);
router.post("/:id/material/baru", skkiValidation.validatePrkMaterial, skkiMaterialController.storeSkkiMaterial);
router.get("/:id/material/:materialId", skkiMaterialController.getSkkiMaterialById);
router.post("/:id/material/:materialId", skkiValidation.validatePrkMaterial, skkiMaterialController.updateSkkiMaterialById);
router.get("/:id/material/:materialId/hapus", skkiMaterialController.deleteSkkiMaterialById);

// skki lampiran
router.get("/:id/lampiran", skkiLampiranController.getSkkiLampiran);
router.get("/:id/lampiran/baru", skkiLampiranController.createSkkiLampiran);
router.post("/:id/lampiran/baru", skkiLampiranController.storeSkkiLampiran);
router.get("/:id/lampiran/:lampiranId/hapus", skkiLampiranController.deleteSkkiLampiranById);

// skki catatan
router.get("/:id/catatan", skkiCatatanController.getSkkiCatatan);
router.post("/:id/catatan/baru", skkiValidation.validateSkkiCatatan, skkiCatatanController.storeSkkiCatatan);

module.exports = router;
