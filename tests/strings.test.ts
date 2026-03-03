import { describe, expect, it } from "@jest/globals";
import { resolvePluginReference } from "../static/utils/strings";

describe("resolvePluginReference", () => {
  const conversationRewards = "ubiquity-os-marketplace/text-conversation-rewards";

  it("preserves org/repo references", () => {
    expect(resolvePluginReference(conversationRewards)).toBe(conversationRewards);
  });

  it("strips @ref from org/repo@ref references", () => {
    expect(resolvePluginReference(`${conversationRewards}@development`)).toBe(conversationRewards);
  });

  it("extracts org/repo from GitHub URLs", () => {
    expect(resolvePluginReference("https://github.com/ubiquity-os-marketplace/daemon-pricing")).toBe("ubiquity-os-marketplace/daemon-pricing");
  });

  it("falls back to marketplace org + repo for worker URLs", () => {
    expect(resolvePluginReference("https://ubiquity-os-daemon-pricing-development.ubiquity.workers.dev", "daemon-pricing")).toBe(
      "ubiquity-os-marketplace/daemon-pricing"
    );
  });
});
