import { pool } from '../config/db.js'; // Notice the .js extension!

export const createPerson = async (req, res) => {
    const { name } = req.body;
    try {
        const result = await pool.query('INSERT INTO persons (name) VALUES ($1) RETURNING *', [name]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getPersons = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM persons ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};