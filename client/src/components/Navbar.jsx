import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Bug,
} from "lucide-react";

function Navbar() {
  const navigate =
    useNavigate();

  const user =
    JSON.parse(
      localStorage.getItem(
        "user"
      )
    );

  const handleLogout = () => {
    // Remove user details
    localStorage.removeItem(
      "user"
    );

    // Remove JWT token
    localStorage.removeItem(
      "token"
    );

    navigate("/");

    window.location.reload();
  };

  return (
    <nav className="navbar">

      <Link
        to="/"
        className="logo"
      >
        <Bug size={28} />

        BugSync
      </Link>

      <div className="nav-links">

        <Link to="/">
          Home
        </Link>

        <Link to="/community">
          Community
        </Link>

        {user && (
          <>
            <Link to="/post-bug">
              Post Bug
            </Link>

            <Link to="/live-room">
              Live Debug
            </Link>
          </>
        )}

        {!user ? (
          <>
            <Link to="/login">
              Login
            </Link>

            <Link
              to="/register"
              className="register-nav-btn"
            >
              Register
            </Link>
          </>
        ) : (
          <>
            <span>
              Hello, {user.name}
            </span>

            <button
              onClick={
                handleLogout
              }
            >
              Logout
            </button>
          </>
        )}

      </div>

    </nav>
  );
}

export default Navbar;