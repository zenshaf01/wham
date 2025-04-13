import express from 'express';

const router = express.Router();

//Health Check Route
router.get('/health-check', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

export default router;