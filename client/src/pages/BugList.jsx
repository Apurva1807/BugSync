import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function BugList() {
  const [bugs, setBugs] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/bugs")
      .then((response) => response.json())
      .then((data) => {
        setBugs(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <div className="page-container">

      <h1 className="page-title">
        BugSync Community
      </h1>

      <p className="page-subtitle">
        Explore programming bugs, share solutions, and learn together.
      </p>

      {bugs.length === 0 ? (
        <p>No bugs posted yet.</p>
      ) : (
        bugs.map((bug) => (
          <div className="bug-card" key={bug.id}>

            <h2 className="bug-title">
              <Link to={`/bugs/${bug.id}`}>
                {bug.title}
              </Link>
            </h2>

            <p className="bug-description">
              {bug.description}
            </p>

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

          </div>
        ))
      )}

    </div>
  );
}

export default BugList;