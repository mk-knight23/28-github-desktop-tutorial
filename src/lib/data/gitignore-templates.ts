/**
 * Bundled .gitignore templates (PRODUCT_SPEC §3.5). Fully offline — no external
 * API. Templates are combined via mergeTemplates(), which deduplicates patterns
 * while keeping a labeled section per selected template.
 */

export interface GitignoreTemplate {
  id: string;
  name: string;
  /** Ordered patterns/comments. Blank strings render as blank lines. */
  patterns: string[];
}

export const GITIGNORE_TEMPLATES: GitignoreTemplate[] = [
  {
    id: "node",
    name: "Node",
    patterns: [
      "# Dependencies",
      "node_modules/",
      "jspm_packages/",
      "",
      "# Logs",
      "logs/",
      "*.log",
      "npm-debug.log*",
      "yarn-debug.log*",
      "yarn-error.log*",
      "pnpm-debug.log*",
      "",
      "# Coverage & caches",
      "coverage/",
      ".npm",
      ".eslintcache",
      "",
      "# Optional package manager metadata",
      ".pnp.*",
    ],
  },
  {
    id: "nextjs",
    name: "Next.js",
    patterns: [
      "# Next.js",
      "/.next/",
      "/out/",
      "next-env.d.ts",
      "",
      "# Production build",
      "/build",
      "",
      "# Vercel",
      ".vercel",
      "",
      "# Env files",
      ".env*.local",
    ],
  },
  {
    id: "python",
    name: "Python",
    patterns: [
      "# Byte-compiled / optimized",
      "__pycache__/",
      "*.py[cod]",
      "*$py.class",
      "",
      "# Virtual environments",
      ".venv/",
      "venv/",
      "env/",
      "",
      "# Distribution / packaging",
      "build/",
      "dist/",
      "*.egg-info/",
      ".eggs/",
      "",
      "# Test & type caches",
      ".pytest_cache/",
      ".mypy_cache/",
      ".ruff_cache/",
      ".coverage",
    ],
  },
  {
    id: "java",
    name: "Java",
    patterns: [
      "# Compiled class files",
      "*.class",
      "",
      "# Packages",
      "*.jar",
      "*.war",
      "*.ear",
      "",
      "# Build output",
      "target/",
      "build/",
      "",
      "# Logs & VM crash logs",
      "*.log",
      "hs_err_pid*",
    ],
  },
  {
    id: "gradle",
    name: "Gradle",
    patterns: [
      "# Gradle",
      ".gradle/",
      "build/",
      "gradle-app.setting",
      "!gradle-wrapper.jar",
      ".gradletasknamecache",
    ],
  },
  {
    id: "go",
    name: "Go",
    patterns: [
      "# Binaries",
      "*.exe",
      "*.exe~",
      "*.dll",
      "*.so",
      "*.dylib",
      "",
      "# Test binary and coverage",
      "*.test",
      "*.out",
      "",
      "# Dependency directory (legacy)",
      "vendor/",
      "",
      "# Go workspace file",
      "go.work",
    ],
  },
  {
    id: "rust",
    name: "Rust",
    patterns: [
      "# Build output",
      "/target/",
      "",
      "# Backup files from rustfmt",
      "**/*.rs.bk",
      "",
      "# MSVC debug files",
      "*.pdb",
    ],
  },
  {
    id: "unity",
    name: "Unity",
    patterns: [
      "# Unity generated",
      "[Ll]ibrary/",
      "[Tt]emp/",
      "[Oo]bj/",
      "[Bb]uild/",
      "[Bb]uilds/",
      "[Ll]ogs/",
      "[Uu]serSettings/",
      "",
      "# Asset meta data (keep meta for used assets)",
      "*.pidb.meta",
      "*.pdb.meta",
    ],
  },
  {
    id: "macos",
    name: "macOS",
    patterns: [
      "# macOS",
      ".DS_Store",
      ".AppleDouble",
      ".LSOverride",
      "._*",
      ".Spotlight-V100",
      ".Trashes",
    ],
  },
  {
    id: "windows",
    name: "Windows",
    patterns: [
      "# Windows",
      "Thumbs.db",
      "Thumbs.db:encryptable",
      "ehthumbs.db",
      "Desktop.ini",
      "$RECYCLE.BIN/",
      "*.lnk",
    ],
  },
  {
    id: "linux",
    name: "Linux",
    patterns: [
      "# Linux",
      "*~",
      ".fuse_hidden*",
      ".directory",
      ".Trash-*",
      ".nfs*",
    ],
  },
  {
    id: "jetbrains",
    name: "JetBrains IDEs",
    patterns: [
      "# JetBrains (IntelliJ, WebStorm, PyCharm, …)",
      ".idea/",
      "*.iml",
      "*.iws",
      "*.ipr",
      "out/",
    ],
  },
  {
    id: "vscode",
    name: "VS Code",
    patterns: [
      "# Visual Studio Code",
      ".vscode/*",
      "!.vscode/settings.json",
      "!.vscode/tasks.json",
      "!.vscode/launch.json",
      "!.vscode/extensions.json",
      "*.code-workspace",
    ],
  },
];

export const TEMPLATES_BY_ID = new Map(
  GITIGNORE_TEMPLATES.map((t) => [t.id, t] as const),
);

/**
 * Merge the selected templates into one .gitignore.
 * - Each template becomes a labeled section (### Name).
 * - A pattern already emitted by an earlier section is skipped to avoid dupes.
 * - Comments and blank lines are preserved within a section but not deduped.
 */
export function mergeTemplates(ids: string[]): string {
  const seenPatterns = new Set<string>();
  const sections: string[] = [];
  const header = [
    "# .gitignore generated with MK GitFlow",
    "# https://gitflow.mkazi.live/gitignore",
  ];

  for (const id of ids) {
    const template = TEMPLATES_BY_ID.get(id);
    if (!template) continue;
    const lines: string[] = [`### ${template.name}`];
    for (const raw of template.patterns) {
      const line = raw;
      const isPattern = line.trim() !== "" && !line.trim().startsWith("#");
      if (isPattern) {
        const key = line.trim();
        if (seenPatterns.has(key)) continue;
        seenPatterns.add(key);
      }
      lines.push(line);
    }
    sections.push(lines.join("\n"));
  }

  if (sections.length === 0) return "";
  return `${header.join("\n")}\n\n${sections.join("\n\n")}\n`;
}
