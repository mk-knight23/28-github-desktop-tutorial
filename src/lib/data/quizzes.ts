/**
 * Quizzes (PRODUCT_SPEC §3.3): 5 topics, 8 questions each, deterministic
 * scoring, per-question explanation revealed after answering.
 */

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
}

export const QUIZZES: Quiz[] = [
  {
    id: "basics",
    title: "Git basics",
    description: "The core loop: staging, committing, and checking status.",
    questions: [
      {
        id: "b1",
        question: "What does the staging area (the index) hold?",
        options: [
          "The changes you have chosen to include in your next commit",
          "Every file in the repository",
          "The commit history",
          "Files ignored by .gitignore",
        ],
        correctIndex: 0,
        explanation:
          "Staging lets you build a commit from exactly the changes you pick with git add, rather than committing everything at once.",
      },
      {
        id: "b2",
        question: "Which command records staged changes permanently?",
        options: ["git add", "git commit", "git status", "git push"],
        correctIndex: 1,
        explanation: "git commit turns the staged snapshot into a permanent commit on the current branch.",
      },
      {
        id: "b3",
        question: "What creates a repository in an existing folder?",
        options: ["git start", "git new", "git init", "git create"],
        correctIndex: 2,
        explanation: "git init creates the hidden .git directory that lets Git track the folder.",
      },
      {
        id: "b4",
        question: "Where do your commits live right after git commit?",
        options: [
          "On the remote server",
          "Only in your local repository",
          "In a pull request",
          "In the staging area",
        ],
        correctIndex: 1,
        explanation: "Commits are local until you push. Nothing leaves your machine until git push.",
      },
      {
        id: "b5",
        question: "Which command is read-only and safe to run anytime?",
        options: ["git reset", "git status", "git commit", "git merge"],
        correctIndex: 1,
        explanation: "git status only reports the state of your working tree and index; it changes nothing.",
      },
      {
        id: "b6",
        question: "What does .gitignore do?",
        options: [
          "Deletes files permanently",
          "Tells Git which untracked files to leave alone",
          "Hides commits from history",
          "Encrypts sensitive files",
        ],
        correctIndex: 1,
        explanation: ".gitignore lists patterns for untracked files Git should not offer to stage, like node_modules or build output.",
      },
      {
        id: "b7",
        question: "How do you stage every change in the current directory?",
        options: ["git add .", "git commit -a", "git stage all", "git add --commit"],
        correctIndex: 0,
        explanation: "git add . stages all changes under the current directory. Review with git status first.",
      },
      {
        id: "b8",
        question: "What information does every commit carry?",
        options: [
          "Only the changed lines",
          "An id, author, timestamp, and message",
          "Just a message",
          "The entire project zipped up",
        ],
        correctIndex: 1,
        explanation: "Each commit has a unique id, an author, a timestamp, a message, and links to its parent commit(s).",
      },
    ],
  },
  {
    id: "branching",
    title: "Branching",
    description: "Creating, switching, and understanding what branches really are.",
    questions: [
      {
        id: "br1",
        question: "What is a Git branch, technically?",
        options: [
          "A full copy of the project",
          "A movable pointer to a commit",
          "A folder of changes",
          "A backup of the remote",
        ],
        correctIndex: 1,
        explanation: "A branch is just a lightweight, movable pointer to a commit — which is why creating one is instant.",
      },
      {
        id: "br2",
        question: "Which modern command switches branches most clearly?",
        options: ["git switch", "git goto", "git branch", "git move"],
        correctIndex: 0,
        explanation: "git switch was introduced to handle branch switching specifically, replacing the overloaded git checkout.",
      },
      {
        id: "br3",
        question: "How do you create a branch and switch to it in one step?",
        options: ["git branch -s new", "git switch -c new", "git checkout new", "git new -b"],
        correctIndex: 1,
        explanation: "git switch -c new (or the older git checkout -b new) creates the branch and moves HEAD onto it.",
      },
      {
        id: "br4",
        question: "What does HEAD point to normally?",
        options: [
          "The remote repository",
          "The branch you currently have checked out",
          "The first commit",
          "The staging area",
        ],
        correctIndex: 1,
        explanation: "HEAD usually points at your current branch, which in turn points at your latest commit.",
      },
      {
        id: "br5",
        question: "What is 'detached HEAD' state?",
        options: [
          "A corrupted repository",
          "HEAD pointing directly at a commit instead of a branch",
          "A branch with no commits",
          "A merge conflict",
        ],
        correctIndex: 1,
        explanation: "Checking out a specific commit detaches HEAD from any branch; new commits there belong to no branch until you make one.",
      },
      {
        id: "br6",
        question: "Which command safely deletes a merged branch?",
        options: ["git branch -D name", "git branch -d name", "git delete name", "git rm name"],
        correctIndex: 1,
        explanation: "Lowercase -d refuses to delete a branch with unmerged commits, protecting your work. -D forces it.",
      },
      {
        id: "br7",
        question: "Creating a new branch copies your files. True or false?",
        options: ["True — it duplicates everything", "False — it just adds a pointer"],
        correctIndex: 1,
        explanation: "Branches share the same commits; a new branch is only a new pointer, so there is no file copy.",
      },
      {
        id: "br8",
        question: "You have uncommitted changes and try to switch branches with a conflict. What does Git do?",
        options: [
          "Silently discards your changes",
          "Refuses to switch to protect your work",
          "Commits your changes automatically",
          "Deletes the other branch",
        ],
        correctIndex: 1,
        explanation: "Git refuses a switch that would overwrite conflicting uncommitted changes. Commit or stash first.",
      },
    ],
  },
  {
    id: "merging-vs-rebasing",
    title: "Merging vs rebasing",
    description: "Two ways to combine work, and when each fits.",
    questions: [
      {
        id: "m1",
        question: "What does a merge commit have that a normal commit doesn't?",
        options: ["A longer message", "Two parent commits", "No id", "A tag"],
        correctIndex: 1,
        explanation: "A true merge commit has two parents, recording that two lines of history came together.",
      },
      {
        id: "m2",
        question: "What is a fast-forward merge?",
        options: [
          "A merge that skips conflicts",
          "Moving the branch pointer forward when there is no divergent work",
          "A merge that deletes commits",
          "A forced merge",
        ],
        correctIndex: 1,
        explanation: "When your branch has no new commits, Git just advances the pointer — no merge commit needed.",
      },
      {
        id: "m3",
        question: "What does rebase do to your commits?",
        options: [
          "Deletes them",
          "Replays them on top of another branch with new ids",
          "Merges them into one",
          "Pushes them to the remote",
        ],
        correctIndex: 1,
        explanation: "Rebase re-applies your commits onto a new base, creating new commits with new ids for a linear history.",
      },
      {
        id: "m4",
        question: "Why is rebasing shared, pushed commits risky?",
        options: [
          "It uses more disk space",
          "It rewrites commit ids, which disrupts collaborators who have the old ones",
          "It always causes conflicts",
          "It deletes the remote branch",
        ],
        correctIndex: 1,
        explanation: "Because rebase changes commit ids, others who based work on the old commits end up with a diverged history.",
      },
      {
        id: "m5",
        question: "Which produces a linear history with no merge commits?",
        options: ["git merge", "git rebase", "git pull", "git revert"],
        correctIndex: 1,
        explanation: "Rebase replays commits in a straight line; merge preserves the branching shape with a merge commit.",
      },
      {
        id: "m6",
        question: "A conflict interrupts a merge. How do you bail out safely?",
        options: ["git merge --abort", "git reset --hard", "git clean -fd", "git push --force"],
        correctIndex: 0,
        explanation: "git merge --abort restores the exact pre-merge state without touching anything else.",
      },
      {
        id: "m7",
        question: "Which command undoes a pushed merge without rewriting history?",
        options: [
          "git reset --hard",
          "git revert -m 1 <merge-id>",
          "git merge --abort",
          "git rebase",
        ],
        correctIndex: 1,
        explanation: "git revert -m 1 creates a new commit that reverses the merge, safe for shared branches.",
      },
      {
        id: "m8",
        question: "A common team guideline is:",
        options: [
          "Always rebase everything",
          "Rebase local, unshared work; merge shared branches",
          "Never merge",
          "Only merge on Fridays",
        ],
        correctIndex: 1,
        explanation: "Rebasing tidies local history before sharing; merging keeps shared history honest and non-destructive.",
      },
    ],
  },
  {
    id: "undoing-changes",
    title: "Undoing changes",
    description: "Reset, revert, restore, and recovering with the reflog.",
    questions: [
      {
        id: "u1",
        question: "Which reset mode discards your uncommitted changes?",
        options: ["--soft", "--mixed", "--hard", "--keep"],
        correctIndex: 2,
        explanation: "git reset --hard forces the working tree to match the target commit, discarding uncommitted work.",
      },
      {
        id: "u2",
        question: "How do you undo a pushed commit safely?",
        options: ["git reset --hard", "git revert", "git commit --amend", "git clean"],
        correctIndex: 1,
        explanation: "git revert adds a new commit that reverses the change, so shared history is never rewritten.",
      },
      {
        id: "u3",
        question: "Where can you find a commit after a bad hard reset?",
        options: ["git log", "git reflog", "git status", "git diff"],
        correctIndex: 1,
        explanation: "The reflog records every position HEAD held, so a reset-away commit is usually still listed there.",
      },
      {
        id: "u4",
        question: "git reset --soft HEAD~1 does what?",
        options: [
          "Deletes the last commit and its changes",
          "Undoes the last commit but keeps the changes staged",
          "Pushes to the remote",
          "Creates a new branch",
        ],
        correctIndex: 1,
        explanation: "Soft reset moves the branch back one commit while keeping those changes staged, ready to recommit.",
      },
      {
        id: "u5",
        question: "Which command discards unstaged changes to a single file?",
        options: ["git restore file", "git delete file", "git reset file", "git rm file"],
        correctIndex: 0,
        explanation: "git restore <file> reverts that file to the last committed version. This cannot be undone.",
      },
      {
        id: "u6",
        question: "You committed a secret. What is the FIRST thing to do?",
        options: [
          "Delete the repository",
          "Rotate the secret — treat it as compromised",
          "Force-push immediately",
          "Ignore it",
        ],
        correctIndex: 1,
        explanation: "Removing a secret from history does not un-leak it. Rotate the credential first, then scrub history.",
      },
      {
        id: "u7",
        question: "git clean -fd removes what?",
        options: [
          "Committed files",
          "Untracked files and directories",
          "Remote branches",
          "The staging area",
        ],
        correctIndex: 1,
        explanation: "git clean deletes untracked files. They are not in Git, so they cannot be recovered — preview with -n.",
      },
      {
        id: "u8",
        question: "To fix only the message of your last unpushed commit, use:",
        options: [
          "git commit --amend",
          "git reset --hard",
          "git revert",
          "git rebase --abort",
        ],
        correctIndex: 0,
        explanation: "git commit --amend rewrites the most recent commit, which is ideal for fixing its message.",
      },
    ],
  },
  {
    id: "collaboration",
    title: "Collaboration",
    description: "Remotes, fetch/pull/push, and working with others.",
    questions: [
      {
        id: "c1",
        question: "What is 'origin' by convention?",
        options: [
          "Your first commit",
          "The default name for the remote you cloned from",
          "The main branch",
          "A backup folder",
        ],
        correctIndex: 1,
        explanation: "origin is the conventional name Git gives the remote you cloned from.",
      },
      {
        id: "c2",
        question: "What does git fetch do?",
        options: [
          "Downloads remote commits without changing your branches",
          "Merges the remote into your branch",
          "Pushes your commits",
          "Deletes local branches",
        ],
        correctIndex: 0,
        explanation: "Fetch updates your remote-tracking branches so you can review changes before integrating them.",
      },
      {
        id: "c3",
        question: "git pull is roughly equivalent to:",
        options: [
          "git fetch then git merge",
          "git push then git commit",
          "git clone",
          "git reset",
        ],
        correctIndex: 0,
        explanation: "Pull fetches and then merges (or rebases, with --rebase) the upstream branch into yours.",
      },
      {
        id: "c4",
        question: "Your push is rejected because the remote has new commits. What should you do?",
        options: [
          "git push --force",
          "Fetch and integrate the changes, then push again",
          "Delete the remote branch",
          "Commit harder",
        ],
        correctIndex: 1,
        explanation: "A rejected push protects others' work. Fetch and merge or rebase, then push — do not force on shared branches.",
      },
      {
        id: "c5",
        question: "Which is the safer force push?",
        options: [
          "git push --force",
          "git push --force-with-lease",
          "git push -f -f",
          "git push --overwrite",
        ],
        correctIndex: 1,
        explanation: "--force-with-lease refuses to overwrite if the remote changed unexpectedly, protecting teammates' commits.",
      },
      {
        id: "c6",
        question: "How do you publish a brand-new local branch and track it?",
        options: [
          "git push -u origin branch-name",
          "git branch --remote",
          "git commit --push",
          "git remote add branch",
        ],
        correctIndex: 0,
        explanation: "git push -u sets the upstream so later git push and git pull work without extra arguments.",
      },
      {
        id: "c7",
        question: "What does git fetch --prune clean up?",
        options: [
          "Your local branches",
          "Remote-tracking branches for branches deleted on the server",
          "Uncommitted changes",
          "The reflog",
        ],
        correctIndex: 1,
        explanation: "Prune removes stale origin/* references for branches that no longer exist on the remote.",
      },
      {
        id: "c8",
        question: "A pull request is:",
        options: [
          "A Git command",
          "A request on a hosting platform to review and merge a branch",
          "A way to delete commits",
          "A type of merge conflict",
        ],
        correctIndex: 1,
        explanation: "Pull requests are a platform feature (GitHub, GitLab, etc.) for reviewing and merging branches — not a Git command.",
      },
    ],
  },
];

const BY_ID = new Map(QUIZZES.map((q) => [q.id, q] as const));

export function getQuiz(id: string): Quiz | undefined {
  return BY_ID.get(id);
}

export function scoreQuiz(quiz: Quiz, answers: Record<string, number>): number {
  return quiz.questions.reduce(
    (score, q) => (answers[q.id] === q.correctIndex ? score + 1 : score),
    0,
  );
}
