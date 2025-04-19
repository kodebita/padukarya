const { body } = require('express-validator');

module.exports = {
  validateKontrak: [
    body("tahun")
      .notEmpty().withMessage("Tahun tidak boleh kosong")
      .isNumeric().withMessage('Tahun harus berupa angka'),
    body("basket")
      .notEmpty().withMessage("Basket tidak boleh kosong")
      .isNumeric().withMessage('Basket harus berupa angka')
      .isIn([1, 2, 3]).withMessage('Basket harus 1, 2,  atau 3'),
    body("pengadaan_id")
      .notEmpty().withMessage("Pengadaan tidak boleh kosong"),
    body("nomor_kontrak")
      .notEmpty().withMessage("Nomor kontrak tidak boleh kosong"),
    body("tanggal_kontrak")
      .notEmpty().withMessage("Tanggal kontrak tidak boleh kosong"),
    body("tanggal_awal")
      .notEmpty().withMessage("Tanggal awal tidak boleh kosong"),
    body("tanggal_akhir")
      .notEmpty().withMessage("Tanggal akhir tidak boleh kosong"),
    body("pelaksana")
      .notEmpty().withMessage("Pelaksana tidak boleh kosong"),
    body("direksi")
      .notEmpty().withMessage("Direksi tidak boleh kosong")
      .isIn([
        'perencanaan',
        'konstruksi',
        'jaringan',
        'traksaksi_energi',
        'niaga',
        'pemasaran',
        'keuangan_dan_umum',
        'k3l'
      ]).withMessage('Direksi tidak valid'),
    body("type")
      .notEmpty().withMessage("Tipe tidak boleh kosong")
      .isIn(['murni', 'turunan']).withMessage('Tipe harus murni atau turunan'),
  ],
  validateKontrakUpdate: [
    body("tahun")
      .notEmpty().withMessage("Tahun tidak boleh kosong")
      .isNumeric().withMessage('Tahun harus berupa angka'),
    body("basket")
      .notEmpty().withMessage("Basket tidak boleh kosong")
      .isNumeric().withMessage('Basket harus berupa angka')
      .isIn([1, 2, 3]).withMessage('Basket harus 1, 2,  atau 3'),
    body("nomor_kontrak")
      .notEmpty().withMessage("Nomor kontrak tidak boleh kosong"),
    body("tanggal_kontrak")
      .notEmpty().withMessage("Tanggal kontrak tidak boleh kosong"),
    body("tanggal_awal")
      .notEmpty().withMessage("Tanggal awal tidak boleh kosong"),
    body("tanggal_akhir")
      .notEmpty().withMessage("Tanggal akhir tidak boleh kosong"),
    body("pelaksana")
      .notEmpty().withMessage("Pelaksana tidak boleh kosong"),
    body("direksi")
      .notEmpty().withMessage("Direksi tidak boleh kosong")
      .isIn([
        'perencanaan',
        'konstruksi',
        'jaringan',
        'traksaksi_energi',
        'niaga',
        'pemasaran',
        'keuangan_dan_umum',
        'k3l'
      ]).withMessage('Direksi tidak valid'),
    body("type")
      .notEmpty().withMessage("Tipe tidak boleh kosong")
      .isIn(['murni', 'turunan']).withMessage('Tipe harus murni atau turunan'),
  ],
  validateKontrakCatatan: [
    body("catatan")
      .notEmpty().withMessage("Catatan tidak boleh kosong")
  ],
  validateKontrakAmandemen: [
    body("versi_amandemen")
      .notEmpty().withMessage("Versi Amandemen tidak boleh kosong")
  ],
  validatePengadaanMaterial: [
    body("prk_material_id")
      .notEmpty().withMessage("PRK Material tidak boleh kosong"),
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
  validatePengadaanMaterialUpdate: [
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
  validatePengadaanJasa: [
    body("prk_jasa_id")
      .notEmpty().withMessage("PRK Jasa tidak boleh kosong"),
    body("nama_jasa")
      .notEmpty().withMessage("Nama Jasa tidak boleh kosong"),
    body("harga")
      .notEmpty().withMessage("Nominal tidak boleh kosong")
      .customSanitizer(value => {
        return parseFloat(value.toString().replace(/\./g, '').replace(/\,/g, '.')); // remove commas and convert to float
      })
      .isNumeric().withMessage('Nominal harus berupa angka'),
  ],
  validatePengadaanJasaUpdate: [
    body("nama_jasa")
      .notEmpty().withMessage("Nama Jasa tidak boleh kosong"),
    body("harga")
      .notEmpty().withMessage("Nominal tidak boleh kosong")
      .customSanitizer(value => {
        return parseFloat(value.toString().replace(/\./g, '').replace(/\,/g, '.')); // remove commas and convert to float
      })
      .isNumeric().withMessage('Nominal harus berupa angka'),
  ],
}