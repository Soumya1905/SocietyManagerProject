import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";
import { AuthProvider } from "../../context/AuthContext";
import { ToastProvider } from "../../context/ToastContext";
import * as authService from "../../services/authService";

vi.mock("../../services/authService");

function renderLogin() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>
  );
}

describe("Login validation", () => {
  it("shows a validation error for an invalid email", async () => {
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Password"), "somepassword");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/enter a valid email address/i)).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it("shows a validation error when the password is empty", async () => {
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Email"), "resident@example.com");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  it("submits valid credentials", async () => {
    vi.mocked(authService.login).mockResolvedValue({
      token: "fake-token",
      user: {
        id: "1",
        fullName: "Test Resident",
        email: "resident@example.com",
        apartmentNumber: "A-101",
        role: "RESIDENT",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Email"), "resident@example.com");
    await user.type(screen.getByLabelText("Password"), "Password@123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(authService.login).toHaveBeenCalledWith({
      email: "resident@example.com",
      password: "Password@123",
    }));
  });
});
