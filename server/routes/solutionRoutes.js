const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Add solution
router.post("/", (req, res) => {
    const { bug_id, user_id, solution_text, code } = req.body;

    const sql = `
        INSERT INTO solutions
        (bug_id, user_id, solution_text, code)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [bug_id, user_id, solution_text, code],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: "Failed to add solution"
                });
            }

            res.json({
                message: "Solution added successfully"
            });
        }
    );
});

// Get solutions for one bug
router.get("/:bugId", (req, res) => {
    const bugId = req.params.bugId;

    const sql = `
        SELECT solutions.*, users.name
        FROM solutions
        JOIN users ON solutions.user_id = users.id
        WHERE solutions.bug_id = ?
        ORDER BY solutions.created_at DESC
    `;

    db.query(sql, [bugId], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Failed to fetch solutions"
            });
        }

        res.json(results);
    });
});
router.put("/:solutionId/accept", (req, res) => {

    const solutionId = req.params.solutionId;

    const findSql =
        "SELECT bug_id FROM solutions WHERE id = ?";

    db.query(findSql, [solutionId], (err, results) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                message: "Failed to accept solution"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Solution not found"
            });
        }

        const bugId = results[0].bug_id;

        const acceptSql =
            "UPDATE solutions SET is_accepted = TRUE WHERE id = ?";

        db.query(
            acceptSql,
            [solutionId],
            (err) => {

                if (err) {
                    console.log(err);

                    return res.status(500).json({
                        message: "Failed to accept solution"
                    });
                }

                const bugSql =
                    "UPDATE bugs SET status = 'SOLVED' WHERE id = ?";

                db.query(
                    bugSql,
                    [bugId],
                    (err) => {

                        if (err) {
                            console.log(err);

                            return res.status(500).json({
                                message: "Failed to update bug"
                            });
                        }

                        res.json({
                            message: "Solution accepted successfully"
                        });
                    }
                );
            }
        );
    });
});
router.put("/:solutionId/accept", (req, res) => {

    const solutionId = req.params.solutionId;

    // Step 1: Find which bug this solution belongs to
    const findSql =
        "SELECT bug_id FROM solutions WHERE id = ?";

    db.query(findSql, [solutionId], (err, results) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                message: "Failed to accept solution"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Solution not found"
            });
        }

        const bugId = results[0].bug_id;

        // Step 2: Remove previous accepted solution
        const resetSql =
            "UPDATE solutions SET is_accepted = FALSE WHERE bug_id = ?";

        db.query(resetSql, [bugId], (err) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    message: "Failed to update solutions"
                });
            }

            // Step 3: Accept selected solution
            const acceptSql =
                "UPDATE solutions SET is_accepted = TRUE WHERE id = ?";

            db.query(acceptSql, [solutionId], (err) => {

                if (err) {
                    console.log(err);

                    return res.status(500).json({
                        message: "Failed to accept solution"
                    });
                }

                // Step 4: Change bug status to SOLVED
                const bugSql =
                    "UPDATE bugs SET status = 'SOLVED' WHERE id = ?";

                db.query(bugSql, [bugId], (err) => {

                    if (err) {
                        console.log(err);

                        return res.status(500).json({
                            message: "Failed to update bug status"
                        });
                    }

                    res.json({
                        message: "Solution accepted successfully"
                    });
                });
            });
        });
    });
});
module.exports = router;