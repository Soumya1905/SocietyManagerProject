import { User, Mail, Home, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { formatDate } from "../utils/format";

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  const rows = [
    { icon: User, label: "Full Name", value: user.fullName },
    { icon: Mail, label: "Email", value: user.email },
    { icon: Home, label: "Apartment", value: user.apartmentNumber },
    { icon: Shield, label: "Role", value: user.role === "ADMIN" ? "Administrator" : "Resident" },
  ];

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold text-slate-900">My Profile</h1>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="rounded-md bg-slate-100 p-2 text-slate-500">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-medium text-slate-800">{value}</p>
              </div>
            </div>
          ))}
          <p className="text-xs text-slate-400">Member since {formatDate(user.createdAt)}</p>
        </CardBody>
      </Card>
    </div>
  );
}
