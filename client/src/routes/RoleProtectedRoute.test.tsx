import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RoleProtectedRoute } from "./RoleProtectedRoute";
import * as AuthContextModule from "../context/AuthContext";

vi.mock("../context/AuthContext", async () => {
  const actual = await vi.importActual<typeof AuthContextModule>("../context/AuthContext");
  return { ...actual, useAuth: vi.fn() };
});

function renderAsRole(role: "RESIDENT" | "ADMIN" | null) {
  vi.mocked(AuthContextModule.useAuth).mockReturnValue({
    user: role
      ? {
          id: "1",
          fullName: "Test User",
          email: "test@example.com",
          apartmentNumber: "A-1",
          role,
          createdAt: "",
          updatedAt: "",
        }
      : null,
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  });

  return render(
    <MemoryRouter initialEntries={["/admin/dashboard"]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
        <Route element={<RoleProtectedRoute allow={["ADMIN"]} />}>
          <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("RoleProtectedRoute", () => {
  it("allows access for a user with the required role", () => {
    renderAsRole("ADMIN");
    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
  });

  it("redirects a resident away from an admin-only route", () => {
    renderAsRole("RESIDENT");
    expect(screen.getByText("Unauthorized Page")).toBeInTheDocument();
    expect(screen.queryByText("Admin Dashboard")).not.toBeInTheDocument();
  });

  it("redirects an unauthenticated user to login", () => {
    renderAsRole(null);
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});
