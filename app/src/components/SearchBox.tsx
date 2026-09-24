import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getIndex } from "../lib/data";
import { search } from "../lib/search";
import type { IndexEntry } from "../lib/types";

export default function SearchBox({ autoFocus = false }: { autoFocus?: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IndexEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const indexRef = useRef<IndexEntry[] | null>(null);
  const navigate = useNavigate();
  const listId = useId();

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setOpen(false);
      return;
    }
    let cancelled = false;
    setError(null);
    const t = setTimeout(async () => {
      if (!indexRef.current) {
        setLoading(true);
        try {
          indexRef.current = await getIndex();
        } catch {
          if (!cancelled) {
            setLoading(false);
            setError("Could not load school data — check your connection and refresh.");
          }
          return;
        }
        setLoading(false);
      }
      if (cancelled) return;
      const r = search(indexRef.current, query);
      setResults(r);
      setOpen(true);
      setActive(r.length ? 0 : -1);
    }, 60);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  function pick(e: IndexEntry) {
    setOpen(false);
    setQuery(e.n);
    navigate(`/school/${e.k}`);
  }

  return (
    <div className="relative w-full" role="combobox" aria-expanded={open} aria-haspopup="listbox" aria-owns={listId}>
      <label htmlFor="school-search" className="sr-only">
        Search for a US public high school
      </label>
      <input
        id="school-search"
        type="text"
        role="searchbox"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        autoFocus={autoFocus}
        placeholder="Type a school name — e.g. Heritage High School"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && results.length) {
            e.preventDefault();
            setActive((a) => (a + 1) % results.length);
          } else if (e.key === "ArrowUp" && results.length) {
            e.preventDefault();
            setActive((a) => (a - 1 + results.length) % results.length);
          } else if (e.key === "Enter" && active >= 0 && results[active]) {
            e.preventDefault();
            pick(results[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        onFocus={() => results.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="w-full rounded-xl border-2 border-ink bg-card px-5 py-4 text-lg shadow-sm placeholder:text-ink-2/60 focus:border-accent focus:outline-none"
      />
      {loading && (
        <p className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink-2">
          loading…
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-warn">
          {error}
        </p>
      )}
      {open && results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-label="School suggestions"
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-line bg-card shadow-lg"
        >
          {results.map((r, i) => (
            <li
              key={r.k}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
            >
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(r)}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full items-baseline justify-between gap-3 px-4 py-3 text-left ${
                  i === active ? "bg-accent/10" : ""
                }`}
              >
                <span className="truncate font-medium text-ink">
                  {r.n}
                  <span className="ml-2 font-normal text-ink-2">{r.d}</span>
                </span>
                <span className="shrink-0 rounded bg-line/70 px-1.5 py-0.5 text-xs font-semibold text-ink-2">
                  {r.s}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && results.length === 0 && query.trim().length > 1 && !loading && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-line bg-card px-4 py-3 text-sm text-ink-2 shadow-lg">
          No public high school found — check the spelling, or try the district
          name. Only schools reporting grade 12 are included.
        </div>
      )}
    </div>
  );
}
