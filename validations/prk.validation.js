const { body } = require('express-validator');

module.exports = {
  validatePrk: [
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
  validatePrkJasa: [
    body("nama_jasa")
      .notEmpty().withMessage("Nama Jasa tidak boleh kosong"),
    body("harga")
      .notEmpty().withMessage("Nominal tidak boleh kosong")
      .customSanitizer(value => {
        return parseFloat(value.toString().replace(/\./g, '').replace(/\,/g, '.')); // remove commas and convert to float
      })
      .isNumeric().withMessage('Nominal harus berupa angka'),
  ],
  validatePrkMaterial: [
    body("material_id")
      .notEmpty().withMessage("Material tidak boleh kosong"),
    body("harga")
      .notEmpty().withMessage("Harga tidak boleh kosong")
      .customSanitizer(value => {
        return parseFloat(value.toString().replace(/\./g, '').replace(/\,/g, '.')); // remove commas and convert to float
      })
      .isFloat({min: 1}).withMessage('Harga tidak valid'),
    body("jumlah")
      .notEmpty().withMessage("Jumlah tidak boleh kosong")
      .customSanitizer(value => {
        return parseFloat(value.toString().replace(/\./g, '').replace(/\,/g, '.')); // remove commas and convert to float
      })
      .isFloat({min: 1}).withMessage('Jumlah tidak valid'),
  ],
  validatePrkCatatan: [
    body("catatan")
      .notEmpty().withMessage("Catatan tidak boleh kosong")
  ]
}