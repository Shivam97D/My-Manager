const express = require('express');
const router  = express.Router();

const { getBuckets, createBucket, updateBucket, deleteBucket } = require('../controllers/bucketController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/',     getBuckets);
router.post('/',    createBucket);
router.put('/:id',  updateBucket);
router.delete('/:id', deleteBucket);

module.exports = router;
