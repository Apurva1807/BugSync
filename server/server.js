const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const bugRoutes = require("./routes/bugRoutes");
const solutionRoutes = require("./routes/solutionRoutes");

const app = express();

// =========================
// MIDDLEWARE
// =========================

app.use(cors());
app.use(express.json());

// =========================
// API ROUTES
// =========================

app.use("/api/auth", authRoutes);
app.use("/api/bugs", bugRoutes);
app.use("/api/solutions", solutionRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("BugSync Backend is Working!");
});

// =========================
// JUDGE0 CODE EXECUTION
// =========================

const JUDGE0_URL = "https://ce.judge0.com";

const LANGUAGE_IDS = {
  c: 50,
  cpp: 54,
  java: 62,
  javascript: 63,
  python: 71,
};

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

app.post("/api/run", async (req, res) => {
  const {
    source_code,
    language,
    stdin = "",
  } = req.body;

  if (!source_code || !source_code.trim()) {
    return res.status(400).json({
      message: "Code cannot be empty.",
    });
  }

  const languageId = LANGUAGE_IDS[language];

  if (!languageId) {
    return res.status(400).json({
      message: "Unsupported programming language.",
    });
  }

  // Simple limits for demo safety
  if (source_code.length > 20000) {
    return res.status(400).json({
      message: "Code is too large to execute.",
    });
  }

  if (stdin.length > 10000) {
    return res.status(400).json({
      message: "Input is too large.",
    });
  }

  try {
    // Create Judge0 submission
    const submissionResponse = await fetch(
      `${JUDGE0_URL}/submissions/?base64_encoded=false&wait=false`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          source_code: source_code,
          language_id: languageId,
          stdin: stdin,
        }),
      }
    );

    const submissionData =
      await submissionResponse.json();

    if (!submissionResponse.ok) {
      console.log("Judge0 submission error:", submissionData);

      return res.status(500).json({
        message:
          submissionData.error ||
          "Unable to submit code for execution.",
      });
    }

    const token = submissionData.token;

    if (!token) {
      return res.status(500).json({
        message: "Execution token was not received.",
      });
    }

    let result = null;

    // Poll Judge0 until execution completes
    for (let attempt = 0; attempt < 20; attempt++) {
      await sleep(500);

      const resultResponse = await fetch(
        `${JUDGE0_URL}/submissions/${token}?base64_encoded=false&fields=stdout,stderr,compile_output,message,status,time,memory`
      );

      const resultData =
        await resultResponse.json();

      if (!resultResponse.ok) {
        console.log(
          "Judge0 result error:",
          resultData
        );

        return res.status(500).json({
          message:
            "Unable to get execution result.",
        });
      }

      result = resultData;

      const statusId =
        result?.status?.id;

      // 1 = In Queue
      // 2 = Processing
      if (
        statusId !== 1 &&
        statusId !== 2
      ) {
        break;
      }
    }

    if (
      !result ||
      result?.status?.id === 1 ||
      result?.status?.id === 2
    ) {
      return res.status(504).json({
        message:
          "Execution is taking too long. Please try again.",
      });
    }

    return res.json({
      stdout: result.stdout,
      stderr: result.stderr,
      compile_output:
        result.compile_output,
      message: result.message,

      status:
        result.status?.description ||
        "Finished",

      status_id:
        result.status?.id,

      time:
        result.time,

      memory:
        result.memory,
    });
  } catch (error) {
    console.log(
      "Code execution error:",
      error
    );

    return res.status(500).json({
      message:
        "Code execution service is currently unavailable.",
    });
  }
});

// =========================
// HTTP SERVER
// =========================

const server = http.createServer(app);

// =========================
// SOCKET.IO
// =========================

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Connected users by room
const roomUsers = {};

// Latest collaborative state
const roomStates = {};

io.on("connection", (socket) => {
  console.log(
    "User connected:",
    socket.id
  );

  // =========================
  // JOIN ROOM
  // =========================

  socket.on(
    "join-room",
    ({ roomId, user }) => {
      if (!roomId) {
        return;
      }

      socket.join(roomId);

      socket.roomId =
        roomId;

      if (!roomUsers[roomId]) {
        roomUsers[roomId] = [];
      }

      if (!roomStates[roomId]) {
        roomStates[roomId] = {};
      }

      const alreadyExists =
        roomUsers[roomId].some(
          (connectedUser) =>
            connectedUser.socketId ===
            socket.id
        );

      if (!alreadyExists) {
        roomUsers[roomId].push({
          socketId:
            socket.id,

          id:
            user?.id || null,

          name:
            user?.name ||
            "Developer",
        });
      }

      console.log(
        `User ${socket.id} joined room ${roomId}`
      );

      // Send connected users
      io.to(roomId).emit(
        "room-users",
        roomUsers[roomId]
      );

      // Send latest room state
      if (
        Object.keys(
          roomStates[roomId]
        ).length > 0
      ) {
        socket.emit(
          "room-state",
          roomStates[roomId]
        );
      }

      // Tell others
      socket
        .to(roomId)
        .emit(
          "user-joined",
          user?.name ||
            "Developer"
        );
    }
  );

  // =========================
  // CODE SYNC
  // =========================

  socket.on(
    "code-change",
    ({ roomId, code }) => {
      if (!roomStates[roomId]) {
        roomStates[roomId] = {};
      }

      roomStates[roomId].code =
        code;

      socket
        .to(roomId)
        .emit(
          "code-update",
          code
        );
    }
  );

  // =========================
  // LANGUAGE SYNC
  // =========================

  socket.on(
    "language-change",
    ({
      roomId,
      language,
    }) => {
      if (!roomStates[roomId]) {
        roomStates[roomId] = {};
      }

      roomStates[
        roomId
      ].language =
        language;

      socket
        .to(roomId)
        .emit(
          "language-update",
          language
        );
    }
  );

  // =========================
  // LIVE CHAT
  // =========================

  socket.on(
    "chat-message",
    ({
      roomId,
      message,
      user,
    }) => {
      if (
        !message ||
        !message.trim()
      ) {
        return;
      }

      const chatData = {
        id:
          Date.now().toString() +
          Math.random().toString(),

        socketId:
          socket.id,

        userId:
          user?.id || null,

        name:
          user?.name ||
          "Developer",

        message:
          message.trim(),

        time:
          new Date().toLocaleTimeString(
            [],
            {
              hour:
                "2-digit",

              minute:
                "2-digit",
            }
          ),
      };

      io.to(roomId).emit(
        "receive-message",
        chatData
      );
    }
  );

  // =========================
  // SHARED EXECUTION RESULT
  // =========================

  socket.on(
    "run-result",
    ({
      roomId,
      result,
      code,
      language,
    }) => {
      if (!roomStates[roomId]) {
        roomStates[roomId] = {};
      }

      roomStates[roomId].code =
        code;

      roomStates[
        roomId
      ].language =
        language;

      roomStates[
        roomId
      ].executionResult =
        result;

      // Send result to other developers
      socket
        .to(roomId)
        .emit(
          "output-update",
          result
        );
    }
  );

  // =========================
  // DISCONNECT
  // =========================

  socket.on(
    "disconnect",
    () => {
      console.log(
        "User disconnected:",
        socket.id
      );

      const roomId =
        socket.roomId;

      if (
        roomId &&
        roomUsers[roomId]
      ) {
        roomUsers[roomId] =
          roomUsers[
            roomId
          ].filter(
            (
              connectedUser
            ) =>
              connectedUser.socketId !==
              socket.id
          );

        io.to(roomId).emit(
          "room-users",
          roomUsers[roomId]
        );

        if (
          roomUsers[roomId]
            .length === 0
        ) {
          delete roomUsers[
            roomId
          ];

          delete roomStates[
            roomId
          ];
        }
      }
    }
  );
});

// =========================
// START SERVER
// =========================

const PORT =
  process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});