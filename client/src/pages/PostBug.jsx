import { useState } from "react";

function PostBug() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setMessage("Please login to post a bug");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/bugs", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          user_id: user.id,
          title,
          description,
          language,
          code,
          error_message: errorMessage,
          expected_output: expectedOutput,
        }),
      });

      const data = await response.json();

      setMessage(data.message);

      if (response.ok) {
        setTitle("");
        setDescription("");
        setLanguage("");
        setCode("");
        setErrorMessage("");
        setExpectedOutput("");
      }
    } catch (error) {
      console.log(error);
      setMessage("Something went wrong");
    }
  };

  return (
    <div className="page-container">

      <div className="general-form">

        <h2>Post a Bug</h2>

        <p className="form-subtitle">
          Share your issue clearly so the community can help you debug it.
        </p>

        <form onSubmit={handleSubmit}>

          <label>Bug Title</label>

          <input
            type="text"
            placeholder="Example: ArrayIndexOutOfBoundsException in Java"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label>Description</label>

          <textarea
            placeholder="Explain what your code is supposed to do..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <label>Programming Language</label>

          <input
            type="text"
            placeholder="Example: Java"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            required
          />

          <label>Your Code</label>

          <textarea
            placeholder="Paste your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <label>Error Message</label>

          <textarea
            placeholder="Paste the error message here..."
            value={errorMessage}
            onChange={(e) => setErrorMessage(e.target.value)}
          />

          <label>Expected Output</label>

          <textarea
            placeholder="What output were you expecting?"
            value={expectedOutput}
            onChange={(e) => setExpectedOutput(e.target.value)}
          />

          <button
            type="submit"
            className="primary-btn"
          >
            Post Bug
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