import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";

import { API_URL } from "../config";

const socket = io(API_URL);

function LiveRoom() {
  const { bugId, roomId: urlRoomId } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [roomId, setRoomId] = useState(urlRoomId || "");
  const [joinedRoom, setJoinedRoom] = useState(urlRoomId || "");

  const [bug, setBug] = useState(null);
  const [message, setMessage] = useState("");
  const [pageError, setPageError] = useState("");
  const [loadingBug, setLoadingBug] = useState(Boolean(bugId));

  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState("");

  const [connectedUsers, setConnectedUsers] = useState([]);

  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [customInput, setCustomInput] = useState("");
  const [executionResult, setExecutionResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const [solutionExplanation, setSolutionExplanation] =
    useState("");

  const [isSavingSolution, setIsSavingSolution] =
    useState(false);

  const [solutionSaved, setSolutionSaved] =
    useState(false);

  const chatBottomRef = useRef(null);
  const roomStateReceivedRef = useRef(false);

  // =========================
  // LOGIN PROTECTION
  // =========================

  useEffect(() => {
    if (!user || !token) {
      setPageError(
        "Please login to access Live Debug."
      );
    }
  }, []);

  // =========================
  // SOCKET CONNECTION
  // =========================

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    const handleConnect = () => {
      console.log(
        "Connected:",
        socket.id
      );

      if (urlRoomId) {
        socket.emit(
          "join-room",
          {
            roomId: urlRoomId,
            user,
          }
        );

        setRoomId(urlRoomId);
        setJoinedRoom(urlRoomId);
      }
    };

    const handleUserJoined = (
      userName
    ) => {
      setMessage(
        `${userName} joined the room.`
      );
    };

    const handleCodeUpdate = (
      updatedCode
    ) => {
      setCode(updatedCode);
    };

    const handleLanguageUpdate = (
      updatedLanguage
    ) => {
      setLanguage(
        updatedLanguage
      );
    };

    const handleRoomUsers = (
      users
    ) => {
      setConnectedUsers(users);
    };

    const handleReceiveMessage = (
      chatData
    ) => {
      setMessages(
        (previous) => [
          ...previous,
          chatData,
        ]
      );
    };

    const handleOutputUpdate = (
      result
    ) => {
      setExecutionResult(result);
    };

    const handleRoomState = (
      state
    ) => {
      roomStateReceivedRef.current =
        true;

      if (
        typeof state.code ===
        "string"
      ) {
        setCode(state.code);
      }

      if (state.language) {
        setLanguage(
          state.language
        );
      }

      if (
        state.executionResult
      ) {
        setExecutionResult(
          state.executionResult
        );
      }
    };

    socket.on(
      "connect",
      handleConnect
    );

    socket.on(
      "user-joined",
      handleUserJoined
    );

    socket.on(
      "code-update",
      handleCodeUpdate
    );

    socket.on(
      "language-update",
      handleLanguageUpdate
    );

    socket.on(
      "room-users",
      handleRoomUsers
    );

    socket.on(
      "receive-message",
      handleReceiveMessage
    );

    socket.on(
      "output-update",
      handleOutputUpdate
    );

    socket.on(
      "room-state",
      handleRoomState
    );

    if (
      socket.connected &&
      urlRoomId
    ) {
      socket.emit(
        "join-room",
        {
          roomId: urlRoomId,
          user,
        }
      );

      setRoomId(urlRoomId);
      setJoinedRoom(urlRoomId);
    }

    return () => {
      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "user-joined",
        handleUserJoined
      );

      socket.off(
        "code-update",
        handleCodeUpdate
      );

      socket.off(
        "language-update",
        handleLanguageUpdate
      );

      socket.off(
        "room-users",
        handleRoomUsers
      );

      socket.off(
        "receive-message",
        handleReceiveMessage
      );

      socket.off(
        "output-update",
        handleOutputUpdate
      );

      socket.off(
        "room-state",
        handleRoomState
      );
    };
  }, [urlRoomId]);

  // =========================
  // FETCH BUG DETAILS
  // =========================

  useEffect(() => {
    if (
      bugId &&
      user &&
      token
    ) {
      fetchBugDetails();
    }
  }, [bugId]);

  const fetchBugDetails =
    async () => {
      try {
        setLoadingBug(true);
        setPageError("");

        const response =
          await fetch(
            `${API_URL}/api/bugs/${bugId}`
          );

        if (
          response.status ===
          404
        ) {
          setBug(null);

          setPageError(
            "Bug not found. The bug may have been removed or the link is invalid."
          );

          return;
        }

        const data =
          await response.json();

        if (!response.ok) {
          setPageError(
            data.message ||
              "Unable to load bug details."
          );

          return;
        }

        if (
          !data ||
          !data.id
        ) {
          setPageError(
            "Bug not found."
          );

          return;
        }

        setBug(data);

        if (
          !roomStateReceivedRef.current
        ) {
          if (data.code) {
            setCode(
              data.code
            );
          }

          setLanguage(
            convertLanguage(
              data.language
            )
          );
        }
      } catch (error) {
        console.log(error);

        setPageError(
          "Unable to connect to server."
        );
      } finally {
        setLoadingBug(false);
      }
    };

  // =========================
  // LANGUAGE
  // =========================

  const convertLanguage = (
    bugLanguage
  ) => {
    if (!bugLanguage) {
      return "java";
    }

    const lang =
      bugLanguage
        .toLowerCase()
        .trim();

    if (lang === "java") {
      return "java";
    }

    if (
      lang === "python" ||
      lang === "python3"
    ) {
      return "python";
    }

    if (
      lang === "javascript" ||
      lang === "js"
    ) {
      return "javascript";
    }

    if (
      lang === "c++" ||
      lang === "cpp"
    ) {
      return "cpp";
    }

    if (lang === "c") {
      return "c";
    }

    return "plaintext";
  };

  const getStarterCode =
    (selectedLanguage) => {
      if (
        selectedLanguage ===
        "java"
      ) {
        return `public class Main {
    public static void main(String[] args) {

    }
}`;
      }

      if (
        selectedLanguage ===
        "python"
      ) {
        return `def main():
    print("Hello BugSync")

if __name__ == "__main__":
    main()`;
      }

      if (
        selectedLanguage ===
        "javascript"
      ) {
        return `function main() {
    console.log("Hello BugSync");
}

main();`;
      }

      if (
        selectedLanguage ===
        "cpp"
      ) {
        return `#include <iostream>
using namespace std;

int main() {

    return 0;
}`;
      }

      if (
        selectedLanguage ===
        "c"
      ) {
        return `#include <stdio.h>

int main() {

    return 0;
}`;
      }

      return "";
    };

  const handleLanguageChange =
    (e) => {
      const newLanguage =
        e.target.value;

      const newCode =
        getStarterCode(
          newLanguage
        );

      setLanguage(
        newLanguage
      );

      setCode(
        newCode
      );

      setExecutionResult(
        null
      );

      if (joinedRoom) {
        socket.emit(
          "language-change",
          {
            roomId:
              joinedRoom,
            language:
              newLanguage,
          }
        );

        socket.emit(
          "code-change",
          {
            roomId:
              joinedRoom,
            code:
              newCode,
          }
        );
      }
    };

  // =========================
  // ROOM
  // =========================

  const joinRoom = () => {
    if (!user || !token) {
      setPageError(
        "Please login to join a Live Debug room."
      );

      return;
    }

    if (!roomId.trim()) {
      setMessage(
        "Enter a room ID"
      );

      return;
    }

    socket.emit(
      "join-room",
      {
        roomId,
        user,
      }
    );

    setJoinedRoom(roomId);
  };

  const createRoom = () => {
    if (!user || !token) {
      setPageError(
        "Please login to create a Live Debug room."
      );

      return;
    }

    const newRoomId =
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    setRoomId(newRoomId);

    socket.emit(
      "join-room",
      {
        roomId:
          newRoomId,
        user,
      }
    );

    setJoinedRoom(
      newRoomId
    );
  };

  const copyInviteLink =
    async () => {
      try {
        await navigator.clipboard.writeText(
          window.location.href
        );

        setMessage(
          "Invite link copied!"
        );
      } catch (error) {
        console.log(error);

        setMessage(
          "Unable to copy invite link."
        );
      }
    };

  // =========================
  // CODE SYNC
  // =========================

  const handleCodeChange = (
    value
  ) => {
    const newCode =
      value || "";

    setCode(newCode);

    if (joinedRoom) {
      socket.emit(
        "code-change",
        {
          roomId:
            joinedRoom,
          code:
            newCode,
        }
      );
    }
  };

  // =========================
  // CHAT
  // =========================

  const sendMessage = () => {
    if (!user || !token) {
      setPageError(
        "Please login again."
      );

      return;
    }

    if (
      !chatMessage.trim()
    ) {
      return;
    }

    socket.emit(
      "chat-message",
      {
        roomId:
          joinedRoom,
        message:
          chatMessage,
        user,
      }
    );

    setChatMessage("");
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView(
      {
        behavior:
          "smooth",
      }
    );
  }, [messages]);

  // =========================
  // RUN CODE
  // =========================

  const runCode =
    async () => {
      if (!code.trim()) {
        setExecutionResult({
          output:
            "Please enter some code before running.",
          status:
            "No Code",
          runBy:
            user?.name ||
            "Developer",
        });

        return;
      }

      setIsRunning(true);

      try {
        const response =
          await fetch(
            `${API_URL}/api/run`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  source_code:
                    code,
                  language,
                  stdin:
                    customInput,
                }),
            }
          );

        const data =
          await response.json();

        let output = "";

        if (
          data.compile_output
        ) {
          output =
            data.compile_output;
        } else if (
          data.stderr
        ) {
          output =
            data.stderr;
        } else if (
          data.stdout
        ) {
          output =
            data.stdout;
        } else {
          output =
            data.message ||
            "Program finished.";
        }

        const result = {
          output,

          status:
            data.status ||
            "Finished",

          time:
            data.time ||
            null,

          memory:
            data.memory ||
            null,

          runBy:
            user?.name ||
            "Developer",
        };

        setExecutionResult(
          result
        );

        if (joinedRoom) {
          socket.emit(
            "run-result",
            {
              roomId:
                joinedRoom,

              result,

              code,

              language,
            }
          );
        }
      } catch (error) {
        console.log(error);

        setExecutionResult({
          output:
            "Unable to execute code.",

          status:
            "Error",

          runBy:
            user?.name ||
            "Developer",
        });
      } finally {
        setIsRunning(false);
      }
    };

  // =========================
  // SAVE SOLUTION
  // =========================

  const saveAsSolution =
    async () => {
      if (!user || !token) {
        setPageError(
          "Please login again to save the solution."
        );

        return;
      }

      if (!bugId) {
        setMessage(
          "This room is not connected to a bug."
        );

        return;
      }

      if (
        !solutionExplanation.trim()
      ) {
        setMessage(
          "Please enter a solution explanation."
        );

        return;
      }

      if (!code.trim()) {
        setMessage(
          "Code cannot be empty."
        );

        return;
      }

      try {
        setIsSavingSolution(
          true
        );

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
                    bugId,

                  solution_text:
                    solutionExplanation,

                  code,
                }),
            }
          );

        const data =
          await response.json();

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

          setPageError(
            "Your session expired. Please login again."
          );

          return;
        }

        if (response.ok) {
          setSolutionSaved(
            true
          );

          setMessage(
            "Solution saved successfully!"
          );

          setSolutionExplanation(
            ""
          );
        } else {
          setMessage(
            data.message ||
              "Unable to save solution."
          );
        }
      } catch (error) {
        console.log(error);

        setMessage(
          "Unable to save solution."
        );
      } finally {
        setIsSavingSolution(
          false
        );
      }
    };

  // =========================
  // FILE NAME
  // =========================

  const getFileName = () => {
    if (
      language === "java"
    ) {
      return "Main.java";
    }

    if (
      language === "python"
    ) {
      return "main.py";
    }

    if (
      language === "javascript"
    ) {
      return "main.js";
    }

    if (
      language === "cpp"
    ) {
      return "main.cpp";
    }

    if (
      language === "c"
    ) {
      return "main.c";
    }

    return "main.txt";
  };

  // =========================
  // LOGIN ERROR UI
  // =========================

  if (!user || !token) {
    return (
      <div className="page-container">

        <div className="general-form">

          <h2>
            Live Debug
          </h2>

          <p className="message">
            {pageError ||
              "Please login to access Live Debug."}
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
  // INVALID BUG UI
  // =========================

  if (
    bugId &&
    !loadingBug &&
    pageError &&
    !bug
  ) {
    return (
      <div className="page-container">

        <div className="general-form">

          <h2>
            Bug Not Found
          </h2>

          <p className="message">
            {pageError}
          </p>

          <button
            className="primary-btn"
            onClick={() =>
              navigate(
                "/community"
              )
            }
          >
            Go to Community
          </button>

        </div>

      </div>
    );
  }

  if (
    bugId &&
    loadingBug
  ) {
    return (
      <p className="loading-text">
        Loading bug...
      </p>
    );
  }

  return (
    <div className="page-container">

      {!joinedRoom ? (

        <div className="general-form">

          <h2>
            Live Debug Room
          </h2>

          <p className="form-subtitle">
            Create a room or join another developer using a Room ID.
          </p>

          <label>
            Room ID
          </label>

          <input
            type="text"
            value={
              roomId
            }
            onChange={(e) =>
              setRoomId(
                e.target.value.toUpperCase()
              )
            }
            placeholder="Enter Room ID"
          />

          <button
            className="primary-btn"
            onClick={
              joinRoom
            }
          >
            Join Room
          </button>

          <button
            className="secondary-room-btn"
            onClick={
              createRoom
            }
          >
            Create New Room
          </button>

          {message && (
            <p className="message">
              {message}
            </p>
          )}

        </div>

      ) : (

        <div className="live-editor-page">

          <Link
            to={
              bugId
                ? `/bugs/${bugId}`
                : "/community"
            }
            className="back-link"
          >
            ← Back to Bug
          </Link>

          <div className="live-room-header">

            <div>

              <h2>
                Live Debug Room
              </h2>

              {bug && (
                <p>
                  Bug:
                  <strong>
                    {" "}
                    {bug.title}
                  </strong>
                </p>
              )}

              <div className="room-meta-row">

                {bugId && (
                  <span>
                    Bug #{bugId}
                  </span>
                )}

                <span>
                  Room{" "}
                  <strong>
                    {joinedRoom}
                  </strong>
                </span>

              </div>

            </div>

            <div className="live-room-actions">

              <button
                className="copy-link-btn"
                onClick={
                  copyInviteLink
                }
              >
                Copy Invite Link
              </button>

              <span className="live-status">
                ● Connected
              </span>

            </div>

          </div>

          {message && (
            <p className="message">
              {message}
            </p>
          )}

          <div className="live-workspace">

            <main className="workspace-main">

              <div className="editor-panel">

                <div className="editor-toolbar">

                  <div className="editor-toolbar-left">

                    <span className="editor-file-label">
                      {getFileName()}
                    </span>

                    <select
                      value={
                        language
                      }
                      onChange={
                        handleLanguageChange
                      }
                      className="language-select"
                    >

                      <option value="java">
                        Java
                      </option>

                      <option value="python">
                        Python
                      </option>

                      <option value="javascript">
                        JavaScript
                      </option>

                      <option value="cpp">
                        C++
                      </option>

                      <option value="c">
                        C
                      </option>

                    </select>

                  </div>

                  <span className="editor-live-label">
                    ● Live Collaboration
                  </span>

                </div>

                <div className="monaco-wrapper">

                  <Editor
                    height="560px"
                    language={
                      language
                    }
                    value={
                      code
                    }
                    theme="vs-dark"
                    onChange={
                      handleCodeChange
                    }
                    options={{
                      fontSize:
                        15,

                      minimap: {
                        enabled:
                          false,
                      },

                      automaticLayout:
                        true,

                      wordWrap:
                        "on",

                      scrollBeyondLastLine:
                        false,

                      tabSize:
                        4,
                    }}
                  />

                </div>

              </div>

              <section className="run-code-section">

                <div className="section-header-row">

                  <div>

                    <h3>
                      Run & Test
                    </h3>

                    <p>
                      Execute the current code and verify the fix.
                    </p>

                  </div>

                  <button
                    className="run-code-btn"
                    onClick={
                      runCode
                    }
                    disabled={
                      isRunning
                    }
                  >
                    {isRunning
                      ? "Running..."
                      : "▶ Run Code"}
                  </button>

                </div>

                <label className="stdin-label">
                  Custom Input (optional)
                </label>

                <textarea
                  className="stdin-box"
                  value={
                    customInput
                  }
                  onChange={(e) =>
                    setCustomInput(
                      e.target.value
                    )
                  }
                  placeholder="Enter stdin if required..."
                />

                <div className="output-console">

                  <div className="output-console-header">

                    <span>
                      Console
                    </span>

                    {executionResult && (
                      <span>
                        {
                          executionResult.status
                        }
                      </span>
                    )}

                  </div>

                  <pre>
                    {executionResult
                      ? executionResult.output
                      : "Run the code to see output here."}
                  </pre>

                </div>

              </section>

              {bugId && (

                <section className="save-solution-section">

                  <div className="section-header-row">

                    <div>

                      <h3>
                        Final Fix
                      </h3>

                      <p>
                        Save the working code as a community solution.
                      </p>

                    </div>

                    {solutionSaved && (
                      <span className="solution-saved-badge">
                        ✓ Saved
                      </span>
                    )}

                  </div>

                  <label>
                    Solution Explanation
                  </label>

                  <textarea
                    className="solution-explanation-box"
                    value={
                      solutionExplanation
                    }
                    onChange={(e) =>
                      setSolutionExplanation(
                        e.target.value
                      )
                    }
                    placeholder="Explain how this fix solves the bug..."
                  />

                  <div className="save-solution-actions">

                    <button
                      className="save-solution-btn"
                      onClick={
                        saveAsSolution
                      }
                      disabled={
                        isSavingSolution
                      }
                    >
                      {isSavingSolution
                        ? "Saving..."
                        : "Save as Solution"}
                    </button>

                    {solutionSaved && (
                      <button
                        className="view-bug-btn"
                        onClick={() =>
                          navigate(
                            `/bugs/${bugId}`
                          )
                        }
                      >
                        View Solutions
                      </button>
                    )}

                  </div>

                </section>

              )}

            </main>

            <aside className="workspace-sidebar">

              <section className="sidebar-card">

                <div className="sidebar-title-row">

                  <h3>
                    Developers
                  </h3>

                  <span className="online-count">
                    {connectedUsers.length} online
                  </span>

                </div>

                <div className="sidebar-users-list">

                  {connectedUsers.map(
                    (
                      connectedUser
                    ) => (

                      <div
                        key={
                          connectedUser.socketId
                        }
                        className="sidebar-user"
                      >

                        <span className="sidebar-user-avatar">
                          {connectedUser.name
                            ?.charAt(0)
                            .toUpperCase() ||
                            "D"}
                        </span>

                        <div>

                          <strong>
                            {
                              connectedUser.name
                            }
                          </strong>

                          <span>
                            ● Online
                          </span>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </section>

              {bug && (

                <section className="sidebar-card">

                  <h3>
                    Bug Context
                  </h3>

                  <div className="context-item">

                    <span className="context-label">
                      Description
                    </span>

                    <p>
                      {
                        bug.description
                      }
                    </p>

                  </div>

                  <div className="context-item">

                    <span className="context-label">
                      Error Message
                    </span>

                    <p className="context-error">
                      {bug.error_message ||
                        "No error message provided"}
                    </p>

                  </div>

                  <div className="context-item">

                    <span className="context-label">
                      Expected Output
                    </span>

                    <p>
                      {bug.expected_output ||
                        "No expected output provided"}
                    </p>

                  </div>

                </section>

              )}

              <section className="sidebar-card chat-sidebar-card">

                <div className="sidebar-title-row">

                  <h3>
                    Live Chat
                  </h3>

                  <span className="chat-live-dot">
                    ● Live
                  </span>

                </div>

                <div className="chat-messages compact-chat">

                  {messages.length ===
                  0 ? (

                    <div className="chat-empty-state">
                      No messages yet.
                    </div>

                  ) : (

                    messages.map(
                      (chat) => (

                        <div
                          key={
                            chat.id
                          }
                          className={
                            chat.userId ===
                            user?.id
                              ? "chat-message my-chat-message"
                              : "chat-message"
                          }
                        >

                          <div className="chat-message-header">

                            <strong>
                              {
                                chat.name
                              }
                            </strong>

                            <span>
                              {
                                chat.time
                              }
                            </span>

                          </div>

                          <p>
                            {
                              chat.message
                            }
                          </p>

                        </div>

                      )
                    )

                  )}

                  <div
                    ref={
                      chatBottomRef
                    }
                  />

                </div>

                <div className="chat-input-row">

                  <input
                    type="text"
                    value={
                      chatMessage
                    }
                    onChange={(e) =>
                      setChatMessage(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key ===
                        "Enter"
                      ) {
                        sendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                  />

                  <button
                    className="chat-send-btn"
                    onClick={
                      sendMessage
                    }
                  >
                    Send
                  </button>

                </div>

              </section>

            </aside>

          </div>

        </div>

      )}

    </div>
  );
}

export default LiveRoom;