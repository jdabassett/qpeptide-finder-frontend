import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UniversalModal from "@/components/modals/UniversalModal";

const useDeviceMock = vi.fn(() => ({ isMobile: false }));

vi.mock("@/components/providers/DeviceProvider", () => ({
  useDevice: () => useDeviceMock(),
}));

describe("UniversalModal", () => {
  beforeEach(() => {
    useDeviceMock.mockReturnValue({ isMobile: false });
  });

  afterEach(() => {
    document.body.style.overflow = "";
    vi.clearAllMocks();
  });

  it("renders nothing when isOpen is false", () => {
    render(
      <UniversalModal isOpen={false} onClose={() => {}} title="Hidden">
        <p>body</p>
      </UniversalModal>
    );

    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
    expect(screen.queryByText("body")).not.toBeInTheDocument();
  });

  it("renders title and children when open", () => {
    render(
      <UniversalModal isOpen onClose={() => {}} title="My modal">
        <p>Hello modal</p>
      </UniversalModal>
    );

    expect(screen.getByText("My modal")).toBeInTheDocument();
    expect(screen.getByText("Hello modal")).toBeInTheDocument();
  });

  it("calls onClose when Escape is pressed", async () => {
    const onClose = vi.fn();
    render(
      <UniversalModal isOpen onClose={onClose} title="Modal">
        <p />
      </UniversalModal>
    );

    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the X close button is clicked", async () => {
    const onClose = vi.fn();
    render(
      <UniversalModal isOpen onClose={onClose} title="Modal">
        <p />
      </UniversalModal>
    );

    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});