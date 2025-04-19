const express = require("express");
const router = express.Router();

const kontrakController = require("../controllers/kontrak.controller");
const kontrakAmandemenController = require("../controllers/kontrak-amandemen.controller");
const kontrakPrkController = require("../controllers/kontrak-prk.controller");
const kontrakJasaController = require("../controllers/kontrak-jasa.controller");
const kontrakMaterialController = require("../controllers/kontrak-material.controller");
const kontrakLampiranController = require("../controllers/kontrak-lampiran.controller");
const kontrakCatatanController = require("../controllers/kontrak-catatan.controller");

const kontrakValidation = require("../validations/kontrak.validation");

router.get("/", kontrakController.getKontrak);
router.get("/baru", kontrakController.createKontrak);
router.post("/baru", kontrakValidation.validateKontrak, kontrakController.storeKontrak);
router.get("/:id", kontrakController.getKontrakById);
router.post("/:id", kontrakValidation.validateKontrakUpdate, kontrakController.updateKontrakById);
router.get("/:id/hapus", kontrakController.deleteKontrakById);

router.get('/:id/amandemen', kontrakAmandemenController.createKontrakAmandemen);
router.post('/:id/amandemen', kontrakValidation.validateKontrakAmandemen, kontrakAmandemenController.storeKontrakAmandemen);
router.get('/:id/amandemen/batal', kontrakAmandemenController.cancelKontrakAmandemen);
router.get('/:id/amandemen/selesai', kontrakAmandemenController.doneKontrakAmandemen);

router.get("/:id/prk", kontrakPrkController.getKontrakPrk);

router.get("/:id/jasa", kontrakJasaController.getKontrakJasa);
router.get("/:id/jasa/baru", kontrakJasaController.createKontrakJasa);
router.post("/:id/jasa/baru", kontrakValidation.validateKontrakJasa, kontrakJasaController.storeKontrakJasa);
router.get("/:id/jasa/:jasaId", kontrakJasaController.getKontrakJasaById);
router.post("/:id/jasa/:jasaId", kontrakValidation.validateKontrakJasa, kontrakJasaController.updateKontrakJasaById);
router.get("/:id/jasa/:jasaId/hapus", kontrakJasaController.deleteKontrakById);

router.get("/:id/material", kontrakMaterialController.getKontrakMaterial);

router.get("/:id/lampiran", kontrakLampiranController.getKontrakLampiran);
router.get("/:id/lampiran/baru", kontrakLampiranController.createKontrakLampiran);
router.post("/:id/lampiran/baru", kontrakLampiranController.storeKontrakLampiran);
router.get("/:id/lampiran/:lampiranId/hapus", kontrakLampiranController.deleteKontrakLampiranById);

router.get("/:id/catatan", kontrakCatatanController.getKontrakCatatan);
router.post("/:id/catatan/baru", kontrakValidation.validateKontrakCatatan, kontrakCatatanController.storeKontrakCatatan);

module.exports = router;
