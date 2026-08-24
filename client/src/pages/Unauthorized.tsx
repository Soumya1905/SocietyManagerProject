import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "../components/ui/Button";

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <ShieldAlert className="h-12 w-12 text-red-500" />
      <h1 className="text-xl font-semibold text-slate-900">Access denied</h1>
      <p className="max-w-sm text-sm text-slate-500">
        You don't have permission to view this page. Please contact an administrator if you believe this is a
        mistake.
      </p>
      <Link to="/login">
        <Button>Back to login</Button>
      </Link>
    </div>
  );
}
