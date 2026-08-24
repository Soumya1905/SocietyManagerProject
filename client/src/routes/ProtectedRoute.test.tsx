import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import * as AuthContextModule from "../context/AuthContext";

vi.mock("../context/AuthContext", async () => {
  const actual = await vi.importActual<typeof AuthContextModule>("../context/AuthContext");
  return { ...actual, useAuth: vi.fn() };
});

function renderWithAuth(authState: Partial<ReturnType<typeof AuthContextModule.useAuth>>) {
  vi.mocked(AuthContextModule.useAuth).mockReturnValue({
    user: null,
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    ...authState,
  });

  return render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("redirects to login when there is no authenticated user", () => {
    renderWithAuth({ user: null, loading: false });
    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("renders the protected content when a user is authenticated", () => {
    renderWithAuth({
      user: {
        id: "1",
        fullName: "Test User",
        email: "test@example.com",
        apartmentNumber: "A-1",
        role: "RESIDENT",
        createdAt: "",
        updatedAt: "",
      },
      loading: false,
    });
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
