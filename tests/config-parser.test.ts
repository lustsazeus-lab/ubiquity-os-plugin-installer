import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import YAML from "yaml";

jest.mock("../static/utils/toaster", () => ({
  toastNotification: jest.fn(),
}));

import { ConfigParser } from "../static/scripts/config-parser";

describe("ConfigParser legacy plugin reference matching", () => {
  const daemonPricingReference = "ubiquity-os-marketplace/daemon-pricing";

  beforeEach(() => {
    const storageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };

    Object.defineProperty(globalThis, "localStorage", {
      value: storageMock,
      configurable: true,
    });
  });

  it("updates existing worker URL entries instead of creating duplicates", () => {
    const parser = new ConfigParser();
    parser.repoConfig = YAML.stringify({
      plugins: [
        {
          uses: [
            {
              plugin: "https://ubiquity-os-daemon-pricing-development.ubiquity.workers.dev",
              with: { old: true },
            },
          ],
        },
      ],
    });

    parser.addPlugin({
      uses: [
        {
          plugin: daemonPricingReference,
          with: { old: false, updated: true },
        },
      ],
    });

    const parsed = parser.parseConfig(parser.newConfigYml);
    expect(parsed.plugins).toHaveLength(1);
    expect(parsed.plugins[0].uses[0].plugin).toBe(daemonPricingReference);
    expect(parsed.plugins[0].uses[0].with).toEqual({ old: false, updated: true });
  });

  it("removes legacy @ref plugin entries when removing normalized org/repo", () => {
    const parser = new ConfigParser();
    parser.repoConfig = YAML.stringify({
      plugins: [
        {
          uses: [
            {
              plugin: "ubiquity-os-marketplace/daemon-pricing@development",
              with: { enabled: true },
            },
          ],
        },
      ],
    });

    parser.removePlugin({
      uses: [
        {
          plugin: daemonPricingReference,
          with: {},
        },
      ],
    });

    const parsed = parser.parseConfig(parser.newConfigYml);
    expect(parsed.plugins).toHaveLength(0);
  });
});
