const express = require("express");
const router = express.Router();

const skkiController = require("../controllers/skki.controller");
const skkiPrkController = require("../controllers/skki-prk.controller");
const skkiJasaController = require("../controllers/skki-jasa.controller");
const skkiMaterialController = require("../controllers/skki-material.controller");
const skkiLampiranController = require("../controllers/skki-lampiran.controller");
const skkiCatatanController = require("../controllers/skki-catatan.controller");

// skki
router.get("/", skkiController.getSkki);
router.get("/:id", skkiController.getSkkiById);

// skki prk
router.get("/:id/prk", skkiPrkController.getSkkiPrk);

// skki jasa
router.get("/:id/jasa", skkiJasaController.getSkkiJasa);

// skki material
router.get("/:id/material", skkiMaterialController.getSkkiMaterial);

// skki lampiran
router.get("/:id/lampiran", skkiLampiranController.getSkkiLampiran);

// skki catatan
router.get("/:id/catatan", skkiCatatanController.getSkkiCatatan);

module.exports = router;
