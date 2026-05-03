import express from 'express';
import { createPerson, getPersons } from '../controllers/personController.js';

const router = express.Router();

router.post('/', createPerson);
router.get('/', getPersons);

export default router;