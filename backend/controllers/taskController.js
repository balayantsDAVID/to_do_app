import { pool } from '../config/db.js';

export const createTask = async (req, res) => {
    const { description, person_id } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO tasks (description, person_id) VALUES ($1, $2) RETURNING *',
            [description, person_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getTasks = async (req, res) => {
    try {
        const query = `
            SELECT tasks.id, tasks.description, persons.name AS person_name 
            FROM tasks 
            JOIN persons ON tasks.person_id = persons.id 
            ORDER BY tasks.id DESC
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// NEW: Delete Task function
export const deleteTask = async (req, res) => {
    const { id } = req.params; // Get the ID from the URL
    try {
        const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json({ message: "Task deleted successfully", deletedTask: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};