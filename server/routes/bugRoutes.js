const express = require("express");
const db = require("../config/db");

const verifyToken = require(
  "../middleware/authMiddleware"
);

const router = express.Router();

// =========================
// POST BUG - JWT PROTECTED
// =========================

router.post(
  "/",
  verifyToken,
  (req, res) => {
    const {
      title,
      description,
      language,
      code,
      error_message,
      expected_output,
    } = req.body;

    // Actual logged-in user ID
    // comes from JWT token
    const user_id =
      req.user.id;

    if (
      !title ||
      !description
    ) {
      return res.status(400).json({
        message:
          "Title and description are required",
      });
    }

    const sql = `
      INSERT INTO bugs
      (
        user_id,
        title,
        description,
        language,
        code,
        error_message,
        expected_output
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        user_id,
        title,
        description,
        language || "",
        code || "",
        error_message || "",
        expected_output || "",
      ],
      (err, result) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            message:
              "Unable to post bug",
          });
        }

        return res.status(201).json({
          message:
            "Bug posted successfully",
          bugId:
            result.insertId,
        });
      }
    );
  }
);

// =========================
// GET ALL BUGS
// =========================

router.get("/", (req, res) => {
  const sql = `
    SELECT
      bugs.*,
      users.name
    FROM bugs
    JOIN users
      ON bugs.user_id = users.id
    ORDER BY bugs.created_at DESC
  `;

  db.query(
    sql,
    (err, results) => {
      if (err) {
        console.log(err);

        return res.status(500).json({
          message:
            "Unable to fetch bugs",
        });
      }

      return res.json(
        results
      );
    }
  );
});

// =========================
// GET SINGLE BUG
// =========================

router.get(
  "/:id",
  (req, res) => {
    const { id } =
      req.params;

    // Invalid ID format
    if (
      !/^\d+$/.test(id)
    ) {
      return res.status(400).json({
        message:
          "Invalid bug ID",
      });
    }

    const sql = `
      SELECT
        bugs.*,
        users.name
      FROM bugs
      JOIN users
        ON bugs.user_id = users.id
      WHERE bugs.id = ?
    `;

    db.query(
      sql,
      [id],
      (err, results) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            message:
              "Unable to fetch bug",
          });
        }

        if (
          results.length === 0
        ) {
          return res.status(404).json({
            message:
              "Bug not found",
          });
        }

        return res.json(
          results[0]
        );
      }
    );
  }
);

module.exports = router;