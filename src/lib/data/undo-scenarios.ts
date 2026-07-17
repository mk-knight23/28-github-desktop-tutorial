/**
 * Undo / recovery decision helper (PRODUCT_SPEC §3.7).
 *
 * Deterministic scenarios. Each resolves to a recovery recipe with commands
 * (risk-graded) and a plain "if this doesn't match, safest next step" fallback.
 * Display-only — the site never runs these.
 */

import type { RiskLevel } from "@/lib/git-engine";

export interface RecoveryStep {
  text: string;
  command?: string;
  risk?: RiskLevel;
  /** Required when the step's command is destructive. */
  consequence?: string;
  saferAlternative?: string;
}

export interface UndoScenario {
  slug: string;
  title: string;
  /** Short symptom shown on the picker card. */
  symptom: string;
  detail: string;
  steps: RecoveryStep[];
  fallback: string;
  related: string[];
}

export const UNDO_SCENARIOS: UndoScenario[] = [
  {
    slug: "committed-wrong-branch",
    title: "I committed to the wrong branch",
    symptom: "The commit landed on main (or another branch) instead of my feature branch.",
    detail:
      "Nothing is lost. You can move the commit to the right branch by creating (or switching to) the correct branch from where you are, then resetting the wrong branch back one commit. This works as long as you have not pushed.",
    steps: [
      {
        text: "Create a branch here (or switch to your feature branch), carrying the commit with you.",
        command: "git switch -c feature/my-work",
        risk: "safe",
      },
      {
        text: "Switch back to the branch that got the commit by mistake.",
        command: "git switch main",
        risk: "safe",
      },
      {
        text: "Move that branch back one commit. The change now lives only on your feature branch.",
        command: "git reset --hard HEAD~1",
        risk: "destructive",
        consequence: "Discards uncommitted changes on main and removes the last commit from it — safe here only because the commit is preserved on your feature branch.",
        saferAlternative: "git reset --soft HEAD~1 if you also have uncommitted work to keep.",
      },
    ],
    fallback:
      "If the commit was already pushed to a shared branch, do not reset. Instead cherry-pick it onto the right branch and use git revert on the wrong branch.",
    related: ["undo-last-commit-keep-changes", "detached-head"],
  },
  {
    slug: "undo-last-commit-keep-changes",
    title: "I need to undo my last commit but keep the changes",
    symptom: "I committed too early and want the changes back as edits, not a commit.",
    detail:
      "A soft or mixed reset moves the branch back one commit while keeping your work. Soft keeps it staged; mixed (the default) keeps it unstaged. Neither deletes anything.",
    steps: [
      {
        text: "Undo the commit but keep the changes staged, ready to recommit.",
        command: "git reset --soft HEAD~1",
        risk: "caution",
        saferAlternative: "git reset HEAD~1 leaves the changes unstaged instead.",
      },
      {
        text: "Or keep the changes in your working tree, unstaged.",
        command: "git reset HEAD~1",
        risk: "caution",
      },
    ],
    fallback:
      "If you only want to change the message or add a forgotten file, use git commit --amend instead of resetting.",
    related: ["wrong-commit-message", "committed-wrong-branch"],
  },
  {
    slug: "undo-pushed-commit",
    title: "I need to undo a commit I already pushed",
    symptom: "The bad commit is already on the remote and other people may have it.",
    detail:
      "Do not rewrite shared history. The safe way to undo a pushed commit is git revert, which adds a new commit that reverses the change. Everyone gets the fix by pulling normally.",
    steps: [
      {
        text: "Create a new commit that undoes the pushed one.",
        command: "git revert <commit-id>",
        risk: "safe",
      },
      {
        text: "Push the revert like any normal commit.",
        command: "git push",
        risk: "caution",
      },
    ],
    fallback:
      "Only if the branch is truly private to you should you consider git reset plus git push --force-with-lease. On any shared branch, revert is the correct tool.",
    related: ["undo-last-commit-keep-changes", "committed-secret"],
  },
  {
    slug: "lost-commits-after-reset",
    title: "I lost commits after a hard reset",
    symptom: "git reset --hard moved my branch and now commits are gone.",
    detail:
      "Committed work is almost always recoverable. The reflog records every position HEAD has held, including the commit you reset away from. Find it there and reset back to it.",
    steps: [
      {
        text: "List recent HEAD positions to find the lost commit's id.",
        command: "git reflog",
        risk: "safe",
      },
      {
        text: "Move your branch back to the good commit (use the id from the reflog).",
        command: "git reset --hard HEAD@{1}",
        risk: "destructive",
        consequence: "Discards the current working state to jump back — make sure HEAD@{1} is the commit you want first.",
        saferAlternative: "git branch recovered HEAD@{1} to inspect it on a new branch before resetting.",
      },
    ],
    fallback:
      "If the commit is not in the reflog, try git fsck --lost-found to search for dangling commits. Uncommitted changes that were discarded by --hard cannot be recovered.",
    related: ["discard-local-changes", "accidentally-deleted-branch"],
  },
  {
    slug: "discard-local-changes",
    title: "I want to throw away all my uncommitted changes",
    symptom: "My working tree is a mess and I want to start from the last commit.",
    detail:
      "This is genuinely destructive: uncommitted changes are not in history and cannot be recovered once discarded. Consider stashing them instead — a stash is reversible.",
    steps: [
      {
        text: "Recommended first: stash the changes so you can get them back if you change your mind.",
        command: "git stash",
        risk: "safe",
      },
      {
        text: "Discard tracked-file changes and reset to the last commit.",
        command: "git reset --hard HEAD",
        risk: "destructive",
        consequence: "Permanently discards all uncommitted changes to tracked files.",
        saferAlternative: "git stash keeps them recoverable.",
      },
      {
        text: "Also remove untracked files (preview with -n first).",
        command: "git clean -fd",
        risk: "destructive",
        consequence: "Permanently deletes untracked files and folders — they are not in Git and cannot be recovered.",
        saferAlternative: "git clean -n lists what would be deleted without deleting it.",
      },
    ],
    fallback:
      "If you only want to discard changes to one file, use git restore <file> rather than resetting everything.",
    related: ["lost-commits-after-reset", "committed-secret"],
  },
  {
    slug: "wrong-commit-message",
    title: "I typed the wrong commit message",
    symptom: "The last commit's message has a typo or is unclear.",
    detail:
      "If the commit has not been pushed, amend it to rewrite the message in place. If it has been pushed and shared, prefer leaving it — rewording requires a force push.",
    steps: [
      {
        text: "Rewrite the last commit's message.",
        command: 'git commit --amend -m "Corrected message"',
        risk: "caution",
        saferAlternative: "Leave a pushed, shared commit as-is rather than force-pushing a reword.",
      },
    ],
    fallback:
      "To reword an older commit, use git rebase -i and mark it 'reword'. Only do this on commits you have not shared.",
    related: ["undo-last-commit-keep-changes", "undo-pushed-commit"],
  },
  {
    slug: "accidentally-deleted-branch",
    title: "I deleted a branch by mistake",
    symptom: "I ran git branch -D and now the branch is gone.",
    detail:
      "The branch was just a pointer, and its tip commit is still recorded in the reflog for a while. Find the commit id and recreate the branch at it.",
    steps: [
      {
        text: "Find the deleted branch's tip in the reflog.",
        command: "git reflog",
        risk: "safe",
      },
      {
        text: "Recreate the branch at that commit id.",
        command: "git branch feature/recovered <commit-id>",
        risk: "safe",
      },
    ],
    fallback:
      "If the commit is not in your reflog and the branch existed on a remote, fetch it back: git fetch origin, then git switch feature/recovered.",
    related: ["lost-commits-after-reset", "committed-wrong-branch"],
  },
  {
    slug: "committed-secret",
    title: "I committed a secret or a file I shouldn't have",
    symptom: "An API key, password, or large file got committed.",
    detail:
      "First, treat any exposed secret as compromised and rotate it — removing it from history does not un-leak it. If it is only in your last local commit, you can amend it out. If it is deep in history or already pushed, you need a history-rewrite tool and a force push.",
    steps: [
      {
        text: "Rotate the secret immediately. Removing it from Git does not make an exposed key safe.",
        risk: "caution",
      },
      {
        text: "Stop tracking the file but keep it locally, then add it to .gitignore.",
        command: "git rm --cached secrets.env",
        risk: "caution",
      },
      {
        text: "If it is only in the last, unpushed commit, amend it away.",
        command: "git commit --amend --no-edit",
        risk: "caution",
      },
    ],
    fallback:
      "If the secret is spread across older or pushed commits, use git filter-repo (or the BFG Repo-Cleaner) to purge it, then force-push with --force-with-lease and rotate the credential.",
    related: ["undo-pushed-commit", "discard-local-changes"],
  },
  {
    slug: "merge-gone-wrong",
    title: "A merge went wrong and I want out",
    symptom: "I started a merge, hit conflicts, and want to get back to before it.",
    detail:
      "A conflicted merge has not been committed yet, so aborting it is completely safe — it restores your branch to exactly where it was before the merge.",
    steps: [
      {
        text: "Cancel the in-progress merge and return to the pre-merge state.",
        command: "git merge --abort",
        risk: "safe",
      },
      {
        text: "If you already committed the bad merge but have not pushed, undo it.",
        command: "git reset --hard ORIG_HEAD",
        risk: "destructive",
        consequence: "Discards the merge commit and any uncommitted changes, returning to the pre-merge tip.",
        saferAlternative: "git revert -m 1 <merge-id> undoes a pushed merge without rewriting history.",
      },
    ],
    fallback:
      "For a rebase instead of a merge, the equivalent escape hatch is git rebase --abort.",
    related: ["undo-pushed-commit", "lost-commits-after-reset"],
  },
  {
    slug: "detached-head",
    title: "I'm in detached HEAD state",
    symptom: "Git says 'detached HEAD' and I'm not sure what that means.",
    detail:
      "You checked out a specific commit instead of a branch, so new commits would not belong to any branch. Nothing is broken. If you made no commits, just switch back to a branch. If you did commit, capture them on a branch first.",
    steps: [
      {
        text: "If you made new commits here, save them on a branch before leaving.",
        command: "git switch -c keep-my-work",
        risk: "safe",
      },
      {
        text: "Otherwise, simply return to a real branch.",
        command: "git switch main",
        risk: "safe",
      },
    ],
    fallback:
      "If you already left detached HEAD and lost track of commits made there, find them with git reflog and create a branch at that id.",
    related: ["accidentally-deleted-branch", "committed-wrong-branch"],
  },
];

const BY_SLUG = new Map(UNDO_SCENARIOS.map((s) => [s.slug, s] as const));

export function getScenario(slug: string): UndoScenario | undefined {
  return BY_SLUG.get(slug);
}
