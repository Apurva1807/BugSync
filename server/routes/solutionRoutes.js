const express = require("express");
const db = require("../config/db");

const verifyToken = require(
  "../middleware/authMiddleware"
);

const router = express.Router();

// =========================
// ADD SOLUTION
// =========================

router.post(
  "/",
  verifyToken,
  (req, res) => {
    const {
      bug_id,
      solution_text,
      code,
    } = req.body;

    const user_id = req.user.id;

    if (
      !bug_id ||
      !solution_text
    ) {
      return res.status(400).json({
        message:
          "Bug ID and solution explanation are required",
      });
    }

    // First check whether bug exists
    // and whether it is still OPEN
    db.query(
      `
      SELECT id, status
      FROM bugs
      WHERE id = ?
      `,
      [bug_id],
      (bugErr, bugResults) => {
        if (bugErr) {
          console.log(bugErr);

          return res.status(500).json({
            message:
              "Unable to verify bug",
          });
        }

        if (
          bugResults.length === 0
        ) {
          return res.status(404).json({
            message:
              "Bug not found",
          });
        }

        if (
          bugResults[0].status ===
          "SOLVED"
        ) {
          return res.status(400).json({
            message:
              "This bug is already solved. New solutions are not allowed.",
          });
        }

        const sql = `
          INSERT INTO solutions
          (
            bug_id,
            user_id,
            solution_text,
            code
          )
          VALUES (?, ?, ?, ?)
        `;

        db.query(
          sql,
          [
            bug_id,
            user_id,
            solution_text,
            code || "",
          ],
          (err) => {
            if (err) {
              console.log(err);

              return res.status(500).json({
                message:
                  "Unable to add solution",
              });
            }

            return res.status(201).json({
              message:
                "Solution submitted successfully",
            });
          }
        );
      }
    );
  }
);

// =========================
// GET SOLUTIONS
// =========================

router.get(
  "/:bugId",
  (req, res) => {
    const { bugId } =
      req.params;

    const sql = `
      SELECT
        solutions.*,
        users.name
      FROM solutions
      JOIN users
        ON solutions.user_id = users.id
      WHERE solutions.bug_id = ?
      ORDER BY
        solutions.is_accepted DESC,
        solutions.created_at DESC
    `;

    db.query(
      sql,
      [bugId],
      (err, results) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            message:
              "Unable to fetch solutions",
          });
        }

        return res.json(
          results
        );
      }
    );
  }
);

// =========================
// ACCEPT SOLUTION
// =========================

router.put(
  "/:solutionId/accept",
  verifyToken,
  (req, res) => {
    const {
      solutionId,
    } = req.params;

    const findSql = `
      SELECT
        solutions.id AS solution_id,
        solutions.bug_id,
        bugs.user_id AS bug_owner_id,
        bugs.status
      FROM solutions
      JOIN bugs
        ON solutions.bug_id = bugs.id
      WHERE solutions.id = ?
    `;

    db.query(
      findSql,
      [solutionId],
      (findErr, results) => {
        if (findErr) {
          console.log(findErr);

          return res.status(500).json({
            message:
              "Database error",
          });
        }

        if (
          results.length === 0
        ) {
          return res.status(404).json({
            message:
              "Solution not found",
          });
        }

        const solution =
          results[0];

        // Only bug owner can accept
        if (
          solution.bug_owner_id !==
          req.user.id
        ) {
          return res.status(403).json({
            message:
              "Only the bug owner can accept a solution",
          });
        }

        // If already solved, don't accept another
        if (
          solution.status ===
          "SOLVED"
        ) {
          return res.status(400).json({
            message:
              "This bug is already solved",
          });
        }

        // Reset all accepted solutions
        db.query(
          `
          UPDATE solutions
          SET is_accepted = FALSE
          WHERE bug_id = ?
          `,
          [solution.bug_id],
          (resetErr) => {
            if (resetErr) {
              console.log(resetErr);

              return res.status(500).json({
                message:
                  "Unable to update solutions",
              });
            }

            // Accept selected solution
            db.query(
              `
              UPDATE solutions
              SET is_accepted = TRUE
              WHERE id = ?
              `,
              [solutionId],
              (acceptErr) => {
                if (acceptErr) {
                  console.log(
                    acceptErr
                  );

                  return res.status(500).json({
                    message:
                      "Unable to accept solution",
                  });
                }

                // Mark bug as solved
                db.query(
                  `
                  UPDATE bugs
                  SET status = 'SOLVED'
                  WHERE id = ?
                  `,
                  [solution.bug_id],
                  (bugErr) => {
                    if (bugErr) {
                      console.log(
                        bugErr
                      );

                      return res.status(500).json({
                        message:
                          "Solution accepted but bug status update failed",
                      });
                    }

                    return res.json({
                      message:
                        "Solution accepted and bug marked as SOLVED",
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  }
);

module.exports = router;