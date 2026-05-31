import { Router } from 'express';
import { toggleFavoriteRider, getFavoriteRiders } from '../controllers/favorite.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all routes with auth middleware
router.use(authenticate);

router.post('/toggle', toggleFavoriteRider);
router.get('/', getFavoriteRiders);

export { router as favoriteRouter };
