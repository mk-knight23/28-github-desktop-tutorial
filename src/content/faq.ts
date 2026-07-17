/**
 * FAQ content (PRODUCT_SPEC §5, ≥10 real Q&As, incl. the GitFlow-name
 * disambiguation). Plain-text answers so they can drive FAQPage JSON-LD as well
 * as the rendered page. Grouped for the page; flattened for structured data.
 */

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface FaqGroup {
  heading: string;
  entries: readonly FaqEntry[];
}

export const FAQ_GROUPS: readonly FaqGroup[] = [
  {
    heading: "About the product",
    entries: [
      {
        question: "Is this the GitFlow branching model?",
        answer:
          "No. The name is a brand for this learning platform, not an endorsement of the nvie GitFlow branching model. This site teaches Git mechanics — commits, branches, merges, rebases — so you can choose whatever branching strategy fits your team. The full nvie model is covered as one option among several in the branch-strategies guide.",
      },
      {
        question: "Does this run real Git commands on my computer?",
        answer:
          "No, and this is a core product principle. The site never executes shell or Git commands. The simulator runs a Git graph entirely in memory in your browser, and everywhere else commands are shown with a copy button for you to run yourself. There is no way for the site to touch a real repository.",
      },
      {
        question: "Do I need an account?",
        answer:
          "No. There are no accounts and no sign-in. Everything works anonymously. Your tutorial progress, quiz scores, simulator sessions, and saved analyses are stored locally in your browser, not on a server.",
      },
      {
        question: "Is it free and open source?",
        answer:
          "Yes. MK GitFlow is free to use and released under the MIT license. The full source is on GitHub, and you're welcome to read it, fork it, or contribute.",
      },
    ],
  },
  {
    heading: "Privacy and data",
    entries: [
      {
        question: "Where is my data stored?",
        answer:
          "In your browser. Progress, scores, simulator sessions, and repo analyses live in IndexedDB on your device. Small preferences like theme and cookie consent use localStorage. None of it is uploaded to a server, and you can export or clear all of it from the settings page.",
      },
      {
        question: "Do you use analytics or tracking cookies?",
        answer:
          "Only if you accept them. Analytics are off by default. Nothing loads until you choose Accept on the cookie banner, and even then only in production with an analytics id configured. You can change your choice any time on the cookies or settings page. Analytics events never include command text, repo names, quiz content, error logs, or keys.",
      },
      {
        question: "What happens to text I paste into the AI assistant?",
        answer:
          "When you run an AI capability, your input is sent to the AI gateway to generate a response and is not logged or stored on our server. If you bring your own API key, it is held only in your browser and sent per request as a header; it is never logged or stored server-side.",
      },
      {
        question: "Does the repo analyzer need a GitHub token?",
        answer:
          "No. The analyzer uses GitHub's public, unauthenticated API and only reads public data. It never asks for a token and cannot see private repositories.",
      },
    ],
  },
  {
    heading: "Using the tools",
    entries: [
      {
        question: "Which Git operations does the simulator support?",
        answer:
          "Commit, branch, checkout, merge (fast-forward and true merges), rebase, and reset (soft, mixed, and hard). Every operation is a pure in-memory transformation, so you can undo step by step, reset the session, and export or import it as JSON.",
      },
      {
        question: "Do the AI features work without an API key?",
        answer:
          "Partly. Several capabilities have deterministic, clearly-labeled local fallbacks that work with no key at all — turning a description into a git command, building a commit message from a diff, drafting a PR description, and generating release notes. The remaining AI-only capabilities show an honest 'AI unavailable' state, and you can optionally supply your own key to enable them.",
      },
      {
        question: "How is the repo docs-health score calculated?",
        answer:
          "From a documented, deterministic rubric: presence and quality of the README, a license, community files like CONTRIBUTING and CODE_OF_CONDUCT, a security policy, issue and PR templates, workflows, and releases. It's a measure of how approachable a project is, not a judgment of its code quality.",
      },
      {
        question: "Can I use this offline?",
        answer:
          "The deterministic tools do. The simulator, command reference, .gitignore generator, commit builder, undo helper, tutorials, and quizzes all run in your browser and work offline after the first load. Only the AI assistant and the repo analyzer need a network connection, since they call external services.",
      },
    ],
  },
  {
    heading: "Learning with it",
    entries: [
      {
        question: "I'm a complete beginner. Where should I start?",
        answer:
          "Open the simulator and run a few commits and a branch to see the graph move, then read the 'reading the commit graph' guide for the vocabulary. After that, follow the GitHub Desktop beginner tutorial, which walks the everyday workflow with checkpoints you can mark off.",
      },
      {
        question: "What does a command's risk level mean?",
        answer:
          "Every command in the reference is labeled safe, caution, or destructive — always as color, an icon, and a text label together, never color alone. Destructive commands also show a one-line consequence and a safer alternative, and require a deliberate second step before you can copy them.",
      },
    ],
  },
];

/** Flattened list for FAQPage JSON-LD. */
export const FAQ_FLAT = FAQ_GROUPS.flatMap((group) => group.entries);
