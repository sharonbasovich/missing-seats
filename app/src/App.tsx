import { HashRouter, Link, NavLink, Route, Routes } from "react-router-dom";
import Home from "./routes/Home";
import School from "./routes/School";
import StatePage from "./routes/StatePage";
import StatesIndex from "./routes/StatesIndex";
import ActionPack from "./routes/ActionPack";
import About from "./routes/About";
import NotFound from "./routes/NotFound";

function Nav() {
  const link = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? "bg-ink text-white" : "text-ink-2 hover:bg-line/60"
    }`;
  return (
    <header className="no-print border-b border-line bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold tracking-tight text-ink">
            Missing<span className="text-accent">Seats</span>
          </span>
          <span className="hidden text-xs text-ink-2 sm:inline">
            girls in US high-school STEM classes
          </span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1">
          <NavLink to="/" end className={link}>
            Search
          </NavLink>
          <NavLink to="/states" className={link}>
            States
          </NavLink>
          <NavLink to="/about" className={link}>
            Data &amp; method
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <HashRouter>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Routes>
        <Route
          path="/school/:key/pack"
          element={
            <main id="main">
              <ActionPack />
            </main>
          }
        />
        <Route
          path="*"
          element={
            <>
              <Nav />
              <main id="main" className="mx-auto max-w-5xl px-4 pb-16">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/school/:key" element={<School />} />
                  <Route path="/states" element={<StatesIndex />} />
                  <Route path="/state/:code" element={<StatePage />} />
                  <Route path="/about" element={<About />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <footer className="no-print border-t border-line bg-card">
                <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-ink-2">
                  <p>
                    Source: US Department of Education, Office for Civil Rights —
                    {" "}
                    <a
                      className="underline"
                      href="https://ocrdata.ed.gov/data"
                      target="_blank"
                      rel="noreferrer"
                    >
                      2023–24 Civil Rights Data Collection (CRDC)
                    </a>
                    . Counts may differ by ±1 due to federal privacy
                    perturbation. Not affiliated with the US Department of
                    Education.
                  </p>
                  <p className="mt-1">
                    Missing Seats is an open-source project built for UN SDG
                    targets 4.5 and 5.b.{" "}
                    <Link to="/about" className="underline">
                      Data &amp; method
                    </Link>
                  </p>
                </div>
              </footer>
            </>
          }
        />
      </Routes>
    </HashRouter>
  );
}
