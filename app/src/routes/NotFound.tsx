import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <p className="text-2xl font-extrabold">Page not found</p>
      <p className="mt-2 text-ink-2">
        Try <Link to="/" className="text-accent underline">searching for a school</Link>.
      </p>
    </div>
  );
}
