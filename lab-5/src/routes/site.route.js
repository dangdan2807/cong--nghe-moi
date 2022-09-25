const express = require('express');
const siteController = require('../app/controllers/site.controller');
const router = express.Router();
const multer = require('multer');

const upload = multer();

router.post('/delete', upload.fields([]), siteController.deleteById);
router.post('/:ma_sp', upload.fields([]), siteController.updateById);
router.get('/:ma_sp', siteController.getById);
router.post('/', upload.fields([]), siteController.save);
router.get('/', siteController.home);

module.exports = router;
