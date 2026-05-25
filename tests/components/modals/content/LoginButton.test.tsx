import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginButton from "@/components/modals/content/LoginButton";

describe("LoginButton", () => {
  it("renders the provided text and icon", () => {
    render(
      <LoginButton
        connection="google-oauth2"
        text="Google"
        icon={<svg data-testid="login-icon" />}
        onClick={() => {}}
      />
    );

    expect(
      screen.getByRole("button", { name: /google/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId("login-icon")).toBeInTheDocument();
  });

  it("calls onClick with the connection when clicked", async () => {
    const onClick = vi.fn();

    render(
      <LoginButton
        connection="github"
        text="GitHub"
        icon={null}
        onClick={onClick}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /github/i }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith("github");
  });
});
