export const STRINGS = {
  TDV_CENTERED: "table-data-value centered",
  SELECT_ITEMS: ".select-items",
  SELECT_SELECTED: ".select-selected",
  SELECT_HIDE: "select-hide",
  SELECT_ARROW_ACTIVE: "select-arrow-active",
  FAILED_TO_LOAD_TEMPLATE: "Failed to load template",
  DATA_SELECTED: "data-selected",
  PICKER_SELECT: "picker-select",
};

function parseGitHubLikeUrl(input: string): URL | null {
  try {
    const parsed = new URL(input);
    const host = parsed.hostname.toLowerCase();
    if (host === "github.com" || host === "raw.githubusercontent.com") {
      return parsed;
    }
  } catch {
    // Not a URL; ignore and allow other parsing branches.
  }

  return null;
}

function sanitizeRepoName(repo: string): string {
  return repo.replace(/\.git$/i, "");
}

/**
 * For manifest URLs from GitHub, extracts just the repo name.
 * For all other URLs (workers, etc), returns the full URL.
 * This allows for flexible matching without assuming URL formats.
 */
export function extractPluginIdentifier(url: string): string {
  // For GitHub manifest URLs, extract just the repo name
  const parsed = parseGitHubLikeUrl(url);
  if (parsed) {
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return sanitizeRepoName(parts[1].split("@")[0].split("?")[0]); // Get repo name without branch or query params
    }
  }

  // For all other URLs (workers, etc), use the full URL
  return url;
}

const ORG_REPO_PATTERN = /^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)(?:@.+)?$/;

/**
 * Returns an org/repo plugin reference from any known plugin source.
 * - Preserves already-valid org/repo values (including values with @ref by stripping the ref)
 * - Extracts org/repo from GitHub URLs
 * - Falls back to `fallbackOrg/fallbackRepo` for worker URLs and other formats
 */
export function resolvePluginReference(pluginSource: string | null | undefined, fallbackRepo?: string, fallbackOrg = "ubiquity-os-marketplace"): string | null {
  const normalizedSource = pluginSource?.trim();

  if (normalizedSource) {
    const orgRepoMatch = normalizedSource.match(ORG_REPO_PATTERN);
    if (orgRepoMatch) {
      return `${orgRepoMatch[1]}/${orgRepoMatch[2]}`;
    }

    const parsed = parseGitHubLikeUrl(normalizedSource);
    if (parsed) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        return `${parts[0]}/${sanitizeRepoName(parts[1].split("@")[0].split("?")[0])}`;
      }
    }
  }

  const normalizedFallbackRepo = fallbackRepo?.trim();
  if (normalizedFallbackRepo) {
    const fallbackRepoName = sanitizeRepoName(normalizedFallbackRepo.split("@")[0].split("?")[0]);
    return `${fallbackOrg.trim()}/${fallbackRepoName}`;
  }

  return null;
}
