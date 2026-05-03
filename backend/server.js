import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './config/db.js';

import personRoutes from './routes/personRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/persons', personRoutes);
app.use('/api/tasks', taskRoutes);

// Start server & Initialize DB
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await initDB();
});