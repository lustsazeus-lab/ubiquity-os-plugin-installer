import { describe, expect, it } from "@jest/globals";
import { resolvePluginReference } from "../static/utils/strings";

describe("resolvePluginReference", () => {
  const conversationRewards = "ubiquity-os-marketplace/text-conversation-rewards";
  const daemonPricing = "ubiquity-os-marketplace/daemon-pricing";

  it("preserves org/repo references", () => {
    expect(resolvePluginReference(conversationRewards)).toBe(conversationRewards);
  });

  it("strips @ref from org/repo@ref references", () => {
    expect(resolvePluginReference(`${conversationRewards}@development`)).toBe(conversationRewards);
  });

  it("extracts org/repo from GitHub URLs", () => {
    expect(resolvePluginReference("https://github.com/ubiquity-os-marketplace/daemon-pricing")).toBe(daemonPricing);
  });

  it("does not treat non-GitHub hosts as GitHub URLs", () => {
    expect(resolvePluginReference("https://evilgithub.com/attacker/repo", "daemon-pricing")).toBe(daemonPricing);
  });

  it("strips .git suffix from GitHub repository URLs", () => {
    expect(resolvePluginReference("https://github.com/ubiquity-os-marketplace/daemon-pricing.git")).toBe(daemonPricing);
  });

  it("falls back to marketplace org + repo for worker URLs", () => {
    expect(resolvePluginReference("https://ubiquity-os-daemon-pricing-development.ubiquity.workers.dev", "daemon-pricing")).toBe(daemonPricing);
  });
});
