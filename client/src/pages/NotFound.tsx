import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <Compass className="h-12 w-12 text-slate-400" />
      <h1 className="text-xl font-semibold text-slate-900">Page not found</h1>
      <p className="max-w-sm text-sm text-slate-500">The page you're looking for doesn't exist or was moved.</p>
      <Link to="/">
        <Button>Go home</Button>
      </Link>
    </div>
  );
}
