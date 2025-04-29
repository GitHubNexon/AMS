const express = require('express');
const {upload, FileAttachments} = require('../controller/FileAttachmentsController');
const { authenticateToken } = require("../controller/authController");

const router = express.Router();

router.get('/:id', authenticateToken, FileAttachments.get);

router.post('/:id', authenticateToken, upload, FileAttachments.upload);

router.post('/', authenticateToken, FileAttachments.delete);

router.post('/download/file', authenticateToken, FileAttachments.download)
// router.post('/download/file', (req, res)=>{
//     console.log(req.body);
//     res.json("test");
// });

module.exports = router;