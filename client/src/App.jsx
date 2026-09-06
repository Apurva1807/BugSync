import { BrowserRouter, Routes, Route } from "react-router-dom";
import LiveRoom from "./pages/LiveRoom";
import Home from "./pages/Home.jsx";
import Register from "./pages/Register";
import Login from "./pages/Login";
import PostBug from "./pages/PostBug";
import BugList from "./pages/BugList";
import BugDetails from "./pages/BugDetails";
import Navbar from "./components/Navbar";

import "./App.css";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/community"
          element={<BugList />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/post-bug"
          element={<PostBug />}
        />

        <Route
          path="/bugs/:id"
          element={<BugDetails />}
        />
        <Route
  path="/live-room"
  element={<LiveRoom />}
/>
<Route
  path="/live-room/:bugId/:roomId"
  element={<LiveRoom />}
/>

      </Routes>

    </BrowserRouter>
  );
}

export default App;