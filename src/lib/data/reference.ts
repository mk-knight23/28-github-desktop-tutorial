/**
 * Risk-graded Git command reference (PRODUCT_SPEC §3.4).
 *
 * Each command carries a risk level (safe / caution / destructive) rendered with
 * the color + icon + label treatment, plus undo guidance and related commands.
 * Destructive entries include a one-line consequence and a safer alternative.
 *
 * This data is display-only. The site never executes any command.
 */

import type { RiskLevel } from "@/lib/git-engine";

export interface RefExample {
  command: string;
  note: string;
}

export interface RefCommand {
  slug: string;
  name: string;
  category: RefCategory;
  summary: string;
  syntax: string;
  explanation: string;
  examples: RefExample[];
  risk: RiskLevel;
  /** Required for destructive commands (DESIGN_SYSTEM.md §9.3). */
  consequence?: string;
  saferAlternative?: string;
  undo: string;
  related: string[];
}

export type RefCategory =
  | "Setup"
  | "Snapshotting"
  | "Branching"
  | "Merging & rebasing"
  | "Inspection"
  | "Undoing"
  | "Remotes"
  | "Stashing"
  | "Advanced";

export const REF_CATEGORIES: RefCategory[] = [
  "Setup",
  "Snapshotting",
  "Branching",
  "Merging & rebasing",
  "Inspection",
  "Undoing",
  "Remotes",
  "Stashing",
  "Advanced",
];

export const REFERENCE: RefCommand[] = [
  {
    slug: "git-init",
    name: "git init",
    category: "Setup",
    summary: "Start tracking a project by creating a new repository.",
    syntax: "git init [directory]",
    explanation:
      "Creates a hidden .git folder in the current directory (or the one you name). From that point on Git can record snapshots of your files. Running it in a folder that already has a repository does nothing harmful — it just reports the repo already exists.",
    examples: [
      { command: "git init", note: "Turn the current folder into a repository." },
      { command: "git init my-app", note: "Create a folder and a repository in one step." },
    ],
    risk: "safe",
    undo: "Delete the .git directory to stop tracking. Your files are untouched.",
    related: ["git-clone", "git-status", "git-config"],
  },
  {
    slug: "git-clone",
    name: "git clone",
    category: "Setup",
    summary: "Copy an existing repository, including its full history.",
    syntax: "git clone <url> [directory]",
    explanation:
      "Downloads a repository and its complete history, then sets up a remote named origin pointing back at the source. This is how you get a local copy of a project on GitHub.",
    examples: [
      {
        command: "git clone https://github.com/user/repo.git",
        note: "Clone into a folder named after the repo.",
      },
      { command: "git clone <url> my-folder", note: "Clone into a folder you name." },
    ],
    risk: "safe",
    undo: "Delete the cloned folder. Nothing on the remote is affected.",
    related: ["git-init", "git-remote", "git-fetch"],
  },
  {
    slug: "git-config",
    name: "git config",
    category: "Setup",
    summary: "Read or change Git settings like your name and email.",
    syntax: "git config [--global] <key> <value>",
    explanation:
      "Sets configuration values. --global applies to every repository for your user; without it the change is local to the current repository. Setting your name and email is required before your first commit.",
    examples: [
      { command: 'git config --global user.name "Your Name"', note: "Set your commit author name." },
      { command: 'git config --global user.email "you@example.com"', note: "Set your commit email." },
      { command: "git config --list", note: "Show every effective setting." },
    ],
    risk: "caution",
    undo: "Run git config again with the old value, or edit .git/config (local) or ~/.gitconfig (global).",
    related: ["git-init", "git-commit"],
  },
  {
    slug: "git-status",
    name: "git status",
    category: "Inspection",
    summary: "See what has changed and what is staged for the next commit.",
    syntax: "git status [-s]",
    explanation:
      "Shows the current branch, files staged for commit, files changed but not staged, and untracked files. It is the safest command in Git — read-only and worth running constantly.",
    examples: [
      { command: "git status", note: "Full, verbose status." },
      { command: "git status -s", note: "Short one-line-per-file format." },
    ],
    risk: "safe",
    undo: "Nothing to undo — status only reads.",
    related: ["git-add", "git-diff", "git-log"],
  },
  {
    slug: "git-add",
    name: "git add",
    category: "Snapshotting",
    summary: "Stage changes so they will be included in the next commit.",
    syntax: "git add <pathspec>",
    explanation:
      "Moves changes into the staging area (the index). Staging lets you build a commit from exactly the changes you choose, rather than everything at once. Nothing is recorded permanently until you commit.",
    examples: [
      { command: "git add file.txt", note: "Stage a single file." },
      { command: "git add .", note: "Stage everything in the current directory." },
      { command: "git add -p", note: "Review and stage changes chunk by chunk." },
    ],
    risk: "safe",
    undo: "git restore --staged <file> unstages without losing the change.",
    related: ["git-commit", "git-restore", "git-status"],
  },
  {
    slug: "git-commit",
    name: "git commit",
    category: "Snapshotting",
    summary: "Record staged changes as a permanent snapshot with a message.",
    syntax: 'git commit -m "message"',
    explanation:
      "Takes everything in the staging area and saves it as a new commit on the current branch. Each commit has a unique id, an author, a timestamp and a message. Commits are cheap and local — nothing leaves your machine until you push.",
    examples: [
      { command: 'git commit -m "Add login form"', note: "Commit staged changes with a message." },
      { command: "git commit", note: "Open your editor to write a longer message." },
    ],
    risk: "safe",
    undo: "git reset --soft HEAD~1 undoes the last commit but keeps your changes staged.",
    related: ["git-add", "git-commit-amend", "git-reset", "git-revert"],
  },
  {
    slug: "git-commit-amend",
    name: "git commit --amend",
    category: "Undoing",
    summary: "Replace the most recent commit with a new one.",
    syntax: 'git commit --amend [-m "message"]',
    explanation:
      "Rewrites the last commit — useful for fixing a typo in the message or adding a forgotten file. Because it creates a new commit id, amending a commit you already pushed will require a force push and can disrupt collaborators.",
    examples: [
      { command: 'git commit --amend -m "Fix message typo"', note: "Reword the last commit." },
      { command: "git commit --amend --no-edit", note: "Add staged changes to the last commit, keep the message." },
    ],
    risk: "caution",
    saferAlternative: "If the commit is already pushed and shared, add a new commit instead of amending.",
    undo: "git reflog shows the pre-amend commit; git reset --soft <old-id> restores it.",
    related: ["git-commit", "git-rebase-interactive", "git-reflog"],
  },
  {
    slug: "git-diff",
    name: "git diff",
    category: "Inspection",
    summary: "Show line-by-line differences between versions of your files.",
    syntax: "git diff [--staged] [<ref>]",
    explanation:
      "By default shows changes you have made but not yet staged. --staged shows what is staged for the next commit. You can also diff between branches or commits. Read-only and safe.",
    examples: [
      { command: "git diff", note: "Unstaged changes in the working tree." },
      { command: "git diff --staged", note: "What the next commit will contain." },
      { command: "git diff main..feature", note: "Difference between two branches." },
    ],
    risk: "safe",
    undo: "Nothing to undo — diff only reads.",
    related: ["git-status", "git-log", "git-show"],
  },
  {
    slug: "git-log",
    name: "git log",
    category: "Inspection",
    summary: "Browse the commit history of the current branch.",
    syntax: "git log [--oneline] [--graph]",
    explanation:
      "Lists commits from newest to oldest with their ids, authors, dates and messages. --oneline condenses each to a single line; --graph draws the branch structure as ASCII art. Read-only.",
    examples: [
      { command: "git log --oneline --graph --all", note: "Compact visual history of every branch." },
      { command: "git log -5", note: "Show the five most recent commits." },
    ],
    risk: "safe",
    undo: "Nothing to undo — log only reads.",
    related: ["git-show", "git-diff", "git-reflog", "git-blame"],
  },
  {
    slug: "git-show",
    name: "git show",
    category: "Inspection",
    summary: "Inspect a single commit and the exact changes it made.",
    syntax: "git show [<ref>]",
    explanation:
      "Displays the metadata and full diff of a commit (or other object). With no argument it shows the most recent commit. Useful for reviewing exactly what one commit changed.",
    examples: [
      { command: "git show", note: "Show the latest commit and its diff." },
      { command: "git show a1b2c3d", note: "Show a specific commit by id." },
    ],
    risk: "safe",
    undo: "Nothing to undo — show only reads.",
    related: ["git-log", "git-diff"],
  },
  {
    slug: "git-branch",
    name: "git branch",
    category: "Branching",
    summary: "List, create or manage branches.",
    syntax: "git branch [name]",
    explanation:
      "With no argument it lists branches and marks the current one. With a name it creates a new branch at the current commit without switching to it. Branches are just movable pointers to commits — creating one is instant and cheap.",
    examples: [
      { command: "git branch", note: "List local branches." },
      { command: "git branch feature/login", note: "Create a branch at the current commit." },
    ],
    risk: "safe",
    undo: "Delete an unwanted new branch with git branch -d <name>.",
    related: ["git-switch", "git-checkout-b", "git-branch-d", "git-merge"],
  },
  {
    slug: "git-checkout",
    name: "git checkout",
    category: "Branching",
    summary: "Switch branches or restore files (older, multi-purpose command).",
    syntax: "git checkout <branch|commit|-- file>",
    explanation:
      "Historically the do-everything command: it switches branches, checks out commits (creating a detached HEAD), and restores files. Because it is overloaded, modern Git splits its jobs into git switch (branches) and git restore (files), which are clearer and safer.",
    examples: [
      { command: "git checkout main", note: "Switch to the main branch." },
      { command: "git checkout -- file.txt", note: "Discard unstaged changes to a file." },
    ],
    risk: "caution",
    saferAlternative: "Use git switch to change branches and git restore to discard file changes.",
    undo: "Switching back is safe. Discarding a file with -- cannot be undone unless the change was committed or stashed.",
    related: ["git-switch", "git-restore", "git-checkout-b"],
  },
  {
    slug: "git-checkout-b",
    name: "git checkout -b",
    category: "Branching",
    summary: "Create a new branch and switch to it in one step.",
    syntax: "git checkout -b <name>",
    explanation:
      "A shortcut for git branch <name> followed by git switch <name>. Creates the branch at the current commit and moves HEAD onto it. The modern equivalent is git switch -c <name>.",
    examples: [
      { command: "git checkout -b feature/login", note: "Create and switch to a feature branch." },
    ],
    risk: "safe",
    undo: "Switch away, then git branch -d <name> to remove the branch.",
    related: ["git-switch", "git-branch", "git-checkout"],
  },
  {
    slug: "git-switch",
    name: "git switch",
    category: "Branching",
    summary: "Switch branches — the clear, modern replacement for checkout.",
    syntax: "git switch [-c] <branch>",
    explanation:
      "Changes the branch HEAD points at. -c creates a new branch and switches to it. Unlike checkout it only deals with branches, so it is harder to misuse. Git refuses to switch if you have conflicting uncommitted changes, protecting your work.",
    examples: [
      { command: "git switch main", note: "Switch to an existing branch." },
      { command: "git switch -c feature/login", note: "Create and switch to a new branch." },
    ],
    risk: "safe",
    undo: "Switch back to the previous branch — no data is changed.",
    related: ["git-checkout", "git-branch", "git-restore"],
  },
  {
    slug: "git-merge",
    name: "git merge",
    category: "Merging & rebasing",
    summary: "Combine another branch's history into the current branch.",
    syntax: "git merge <branch>",
    explanation:
      "Brings the commits from another branch into your current one. If your branch has no new commits, Git fast-forwards the pointer. Otherwise it creates a merge commit with two parents, preserving the true shape of history. Conflicts pause the merge for you to resolve.",
    examples: [
      { command: "git merge feature/login", note: "Merge a feature branch into the current branch." },
      { command: "git merge --no-ff feature/login", note: "Always create a merge commit for a clear record." },
    ],
    risk: "caution",
    saferAlternative: "Commit or stash your work first so a conflict never touches uncommitted changes.",
    undo: "Before pushing: git reset --hard ORIG_HEAD. Mid-conflict: git merge --abort.",
    related: ["git-rebase", "git-merge-abort", "git-pull"],
  },
  {
    slug: "git-merge-abort",
    name: "git merge --abort",
    category: "Merging & rebasing",
    summary: "Cancel an in-progress merge and return to before it started.",
    syntax: "git merge --abort",
    explanation:
      "When a merge stops on conflicts, this command throws away the half-finished merge and restores your branch to exactly where it was before you ran git merge. It is the safe escape hatch from a conflict you do not want to resolve right now.",
    examples: [
      { command: "git merge --abort", note: "Bail out of a conflicted merge cleanly." },
    ],
    risk: "safe",
    undo: "Nothing to undo — it returns you to the pre-merge state.",
    related: ["git-merge", "git-rebase-abort"],
  },
  {
    slug: "git-rebase",
    name: "git rebase",
    category: "Merging & rebasing",
    summary: "Replay your commits on top of another branch for a linear history.",
    syntax: "git rebase <base>",
    explanation:
      "Takes the commits unique to your branch, sets them aside, moves your branch to the tip of the base branch, and replays your commits one by one. The result is a straight line with no merge commit. Because replayed commits get new ids, rebasing commits you have already shared can disrupt collaborators.",
    examples: [
      { command: "git rebase main", note: "Replay the current branch on top of main." },
      { command: "git rebase --onto main old-base feature", note: "Move a branch to a new base." },
    ],
    risk: "caution",
    saferAlternative: "Only rebase commits you have not pushed. For shared branches, prefer git merge.",
    undo: "git reflog then git reset --hard <pre-rebase-id>, or git rebase --abort mid-rebase.",
    related: ["git-merge", "git-rebase-interactive", "git-rebase-abort", "git-reflog"],
  },
  {
    slug: "git-rebase-interactive",
    name: "git rebase -i",
    category: "Merging & rebasing",
    summary: "Rewrite a series of commits: reorder, squash, edit or drop them.",
    syntax: "git rebase -i <base>",
    explanation:
      "Opens an editor listing the commits to replay, letting you squash them together, reword messages, reorder, edit, or delete them. It is powerful for cleaning up history before sharing. Because it rewrites commit ids, doing this to already-pushed commits requires a force push and rewrites shared history.",
    examples: [
      { command: "git rebase -i HEAD~3", note: "Rewrite the last three commits." },
      { command: "git rebase -i main", note: "Clean up every commit since main." },
    ],
    risk: "destructive",
    consequence: "Rewrites commit history; commits are replaced with new ids and deleting a line drops that commit.",
    saferAlternative: "Only rewrite local, unpushed commits. Create a backup branch first: git branch backup",
    undo: "git reflog shows the original commits; git reset --hard <original-id> restores them.",
    related: ["git-rebase", "git-commit-amend", "git-reflog", "git-push-force"],
  },
  {
    slug: "git-rebase-abort",
    name: "git rebase --abort",
    category: "Merging & rebasing",
    summary: "Cancel an in-progress rebase and restore the original branch.",
    syntax: "git rebase --abort",
    explanation:
      "Stops a rebase that has paused on a conflict and puts your branch back exactly where it was before the rebase began. The safe way out when a rebase gets messy.",
    examples: [
      { command: "git rebase --abort", note: "Undo a conflicted rebase in progress." },
    ],
    risk: "safe",
    undo: "Nothing to undo — it returns you to the pre-rebase state.",
    related: ["git-rebase", "git-merge-abort"],
  },
  {
    slug: "git-reset",
    name: "git reset",
    category: "Undoing",
    summary: "Move the current branch pointer, optionally changing staging and files.",
    syntax: "git reset [--soft|--mixed|--hard] <ref>",
    explanation:
      "Moves the branch you are on to point at a different commit. --soft keeps your changes staged, --mixed (the default) keeps them in the working tree unstaged, and --hard discards them entirely. The first two are recoverable; --hard is not.",
    examples: [
      { command: "git reset --soft HEAD~1", note: "Undo the last commit, keep changes staged." },
      { command: "git reset HEAD~1", note: "Undo the last commit, keep changes unstaged." },
    ],
    risk: "caution",
    saferAlternative: "Prefer --soft or --mixed. For pushed commits use git revert instead.",
    undo: "git reflog shows where the branch was; git reset --hard <old-id> restores it (except discarded working changes).",
    related: ["git-reset-hard", "git-revert", "git-restore", "git-reflog"],
  },
  {
    slug: "git-reset-hard",
    name: "git reset --hard",
    category: "Undoing",
    summary: "Move the branch and discard all uncommitted changes.",
    syntax: "git reset --hard <ref>",
    explanation:
      "Moves the current branch to a commit and forces your working tree and staging area to match it exactly. Any uncommitted work is thrown away with no confirmation. Commits left behind can often be recovered from the reflog, but uncommitted changes cannot.",
    examples: [
      { command: "git reset --hard HEAD", note: "Discard every uncommitted change." },
      { command: "git reset --hard origin/main", note: "Force the branch to match the remote." },
    ],
    risk: "destructive",
    consequence: "Permanently discards uncommitted changes and moves the branch — this cannot be undone for unsaved work.",
    saferAlternative: "git stash saves your changes first; git reset --soft keeps them.",
    undo: "Commits are recoverable via git reflog. Uncommitted changes discarded by --hard are gone.",
    related: ["git-reset", "git-stash", "git-reflog", "git-revert"],
  },
  {
    slug: "git-revert",
    name: "git revert",
    category: "Undoing",
    summary: "Undo a commit by creating a new commit that reverses it.",
    syntax: "git revert <ref>",
    explanation:
      "Instead of deleting history, revert adds a new commit that applies the inverse of an earlier one. Because it never rewrites existing commits, it is the safe way to undo something you have already pushed and shared.",
    examples: [
      { command: "git revert HEAD", note: "Undo the last commit with a new commit." },
      { command: "git revert a1b2c3d", note: "Reverse a specific commit." },
    ],
    risk: "safe",
    undo: "Revert the revert, or reset it away if it has not been pushed.",
    related: ["git-reset", "git-reset-hard", "git-commit"],
  },
  {
    slug: "git-restore",
    name: "git restore",
    category: "Undoing",
    summary: "Discard file changes or unstage files — the modern, focused command.",
    syntax: "git restore [--staged] <file>",
    explanation:
      "Restores files to a previous state. Without --staged it discards unstaged changes in the working tree (which cannot be recovered). With --staged it moves a file out of the staging area while keeping the change. It splits out the file-handling half of the old git checkout.",
    examples: [
      { command: "git restore file.txt", note: "Discard unstaged changes to a file." },
      { command: "git restore --staged file.txt", note: "Unstage a file, keep the change." },
    ],
    risk: "caution",
    saferAlternative: "git stash to set changes aside recoverably instead of discarding them.",
    undo: "Unstaging is reversible. Discarding unstaged changes to a file cannot be undone.",
    related: ["git-add", "git-checkout", "git-reset", "git-stash"],
  },
  {
    slug: "git-clean",
    name: "git clean",
    category: "Undoing",
    summary: "Delete untracked files and directories from the working tree.",
    syntax: "git clean -fd",
    explanation:
      "Removes files Git is not tracking — build output, stray downloads, and anything not committed or ignored. -f is required to actually delete, -d includes directories. Deleted files are not in Git, so they cannot be recovered.",
    examples: [
      { command: "git clean -n", note: "Dry run: list what would be deleted." },
      { command: "git clean -fd", note: "Delete untracked files and folders." },
    ],
    risk: "destructive",
    consequence: "Permanently deletes untracked files and folders; they are not in history and cannot be recovered.",
    saferAlternative: "Run git clean -n first to preview exactly what will be removed.",
    undo: "There is no undo. Preview with -n before running.",
    related: ["git-reset-hard", "git-status", "git-stash"],
  },
  {
    slug: "git-rm",
    name: "git rm",
    category: "Snapshotting",
    summary: "Remove a tracked file and stage the removal.",
    syntax: "git rm <file>",
    explanation:
      "Deletes a file from the working tree and stages that deletion for the next commit. --cached removes it from Git while leaving the file on disk, which is how you stop tracking a file you accidentally committed.",
    examples: [
      { command: "git rm old.txt", note: "Delete a file and stage the removal." },
      { command: "git rm --cached secret.env", note: "Stop tracking a file, keep it on disk." },
    ],
    risk: "destructive",
    consequence: "Deletes the file from disk and stages the removal; the on-disk copy is gone until you commit and can restore it.",
    saferAlternative: "Use --cached to untrack without deleting the local file.",
    undo: "Before committing: git restore --staged <file> then git restore <file>. After committing: git checkout <prev> -- <file>.",
    related: ["git-mv", "git-restore", "git-reset"],
  },
  {
    slug: "git-mv",
    name: "git mv",
    category: "Snapshotting",
    summary: "Rename or move a tracked file and stage the change.",
    syntax: "git mv <src> <dest>",
    explanation:
      "Renames or moves a file and stages the change in one step. Equivalent to moving the file, git rm on the old path and git add on the new one, but more convenient.",
    examples: [
      { command: "git mv old.txt new.txt", note: "Rename a tracked file." },
      { command: "git mv file.txt src/file.txt", note: "Move a file into a folder." },
    ],
    risk: "safe",
    undo: "git mv it back, or git restore --staged then move the file manually.",
    related: ["git-rm", "git-add"],
  },
  {
    slug: "git-branch-d",
    name: "git branch -d",
    category: "Branching",
    summary: "Delete a branch that has already been merged.",
    syntax: "git branch -d <name>",
    explanation:
      "Removes a branch pointer. The lowercase -d is safe: Git refuses to delete a branch whose commits are not merged somewhere, protecting you from losing work.",
    examples: [
      { command: "git branch -d feature/login", note: "Delete a merged feature branch." },
    ],
    risk: "caution",
    saferAlternative: "Merge or confirm the branch is safe first; -d already blocks unmerged branches.",
    undo: "git reflog or git branch <name> <tip-id> recreates the branch at its old tip.",
    related: ["git-branch-force-d", "git-branch", "git-reflog"],
  },
  {
    slug: "git-branch-force-d",
    name: "git branch -D",
    category: "Branching",
    summary: "Force-delete a branch even if its commits are not merged.",
    syntax: "git branch -D <name>",
    explanation:
      "The uppercase -D deletes a branch regardless of whether its commits are merged. If those commits exist nowhere else, they become unreachable and are eventually garbage collected.",
    examples: [
      { command: "git branch -D experiment", note: "Force-delete an unmerged branch." },
    ],
    risk: "destructive",
    consequence: "Deletes the branch even with unmerged commits; that work becomes unreachable and can be lost.",
    saferAlternative: "Use git branch -d, which refuses to delete unmerged work.",
    undo: "Immediately after: git reflog to find the tip, then git branch <name> <tip-id>.",
    related: ["git-branch-d", "git-reflog", "git-branch"],
  },
  {
    slug: "git-remote",
    name: "git remote",
    category: "Remotes",
    summary: "Manage the named connections to other copies of the repository.",
    syntax: "git remote [add|remove|-v] ...",
    explanation:
      "Lists, adds or removes remotes — the named URLs (like origin) that point at hosted copies of your repository. -v shows the fetch and push URLs for each.",
    examples: [
      { command: "git remote -v", note: "List remotes and their URLs." },
      { command: "git remote add origin <url>", note: "Connect a local repo to a remote." },
    ],
    risk: "safe",
    undo: "git remote remove <name> undoes an add.",
    related: ["git-clone", "git-fetch", "git-push"],
  },
  {
    slug: "git-fetch",
    name: "git fetch",
    category: "Remotes",
    summary: "Download new commits from a remote without changing your branches.",
    syntax: "git fetch [remote]",
    explanation:
      "Updates your remote-tracking branches (like origin/main) with new commits from the server, but does not touch your local branches or working tree. It lets you review what changed before deciding to merge or rebase.",
    examples: [
      { command: "git fetch", note: "Download updates from the default remote." },
      { command: "git fetch --all", note: "Fetch from every remote." },
    ],
    risk: "safe",
    undo: "Nothing local changes — nothing to undo.",
    related: ["git-pull", "git-merge", "git-fetch-prune"],
  },
  {
    slug: "git-fetch-prune",
    name: "git fetch --prune",
    category: "Remotes",
    summary: "Fetch and remove remote-tracking branches that no longer exist.",
    syntax: "git fetch --prune",
    explanation:
      "Downloads updates and cleans up stale references — remote-tracking branches for branches that have since been deleted on the server. Keeps your branch list tidy without touching local branches.",
    examples: [
      { command: "git fetch --prune", note: "Fetch and drop stale origin/* references." },
    ],
    risk: "safe",
    undo: "Pruned references reappear on the next fetch if they still exist on the remote.",
    related: ["git-fetch", "git-remote"],
  },
  {
    slug: "git-pull",
    name: "git pull",
    category: "Remotes",
    summary: "Fetch from a remote and integrate the changes into your branch.",
    syntax: "git pull [--rebase]",
    explanation:
      "A fetch followed by a merge (or, with --rebase, a rebase) of the upstream branch into your current one. Because it merges automatically, it can produce merge commits or conflicts. Pulling with uncommitted changes can be disruptive.",
    examples: [
      { command: "git pull", note: "Fetch and merge the upstream branch." },
      { command: "git pull --rebase", note: "Fetch and replay your commits on top." },
    ],
    risk: "caution",
    saferAlternative: "git fetch then review with git log before merging, especially on shared branches.",
    undo: "Before pushing: git reset --hard ORIG_HEAD restores the pre-pull state.",
    related: ["git-fetch", "git-merge", "git-rebase", "git-push"],
  },
  {
    slug: "git-push",
    name: "git push",
    category: "Remotes",
    summary: "Upload your local commits to a remote branch.",
    syntax: "git push [remote] [branch]",
    explanation:
      "Sends commits from your local branch to the matching branch on a remote. Git rejects a push that would overwrite commits on the server, protecting other people's work — you fetch and integrate first, then push again.",
    examples: [
      { command: "git push", note: "Push the current branch to its upstream." },
      { command: "git push -u origin feature/login", note: "Push a new branch and set its upstream." },
    ],
    risk: "caution",
    saferAlternative: "If a push is rejected, fetch and integrate rather than forcing.",
    undo: "Push a revert or a corrected commit; avoid force-pushing shared branches.",
    related: ["git-push-force", "git-push-force-with-lease", "git-fetch", "git-pull"],
  },
  {
    slug: "git-push-force",
    name: "git push --force",
    category: "Remotes",
    summary: "Overwrite the remote branch with your local version.",
    syntax: "git push --force",
    explanation:
      "Forces your local branch onto the remote, discarding any commits on the server that you do not have. On a shared branch this can erase teammates' work that was pushed while you were rebasing.",
    examples: [
      { command: "git push --force origin feature", note: "Overwrite a remote branch after rewriting history." },
    ],
    risk: "destructive",
    consequence: "Overwrites the remote branch and can permanently discard commits pushed by other people.",
    saferAlternative: "git push --force-with-lease refuses to overwrite unexpected new commits.",
    undo: "Only if someone still has the old commits: reset the remote to that id and push again. Otherwise the overwritten commits may be lost.",
    related: ["git-push", "git-push-force-with-lease", "git-rebase-interactive"],
  },
  {
    slug: "git-push-force-with-lease",
    name: "git push --force-with-lease",
    category: "Remotes",
    summary: "Force-push, but only if no one else has updated the branch.",
    syntax: "git push --force-with-lease",
    explanation:
      "A safer force push. It overwrites the remote branch only if the server still points where you last saw it. If a teammate pushed in the meantime, the push is rejected instead of erasing their commits.",
    examples: [
      { command: "git push --force-with-lease", note: "Safely publish a rebased branch." },
    ],
    risk: "caution",
    saferAlternative: "Fetch first so your lease reflects the latest remote state.",
    undo: "If it succeeds and was wrong, recover from a teammate's copy or the reflog on the server host.",
    related: ["git-push-force", "git-push", "git-rebase"],
  },
  {
    slug: "git-stash",
    name: "git stash",
    category: "Stashing",
    summary: "Set aside uncommitted changes to get a clean working tree.",
    syntax: "git stash [push -m <msg>]",
    explanation:
      "Saves your uncommitted changes onto a stack and reverts the working tree to the last commit, so you can switch branches or pull cleanly. Stashes are stored safely and can be reapplied later.",
    examples: [
      { command: "git stash", note: "Stash all uncommitted changes." },
      { command: 'git stash push -m "wip login"', note: "Stash with a description." },
      { command: "git stash list", note: "See saved stashes." },
    ],
    risk: "safe",
    undo: "git stash pop reapplies the most recent stash.",
    related: ["git-stash-pop", "git-stash-drop", "git-restore"],
  },
  {
    slug: "git-stash-pop",
    name: "git stash pop",
    category: "Stashing",
    summary: "Reapply the most recent stash and remove it from the stack.",
    syntax: "git stash pop [stash@{n}]",
    explanation:
      "Applies your most recent stash back onto the working tree and drops it from the stash list. If reapplying causes conflicts, the stash is kept so you do not lose it while you resolve them.",
    examples: [
      { command: "git stash pop", note: "Reapply and remove the latest stash." },
      { command: "git stash apply", note: "Reapply but keep the stash for reuse." },
    ],
    risk: "caution",
    saferAlternative: "git stash apply reapplies without deleting the stash, in case something goes wrong.",
    undo: "If a pop conflicts, the stash is preserved; resolve, then git stash drop when satisfied.",
    related: ["git-stash", "git-stash-drop"],
  },
  {
    slug: "git-stash-drop",
    name: "git stash drop",
    category: "Stashing",
    summary: "Delete a stash entry from the stack.",
    syntax: "git stash drop [stash@{n}]",
    explanation:
      "Permanently removes a stash from the list. Once dropped, the saved changes are no longer easy to recover, so double-check the stash reference before dropping it.",
    examples: [
      { command: "git stash drop", note: "Delete the most recent stash." },
      { command: "git stash clear", note: "Delete every stash at once." },
    ],
    risk: "destructive",
    consequence: "Permanently deletes the stashed changes; they are difficult or impossible to recover.",
    saferAlternative: "git stash list and git stash show to confirm before dropping.",
    undo: "A just-dropped stash can sometimes be found via git fsck --unreachable, but there is no guarantee.",
    related: ["git-stash", "git-stash-pop"],
  },
  {
    slug: "git-tag",
    name: "git tag",
    category: "Advanced",
    summary: "Mark a specific commit, usually to name a release.",
    syntax: "git tag [-a] <name> [ref]",
    explanation:
      "Attaches a permanent, human-friendly name to a commit — often a version like v1.0.0. -a creates an annotated tag with a message and author, which is preferred for releases. Tags do not move as new commits are added.",
    examples: [
      { command: 'git tag -a v1.0.0 -m "First release"', note: "Create an annotated release tag." },
      { command: "git push origin v1.0.0", note: "Push a tag to the remote." },
    ],
    risk: "safe",
    undo: "git tag -d <name> deletes a local tag; delete the remote one with git push origin :refs/tags/<name>.",
    related: ["git-log", "git-show", "git-push"],
  },
  {
    slug: "git-cherry-pick",
    name: "git cherry-pick",
    category: "Advanced",
    summary: "Copy a specific commit from one branch onto your current branch.",
    syntax: "git cherry-pick <ref>",
    explanation:
      "Applies the changes from a single commit as a new commit on your current branch. Useful for pulling one bug fix out of another branch without merging everything. The new commit has a different id from the original.",
    examples: [
      { command: "git cherry-pick a1b2c3d", note: "Apply one commit onto the current branch." },
      { command: "git cherry-pick a1b2c3d..e4f5g6h", note: "Apply a range of commits." },
    ],
    risk: "caution",
    saferAlternative: "Make sure you are on the right branch first; cherry-picking can duplicate commits.",
    undo: "Before pushing: git reset --hard HEAD~1. Mid-conflict: git cherry-pick --abort.",
    related: ["git-rebase", "git-revert", "git-merge"],
  },
  {
    slug: "git-reflog",
    name: "git reflog",
    category: "Undoing",
    summary: "See where HEAD has been — your safety net for recovery.",
    syntax: "git reflog",
    explanation:
      "Records every time HEAD moved: commits, checkouts, resets, rebases, merges. Even after a reset or a bad rebase, the old commit is usually still listed here, so you can jump back to it. This is the first place to look when you think you lost work.",
    examples: [
      { command: "git reflog", note: "List recent HEAD positions." },
      { command: "git reset --hard HEAD@{2}", note: "Jump back to a previous state from the reflog." },
    ],
    risk: "safe",
    undo: "Reflog only reads. Use it to recover after other commands.",
    related: ["git-reset", "git-reset-hard", "git-rebase", "git-log"],
  },
  {
    slug: "git-blame",
    name: "git blame",
    category: "Inspection",
    summary: "Show which commit and author last changed each line of a file.",
    syntax: "git blame <file>",
    explanation:
      "Annotates every line of a file with the commit, author and date that last changed it. Useful for understanding why a line exists and who to ask about it. Read-only.",
    examples: [
      { command: "git blame app.js", note: "Annotate every line of a file." },
      { command: "git blame -L 10,20 app.js", note: "Blame only lines 10 to 20." },
    ],
    risk: "safe",
    undo: "Nothing to undo — blame only reads.",
    related: ["git-log", "git-show", "git-diff"],
  },
  {
    slug: "git-bisect",
    name: "git bisect",
    category: "Advanced",
    summary: "Binary-search the history to find the commit that introduced a bug.",
    syntax: "git bisect start / good / bad",
    explanation:
      "Given a known-good and known-bad commit, Git checks out commits between them in a binary search while you mark each good or bad. It quickly narrows down the exact commit that introduced a problem. It moves HEAD around, so finish with git bisect reset.",
    examples: [
      { command: "git bisect start", note: "Begin a bisect session." },
      { command: "git bisect bad", note: "Mark the current commit as broken." },
      { command: "git bisect reset", note: "End the session and return to your branch." },
    ],
    risk: "caution",
    saferAlternative: "Commit or stash your work before starting; bisect checks out other commits.",
    undo: "git bisect reset returns you to where you started.",
    related: ["git-log", "git-checkout", "git-reflog"],
  },
  {
    slug: "git-gc",
    name: "git gc",
    category: "Advanced",
    summary: "Clean up and compress the repository's internal storage.",
    syntax: "git gc [--prune=<date>]",
    explanation:
      "Runs housekeeping: it compresses objects and removes unreachable ones that are past the expiry window. Git runs a light version automatically, so you rarely need it by hand. Running it can finalize the removal of commits that only existed in the reflog.",
    examples: [
      { command: "git gc", note: "Standard cleanup and compression." },
      { command: "git gc --aggressive", note: "Slower, more thorough repacking." },
    ],
    risk: "caution",
    saferAlternative: "Recover any lost commits from the reflog before running gc, which can prune them.",
    undo: "There is no undo for pruned unreachable objects. Recover first, then gc.",
    related: ["git-reflog", "git-fetch-prune"],
  },
];

const BY_SLUG = new Map(REFERENCE.map((c) => [c.slug, c] as const));

export function getCommand(slug: string): RefCommand | undefined {
  return BY_SLUG.get(slug);
}

export function getRelated(command: RefCommand): RefCommand[] {
  return command.related
    .map((slug) => BY_SLUG.get(slug))
    .filter((c): c is RefCommand => c !== undefined);
}
