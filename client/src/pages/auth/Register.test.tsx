import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Register from "./Register";
import { AuthProvider } from "../../context/AuthContext";
import { ToastProvider } from "../../context/ToastContext";
import * as authService from "../../services/authService";

vi.mock("../../services/authService");

function renderRegister() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>
  );
}

describe("Registration validation", () => {
  it("requires a full name of at least 2 characters", async () => {
    renderRegister();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Full Name"), "A");
    await user.type(screen.getByLabelText("Email"), "new@example.com");
    await user.type(screen.getByLabelText("Apartment Number"), "A-101");
    await user.type(screen.getByLabelText("Password"), "Password@123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/full name must be at least 2 characters/i)).toBeInTheDocument();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it("requires a password of at least 8 characters", async () => {
    renderRegister();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Full Name"), "New Resident");
    await user.type(screen.getByLabelText("Email"), "new@example.com");
    await user.type(screen.getByLabelText("Apartment Number"), "A-101");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();
  });

  it("requires an apartment number", async () => {
    renderRegister();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Full Name"), "New Resident");
    await user.type(screen.getByLabelText("Email"), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "Password@123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/apartment number is required/i)).toBeInTheDocument();
  });
});
