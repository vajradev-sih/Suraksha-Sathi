import { Router } from 'express';
import {
  createHazardCategory,
  getAllHazardCategories,
  getHazardCategoryById,
  updateHazardCategory,
  deleteHazardCategory
} from '../controllers/hazardCategory.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', verifyJWT, createHazardCategory);
router.get('/', verifyJWT, getAllHazardCategories);
router.get('/:id', verifyJWT, getHazardCategoryById);
router.put('/:id', verifyJWT, updateHazardCategory);
router.delete('/:id', verifyJWT, deleteHazardCategory);

export default router;
