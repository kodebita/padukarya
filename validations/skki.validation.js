const { body } = require('express-validator');

module.exports = {
  validateSkki: [
    body("tahun")
      .notEmpty().withMessage("Tahun tidak boleh kosong")
      .isNumeric().withMessage('Tahun harus berupa angka'),
    body("basket")
      .notEmpty().withMessage("Basket tidak boleh kosong")
      .isNumeric().withMessage('Basket harus berupa angka')
      .isIn([1, 2, 3]).withMessage('Basket harus 1, 2,  atau 3'),
    body("nama_project").notEmpty().withMessage("Nama Project tidak boleh kosong"),
    body("nomor_skki").notEmpty().withMessage("Nomor SKKI tidak boleh kosong"),
    // body("nomor_prk_skki").notEmpty().withMessage("Nomor PRK-SKKI tidak boleh kosong"),
    body("nomor_wbs_jasa").notEmpty().withMessage("Nomor WBS Jasa tidak boleh kosong"),
    body("nomor_wbs_material").notEmpty().withMessage("Nomor WBS Material tidak boleh kosong"),
    body("type")
      .notEmpty().withMessage("Tipe tidak boleh kosong")
      .isIn(['murni', 'turunan']).withMessage('Tipe harus murni atau turunan'),
  ],
  validateSkkiCatatan: [
    body("catatan")
      .notEmpty().withMessage("Catatan tidak boleh kosong")
  ],
  validateSkkiPrk: [
    body("prk_id")
      .notEmpty().withMessage("PRK tidak boleh kosong")
  ],
  validatePrkMaterial: [
    body("prk_id")
      .notEmpty().withMessage("PRK tidak boleh kosong"),
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
  validatePrkJasa: [
    body("prk_id")
      .notEmpty().withMessage("PRK tidak boleh kosong"),
    body("nama_jasa")
      .notEmpty().withMessage("Nama Jasa tidak boleh kosong"),
    body("harga")
      .notEmpty().withMessage("Nominal tidak boleh kosong")
      .customSanitizer(value => {
        return parseFloat(value.replace(/,/g, '')); // remove commas and convert to float
      })
      .isNumeric().withMessage('Nominal harus berupa angka'),
  ],
}