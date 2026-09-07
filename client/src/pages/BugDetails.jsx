import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";

import { API_URL } from "../config";

function BugDetails() {
  const { id } = useParams();

  const navigate =
    useNavigate();

  const [
    bug,
    setBug,
  ] = useState(null);

  const [
    solutions,
    setSolutions,
  ] = useState([]);

  const [
    solutionText,
    setSolutionText,
  ] = useState("");

  const [
    solutionCode,
    setSolutionCode,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const token =
    localStorage.getItem("token");

  useEffect(() => {
    fetchBug();
    fetchSolutions();
  }, [id]);

  // =========================
  // FETCH BUG
  // =========================

  const fetchBug =
    async () => {
      try {
        const response =
          await fetch(
            `${API_URL}/api/bugs/${id}`
          );

        const data =
          await response.json();

        if (
          response.ok
        ) {
          setBug(data);
        } else {
          setMessage(
            data.message ||
              "Unable to load bug."
          );
        }
      } catch (error) {
        console.log(error);

        setMessage(
          "Unable to connect to server."
        );
      }
    };

  // =========================
  // FETCH SOLUTIONS
  // =========================

  const fetchSolutions =
    async () => {
      try {
        const response =
          await fetch(
            `${API_URL}/api/solutions/${id}`
          );

        const data =
          await response.json();

        if (
          response.ok
        ) {
          setSolutions(data);
        }
      } catch (error) {
        console.log(error);
      }
    };

  // =========================
  // START LIVE DEBUG
  // =========================

  const startLiveDebug =
    () => {
      if (
        !user ||
        !token
      ) {
        setMessage(
          "Please login to start live debugging."
        );

        return;
      }

      if (
        bug.status ===
        "SOLVED"
      ) {
        setMessage(
          "This bug is already solved."
        );

        return;
      }

      const roomId =
        Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();

      navigate(
        `/live-room/${bug.id}/${roomId}`
      );
    };

  // =========================
  // SUBMIT SOLUTION
  // =========================

  const handleSolution =
    async (e) => {
      e.preventDefault();

      if (
        !user ||
        !token
      ) {
        setMessage(
          "Please login to add a solution."
        );

        return;
      }

      if (
        bug.status ===
        "SOLVED"
      ) {
        setMessage(
          "This bug is already solved."
        );

        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/api/solutions`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  bug_id:
                    id,

                  solution_text:
                    solutionText,

                  code:
                    solutionCode,
                }),
            }
          );

        const data =
          await response.json();

        setMessage(
          data.message
        );

        if (
          response.ok
        ) {
          setSolutionText("");
          setSolutionCode("");

          fetchSolutions();
        }

        if (
          response.status ===
          401
        ) {
          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          setMessage(
            "Session expired. Please login again."
          );
        }
      } catch (error) {
        console.log(error);

        setMessage(
          "Something went wrong."
        );
      }
    };

  // =========================
  // ACCEPT SOLUTION
  // =========================

  const handleAccept =
    async (solutionId) => {
      if (!token) {
        alert(
          "Please login again."
        );

        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/api/solutions/${solutionId}/accept`,
            {
              method:
                "PUT",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        alert(
          data.message
        );

        if (
          response.ok
        ) {
          fetchBug();
          fetchSolutions();
        }

        if (
          response.status ===
          401
        ) {
          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          alert(
            "Session expired. Please login again."
          );
        }
      } catch (error) {
        console.log(error);
      }
    };

  if (!bug) {
    return (
      <p className="loading-text">
        Loading...
      </p>
    );
  }

  return (
    <div className="page-container">

      <Link
        to="/community"
        className="back-link"
      >
        ← Back to Community
      </Link>

      {/* BUG DETAILS */}

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
              bug.status ===
              "SOLVED"
                ? "tag status-solved"
                : "tag status-open"
            }
          >
            {bug.status}
          </span>

          <span className="tag">
            Posted by{" "}
            {bug.name}
          </span>

        </div>

        {/* LIVE DEBUG ONLY FOR OPEN BUG */}

        {bug.status ===
          "OPEN" && (

          <div className="live-debug-action">

            <div>

              <h3>
                Need real-time help?
              </h3>

              <p>
                Start a live debugging room and collaborate with another developer.
              </p>

            </div>

            <button
              className="primary-btn"
              onClick={
                startLiveDebug
              }
            >
              Start Live Debug
            </button>

          </div>

        )}

        {/* SOLVED NOTICE */}

        {bug.status ===
          "SOLVED" && (

          <div className="solved-notice">

            <strong>
              ✓ This bug has been solved
            </strong>

            <p>
              New solutions and Live Debug sessions are disabled. You can still view the accepted solution below.
            </p>

          </div>

        )}

        <div className="details-section">

          <h3>
            Description
          </h3>

          <p className="details-text">
            {bug.description}
          </p>

        </div>

        <div className="details-section">

          <h3>
            Code
          </h3>

          <pre className="code-block">
            <code>
              {bug.code}
            </code>
          </pre>

        </div>

        <div className="details-section">

          <h3>
            Error Message
          </h3>

          <div className="error-box">
            {bug.error_message ||
              "No error message provided"}
          </div>

        </div>

        <div className="details-section">

          <h3>
            Expected Output
          </h3>

          <div className="output-box">
            {bug.expected_output ||
              "No expected output provided"}
          </div>

        </div>

      </div>

      {/* ADD SOLUTION ONLY FOR OPEN BUG */}

      {bug.status ===
      "OPEN" ? (

        <div className="solution-section">

          <h2>
            Add a Solution
          </h2>

          <p className="form-subtitle">
            Explain the issue and provide corrected code if needed.
          </p>

          {!user ? (

            <p className="message">
              Please login to add a solution.
            </p>

          ) : (

            <form
              onSubmit={
                handleSolution
              }
              className="general-form solution-form"
            >

              <label>
                Solution Explanation
              </label>

              <textarea
                placeholder="Explain how the bug can be fixed..."
                value={
                  solutionText
                }
                onChange={(e) =>
                  setSolutionText(
                    e.target.value
                  )
                }
                required
              />

              <label>
                Corrected Code
              </label>

              <textarea
                placeholder="Paste corrected code here..."
                value={
                  solutionCode
                }
                onChange={(e) =>
                  setSolutionCode(
                    e.target.value
                  )
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

      ) : (

        <div className="solution-section solved-readonly-section">

          <h2>
            Bug Resolved
          </h2>

          <p className="form-subtitle">
            This bug is read-only because an accepted solution has already resolved it.
          </p>

        </div>

      )}

      {/* COMMUNITY SOLUTIONS */}

      <div className="solutions-wrapper">

        <h2>
          Community Solutions
        </h2>

        {solutions.length ===
        0 ? (

          <p className="empty-text">
            No solutions available.
          </p>

        ) : (

          solutions.map(
            (solution) => (

              <div
                key={
                  solution.id
                }
                className={
                  solution.is_accepted ===
                  1
                    ? "solution-card accepted-solution"
                    : "solution-card"
                }
              >

                <div className="solution-header">

                  <strong>
                    {
                      solution.name
                    }
                  </strong>

                  {solution.is_accepted ===
                    1 && (

                    <span className="accepted-label">
                      ✓ Accepted Solution
                    </span>

                  )}

                </div>

                <p className="solution-text">
                  {
                    solution.solution_text
                  }
                </p>

                {solution.code && (

                  <pre className="code-block">
                    <code>
                      {
                        solution.code
                      }
                    </code>
                  </pre>

                )}

                {bug.status ===
                  "OPEN" &&
                  bug.user_id ===
                    user?.id && (

                    <button
                      className="success-btn"
                      onClick={() =>
                        handleAccept(
                          solution.id
                        )
                      }
                    >
                      Accept Solution
                    </button>

                  )}

              </div>

            )
          )

        )}

      </div>

    </div>
  );
}

export default BugDetails;