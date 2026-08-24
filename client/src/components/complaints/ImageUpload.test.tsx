import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImageUpload } from "./ImageUpload";

function makeFile(name: string, type: string, sizeInBytes: number): File {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: sizeInBytes });
  return file;
}

describe("ImageUpload validation", () => {
  it("accepts a valid JPEG under the size limit", async () => {
    const onChange = vi.fn();
    render(<ImageUpload onChange={onChange} />);
    const user = userEvent.setup();

    const input = screen.getByLabelText(/upload photo/i, { selector: "input" });
    const file = makeFile("photo.jpg", "image/jpeg", 1024 * 1024);
    await user.upload(input, file);

    expect(onChange).toHaveBeenCalledWith(file);
    expect(screen.queryByText(/only jpeg/i)).not.toBeInTheDocument();
  });

  it("rejects a disallowed file type", async () => {
    const onChange = vi.fn();
    render(<ImageUpload onChange={onChange} />);
    const user = userEvent.setup({ applyAccept: false });

    const input = screen.getByLabelText(/upload photo/i, { selector: "input" });
    const file = makeFile("document.pdf", "application/pdf", 1024);
    await user.upload(input, file);

    expect(await screen.findByText(/only jpeg, png, webp, or gif/i)).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalledWith(file);
  });

  it("rejects a file larger than 5MB", async () => {
    const onChange = vi.fn();
    render(<ImageUpload onChange={onChange} />);
    const user = userEvent.setup();

    const input = screen.getByLabelText(/upload photo/i, { selector: "input" });
    const file = makeFile("huge.png", "image/png", 6 * 1024 * 1024);
    await user.upload(input, file);

    expect(await screen.findByText(/smaller than 5mb/i)).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalledWith(file);
  });
});
