const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Create a bug
router.post("/", (req, res) => {
    const {
        user_id,
        title,
        description,
        language,
        code,
        error_message,
        expected_output
    } = req.body;

    const sql = `
        INSERT INTO bugs
        (user_id, title, description, language, code, error_message, expected_output)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            user_id,
            title,
            description,
            language,
            code,
            error_message,
            expected_output
        ],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: "Failed to post bug"
                });
            }

            res.json({
                message: "Bug posted successfully"
            });
        }
    );
});

// Get all bugs
router.get("/", (req, res) => {
    const sql = `
        SELECT bugs.*, users.name
        FROM bugs
        JOIN users ON bugs.user_id = users.id
        ORDER BY bugs.created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Failed to fetch bugs"
            });
        }

        res.json(results);
    });
});
// Get one bug by id
router.get("/:id", (req, res) => {
    const bugId = req.params.id;

    const sql = `
        SELECT bugs.*, users.name
        FROM bugs
        JOIN users ON bugs.user_id = users.id
        WHERE bugs.id = ?
    `;

    db.query(sql, [bugId], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Failed to fetch bug"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Bug not found"
            });
        }

        res.json(results[0]);
    });
});
module.exports = router;