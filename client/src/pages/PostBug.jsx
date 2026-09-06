import {
  useState,
} from "react";

import {
  useNavigate,
  Link,
} from "react-router-dom";

function PostBug() {
  const navigate =
    useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const token =
    localStorage.getItem("token");

  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    language,
    setLanguage,
  ] = useState("Java");

  const [code, setCode] =
    useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    expectedOutput,
    setExpectedOutput,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  // =========================
  // POST BUG
  // =========================

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setMessage("");

      if (
        !user ||
        !token
      ) {
        setMessage(
          "Please login to post a bug."
        );

        return;
      }

      if (
        !title.trim() ||
        !description.trim()
      ) {
        setMessage(
          "Title and description are required."
        );

        return;
      }

      try {
        setLoading(true);

        const response =
          await fetch(
            "http://localhost:5000/api/bugs",
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
                  title:
                    title.trim(),

                  description:
                    description.trim(),

                  language,

                  code,

                  error_message:
                    errorMessage,

                  expected_output:
                    expectedOutput,
                }),
            }
          );

        const data =
          await response.json();

        // JWT invalid / expired
        if (
          response.status ===
          401
        ) {
          localStorage.removeItem(
            "token"
          );

          setMessage(
            "Your session expired. Please login again."
          );

          return;
        }

        if (
          response.ok
        ) {
          setMessage(
            "Bug posted successfully!"
          );

          // Open newly created bug
          if (data.bugId) {
            navigate(
              `/bugs/${data.bugId}`
            );
          } else {
            navigate(
              "/community"
            );
          }
        } else {
          setMessage(
            data.message ||
              "Unable to post bug."
          );
        }
      } catch (error) {
        console.log(error);

        setMessage(
          "Unable to connect to server."
        );
      } finally {
        setLoading(false);
      }
    };

  // =========================
  // LOGGED OUT UI
  // =========================

  if (
    !user ||
    !token
  ) {
    return (
      <div className="page-container">

        <div className="general-form">

          <h2>
            Post a Bug
          </h2>

          <p className="message">
            Please login to post a bug.
          </p>

          <button
            className="primary-btn"
            onClick={() =>
              navigate(
                "/login"
              )
            }
          >
            Go to Login
          </button>

          <Link
            to="/community"
            className="back-link"
          >
            ← Back to Community
          </Link>

        </div>

      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="page-container">

      <Link
        to="/community"
        className="back-link"
      >
        ← Back to Community
      </Link>

      <div className="general-form">

        <h2>
          Post a Programming Bug
        </h2>

        <p className="form-subtitle">
          Describe the issue clearly so other developers can help you debug it.
        </p>

        <form
          onSubmit={
            handleSubmit
          }
        >

          <label>
            Bug Title
          </label>

          <input
            type="text"
            placeholder="Example: Array index error in Java"
            value={
              title
            }
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
            required
          />

          <label>
            Description
          </label>

          <textarea
            placeholder="Explain what your program is supposed to do and what is going wrong..."
            value={
              description
            }
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            required
          />

          <label>
            Programming Language
          </label>

          <select
            value={
              language
            }
            onChange={(e) =>
              setLanguage(
                e.target.value
              )
            }
          >

            <option value="Java">
              Java
            </option>

            <option value="Python">
              Python
            </option>

            <option value="JavaScript">
              JavaScript
            </option>

            <option value="C++">
              C++
            </option>

            <option value="C">
              C
            </option>

          </select>

          <label>
            Buggy Code
          </label>

          <textarea
            placeholder="Paste your code here..."
            value={
              code
            }
            onChange={(e) =>
              setCode(
                e.target.value
              )
            }
          />

          <label>
            Error Message
          </label>

          <textarea
            placeholder="Paste the error message here, if any..."
            value={
              errorMessage
            }
            onChange={(e) =>
              setErrorMessage(
                e.target.value
              )
            }
          />

          <label>
            Expected Output
          </label>

          <textarea
            placeholder="What output did you expect?"
            value={
              expectedOutput
            }
            onChange={(e) =>
              setExpectedOutput(
                e.target.value
              )
            }
          />

          <button
            type="submit"
            className="primary-btn"
            disabled={
              loading
            }
          >
            {loading
              ? "Posting..."
              : "Post Bug"}
          </button>

        </form>

        {message && (
          <p className="message">
            {message}
          </p>
        )}

      </div>

    </div>
  );
}

export default PostBug;