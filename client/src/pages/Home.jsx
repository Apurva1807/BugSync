import { Link } from "react-router-dom";
import {
  Bug,
  Code2,
  Users,
  MessageSquareCode,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

function Home() {
  return (
    <div className="home-page">

      {/* HERO SECTION */}

      <section className="hero-section">

        <div className="hero-content">

          <div className="hero-badge">
            <Bug size={18} />
            Collaborative Debugging Community
          </div>

          <h1>
            Debug Smarter.
            <span> Solve Together.</span>
          </h1>

          <p>
            BugSync is a community-driven platform where developers
            can share programming bugs, receive solutions, understand errors,
            and learn from each other.
          </p>

          <div className="hero-buttons">

            <Link
              to="/community"
              className="hero-primary-btn"
            >
              Explore Community
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/register"
              className="hero-secondary-btn"
            >
              Join BugSync
            </Link>

          </div>

        </div>

        {/* RIGHT SIDE VISUAL */}

        <div className="hero-visual">

          <div className="code-window">

            <div className="code-window-header">

              <span className="window-dot"></span>
              <span className="window-dot"></span>
              <span className="window-dot"></span>

              <p>DebugTogether.java</p>

            </div>

            <div className="code-window-body">

              <p>
                <span className="code-purple">
                  public static void
                </span>{" "}
                main(String[] args) {"{"}
              </p>

              <p className="code-indent">
                Student s = null;
              </p>

              <p className="code-indent error-line">
                System.out.println(s.name);
              </p>

              <p>{"}"}</p>

              <div className="error-preview">
                <Bug size={17} />
                NullPointerException detected
              </div>

              <div className="solution-preview">
                <CheckCircle2 size={17} />
                Community solution available
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* FEATURES */}

      <section className="home-features">

        <div className="section-heading">

          <p className="section-label">
            HOW IT WORKS
          </p>

          <h2>
            From bug to solution
          </h2>

          <p>
            Share your problem and learn through community-driven debugging.
          </p>

        </div>

        <div className="feature-grid">

          <div className="feature-card">

            <div className="feature-icon">
              <Bug size={26} />
            </div>

            <h3>Post Your Bug</h3>

            <p>
              Share your code, error message,
              expected output and problem description.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              <Users size={26} />
            </div>

            <h3>Get Community Help</h3>

            <p>
              Other developers can analyze your
              issue and suggest useful solutions.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              <MessageSquareCode size={26} />
            </div>

            <h3>Share Solutions</h3>

            <p>
              Explain the cause of the error and
              provide corrected code.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              <CheckCircle2 size={26} />
            </div>

            <h3>Mark as Solved</h3>

            <p>
              Accept the best solution and
              automatically mark the issue as solved.
            </p>

          </div>

        </div>

      </section>


      {/* FINAL CTA */}

      <section className="home-cta">

        <Code2 size={40} />

        <h2>
          Got a bug you can't solve?
        </h2>

        <p>
          Share it with the BugSync community.
        </p>

        <Link
          to="/register"
          className="hero-primary-btn"
        >
          Get Started
          <ArrowRight size={18} />
        </Link>

      </section>

    </div>
  );
}

export default Home;
