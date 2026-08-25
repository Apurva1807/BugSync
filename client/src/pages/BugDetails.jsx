import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function BugDetails() {
  const { id } = useParams();

  const [bug, setBug] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [solutionText, setSolutionText] = useState("");
  const [solutionCode, setSolutionCode] = useState("");
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchBug();
    fetchSolutions();
  }, [id]);

  const fetchBug = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/bugs/${id}`
      );

      const data = await response.json();
      setBug(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSolutions = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/solutions/${id}`
      );

      const data = await response.json();
      setSolutions(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSolution = async (e) => {
    e.preventDefault();

    if (!user) {
      setMessage("Please login to add a solution");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/solutions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bug_id: id,
            user_id: user.id,
            solution_text: solutionText,
            code: solutionCode,
          }),
        }
      );

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        setSolutionText("");
        setSolutionCode("");
        fetchSolutions();
      }
    } catch (error) {
      console.log(error);
      setMessage("Something went wrong");
    }
  };

  const handleAccept = async (solutionId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/solutions/${solutionId}/accept`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      alert(data.message);

      if (response.ok) {
        fetchBug();
        fetchSolutions();
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (!bug) {
    return <p className="loading-text">Loading...</p>;
  }

  return (
    <div className="page-container">

      <Link to="/" className="back-link">
        ← Back to Community
      </Link>

      <div className="details-card">

        <h1 className="details-title">
          {bug.title}
        </h1>

        <div className="bug-meta">

          <span className="tag">
            {bug.language}
          </span>

          <span
            className={
              bug.status === "SOLVED"
                ? "tag status-solved"
                : "tag status-open"
            }
          >
            {bug.status}
          </span>

          <span className="tag">
            Posted by {bug.name}
          </span>

        </div>

        <div className="details-section">

          <h3>Description</h3>

          <p className="details-text">
            {bug.description}
          </p>

        </div>

        <div className="details-section">

          <h3>Code</h3>

          <pre className="code-block">
            <code>{bug.code}</code>
          </pre>

        </div>

        <div className="details-section">

          <h3>Error Message</h3>

          <div className="error-box">
            {bug.error_message || "No error message provided"}
          </div>

        </div>

        <div className="details-section">

          <h3>Expected Output</h3>

          <div className="output-box">
            {bug.expected_output || "No expected output provided"}
          </div>

        </div>

      </div>

      <div className="solution-section">

        <h2>Add a Solution</h2>

        <p className="form-subtitle">
          Explain the issue and provide corrected code if needed.
        </p>

        {!user ? (
          <p className="message">
            Please login to add a solution.
          </p>
        ) : (
          <form
            onSubmit={handleSolution}
            className="general-form solution-form"
          >

            <label>Solution Explanation</label>

            <textarea
              placeholder="Explain how the bug can be fixed..."
              value={solutionText}
              onChange={(e) =>
                setSolutionText(e.target.value)
              }
              required
            />

            <label>Corrected Code</label>

            <textarea
              placeholder="Paste corrected code here..."
              value={solutionCode}
              onChange={(e) =>
                setSolutionCode(e.target.value)
              }
            />

            <button
              type="submit"
              className="primary-btn"
            >
              Submit Solution
            </button>

          </form>
        )}

        {message && (
          <p className="message">
            {message}
          </p>
        )}

      </div>

      <div className="solutions-wrapper">

        <h2>Community Solutions</h2>

        {solutions.length === 0 ? (
          <p className="empty-text">
            No solutions yet. Be the first to help.
          </p>
        ) : (
          solutions.map((solution) => (
            <div
              key={solution.id}
              className={
                solution.is_accepted === 1
                  ? "solution-card accepted-solution"
                  : "solution-card"
              }
            >

              <div className="solution-header">

                <strong>
                  {solution.name}
                </strong>

                {solution.is_accepted === 1 && (
                  <span className="accepted-label">
                    ✓ Accepted Solution
                  </span>
                )}

              </div>

              <p className="solution-text">
                {solution.solution_text}
              </p>

              {solution.code && (
                <pre className="code-block">
                  <code>
                    {solution.code}
                  </code>
                </pre>
              )}

              {bug.status === "OPEN" &&
                bug.user_id === user?.id && (
                  <button
                    className="success-btn"
                    onClick={() =>
                      handleAccept(solution.id)
                    }
                  >
                    Accept Solution
                  </button>
                )}

            </div>
          ))
        )}

      </div>

    </div>
  );
}

export default BugDetails;