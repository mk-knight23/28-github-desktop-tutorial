/**
 * Guided tutorials (PRODUCT_SPEC §3.2): GitHub Desktop and CLI paths across
 * three levels, with step checkpoints. Progress persists locally (storage.ts).
 */

import type { RiskLevel } from "@/lib/git-engine";

export type TutorialPath = "desktop" | "cli";
export type TutorialLevel = "beginner" | "intermediate" | "advanced";

export interface TutorialStep {
  id: string;
  title: string;
  body: string;
  /** CLI-path steps show a command in the terminal panel. */
  command?: string;
  risk?: RiskLevel;
  /** Short checkpoint the learner marks done. */
  checkpoint: string;
}

export interface Tutorial {
  id: string;
  path: TutorialPath;
  level: TutorialLevel;
  title: string;
  summary: string;
  minutes: number;
  steps: TutorialStep[];
}

export const PATH_LABEL: Record<TutorialPath, string> = {
  desktop: "GitHub Desktop",
  cli: "Command line",
};

export const LEVEL_LABEL: Record<TutorialLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const TUTORIALS: Tutorial[] = [
  {
    id: "desktop-beginner",
    path: "desktop",
    level: "beginner",
    title: "Your first repository with GitHub Desktop",
    summary: "Create a repository, make a change, and record your first commit — all without the terminal.",
    minutes: 10,
    steps: [
      {
        id: "d1s1",
        title: "Create a new repository",
        body: "In GitHub Desktop, choose File then New Repository. Give it a name, pick a local folder, and add a README so the project starts with a file. Click Create Repository.",
        checkpoint: "A new repository appears in the current repository list.",
      },
      {
        id: "d1s2",
        title: "Open the project in your editor",
        body: "Use Repository then Open in your editor (or the 'Open in Visual Studio Code' button). GitHub Desktop tracks the folder while you edit files elsewhere.",
        checkpoint: "The project folder opens in your editor.",
      },
      {
        id: "d1s3",
        title: "Make a change",
        body: "Edit the README — add a sentence describing the project — and save. Switch back to GitHub Desktop; the Changes tab now lists your edited file with a diff on the right.",
        checkpoint: "The Changes tab shows the README with your edit highlighted.",
      },
      {
        id: "d1s4",
        title: "Write a commit message",
        body: "In the bottom-left Summary box, describe what you changed, for example 'Describe the project in the README'. Keep it short and in the present tense.",
        checkpoint: "The Summary box has a clear message and the Commit button is enabled.",
      },
      {
        id: "d1s5",
        title: "Commit to main",
        body: "Click 'Commit to main'. Your change is now recorded locally as a commit. The History tab shows it. Nothing has left your computer yet — publishing to GitHub is a separate step.",
        checkpoint: "The History tab lists your first commit.",
      },
    ],
  },
  {
    id: "desktop-intermediate",
    path: "desktop",
    level: "intermediate",
    title: "Branches and pull requests in GitHub Desktop",
    summary: "Work on a feature branch, publish it, and open a pull request for review.",
    minutes: 15,
    steps: [
      {
        id: "d2s1",
        title: "Create a branch",
        body: "Click the Current Branch dropdown, then New Branch. Name it something like feature/welcome-message and base it on main. GitHub Desktop switches you to the new branch automatically.",
        checkpoint: "The Current Branch button shows your new branch name.",
      },
      {
        id: "d2s2",
        title: "Make and commit a change on the branch",
        body: "Edit a file, then commit it to your feature branch just like before. Because you are on a branch, main stays untouched.",
        checkpoint: "A commit exists on the feature branch and main is unchanged.",
      },
      {
        id: "d2s3",
        title: "Publish the branch",
        body: "Click 'Publish branch' (or 'Push origin') to upload the branch and its commits to GitHub. This is the first time your work leaves your machine.",
        checkpoint: "The branch appears on GitHub under the repository's branches.",
      },
      {
        id: "d2s4",
        title: "Open a pull request",
        body: "Click 'Create Pull Request'. GitHub opens in your browser with the branch pre-filled. Add a title and description explaining the change, then create the PR.",
        checkpoint: "A pull request is open on GitHub comparing your branch to main.",
      },
      {
        id: "d2s5",
        title: "Merge and clean up",
        body: "Once reviewed, merge the pull request on GitHub. Back in GitHub Desktop, switch to main, pull the merge, and delete the now-merged feature branch to keep things tidy.",
        checkpoint: "main contains the merged change and the feature branch is removed.",
      },
    ],
  },
  {
    id: "desktop-advanced",
    path: "desktop",
    level: "advanced",
    title: "Resolving conflicts and reading history in GitHub Desktop",
    summary: "Handle a merge conflict calmly and use history to understand and undo changes.",
    minutes: 18,
    steps: [
      {
        id: "d3s1",
        title: "Create a conflict on purpose",
        body: "On two different branches, change the same line of the same file and commit each. When you merge one into the other, GitHub Desktop will report a conflict.",
        checkpoint: "GitHub Desktop shows a conflict banner during the merge.",
      },
      {
        id: "d3s2",
        title: "Open the conflicted file",
        body: "GitHub Desktop lists the conflicted files and offers to open your editor. The conflict markers show both versions: the current branch's change and the incoming one.",
        checkpoint: "You can see both conflicting versions in the editor.",
      },
      {
        id: "d3s3",
        title: "Choose the right result",
        body: "Edit the file so it contains the correct final content, then remove the conflict markers. Save. GitHub Desktop's checkbox turns green once the file is resolved.",
        checkpoint: "The conflicted file is marked resolved in GitHub Desktop.",
      },
      {
        id: "d3s4",
        title: "Finish the merge",
        body: "Click 'Continue merge' (or commit the merge). The merge commit records that the two branches came together and how you resolved the conflict.",
        checkpoint: "A merge commit appears in the History tab.",
      },
      {
        id: "d3s5",
        title: "Undo a commit from history",
        body: "In the History tab, right-click a commit and choose 'Revert this commit'. GitHub Desktop creates a new commit that reverses it — the safe way to undo, since it never rewrites history.",
        checkpoint: "A revert commit appears at the top of History.",
      },
    ],
  },
  {
    id: "cli-beginner",
    path: "cli",
    level: "beginner",
    title: "Your first commits on the command line",
    summary: "Initialize a repo, stage changes, and commit — the core CLI loop.",
    minutes: 12,
    steps: [
      {
        id: "c1s1",
        title: "Set your identity (once)",
        body: "Before your first commit, tell Git who you are. This is stored globally, so you only do it once per machine.",
        command: 'git config --global user.name "Your Name"',
        risk: "caution",
        checkpoint: "git config user.name returns your name.",
      },
      {
        id: "c1s2",
        title: "Create a repository",
        body: "Move into your project folder and initialize a repository. This creates the hidden .git directory.",
        command: "git init",
        risk: "safe",
        checkpoint: "git status runs without an error about no repository.",
      },
      {
        id: "c1s3",
        title: "Check the status",
        body: "See what Git notices. New files show up as untracked. Get used to running this constantly — it is always safe.",
        command: "git status",
        risk: "safe",
        checkpoint: "You can see your files listed as untracked.",
      },
      {
        id: "c1s4",
        title: "Stage your changes",
        body: "Add the files you want in your first commit to the staging area.",
        command: "git add .",
        risk: "safe",
        checkpoint: "git status shows files staged as 'Changes to be committed'.",
      },
      {
        id: "c1s5",
        title: "Make your first commit",
        body: "Record the staged snapshot with a clear message. Congratulations — that is a commit.",
        command: 'git commit -m "Initial commit"',
        risk: "safe",
        checkpoint: "git log shows your commit.",
      },
    ],
  },
  {
    id: "cli-intermediate",
    path: "cli",
    level: "intermediate",
    title: "Branching and merging on the command line",
    summary: "Create a feature branch, commit on it, and merge it back into main.",
    minutes: 15,
    steps: [
      {
        id: "c2s1",
        title: "Create and switch to a branch",
        body: "Start a feature branch. The -c flag creates it and switches you onto it in one step.",
        command: "git switch -c feature/login",
        risk: "safe",
        checkpoint: "git status reports you are on feature/login.",
      },
      {
        id: "c2s2",
        title: "Commit work on the branch",
        body: "Edit files, stage them, and commit. These commits live only on the feature branch; main stays where it was.",
        command: 'git commit -m "Add login form"',
        risk: "safe",
        checkpoint: "git log on the branch shows your new commit.",
      },
      {
        id: "c2s3",
        title: "Switch back to main",
        body: "Return to the branch you want to merge into.",
        command: "git switch main",
        risk: "safe",
        checkpoint: "git status reports you are on main.",
      },
      {
        id: "c2s4",
        title: "Merge the feature branch",
        body: "Bring the feature branch's commits into main. If main has no new commits, this fast-forwards; otherwise Git makes a merge commit.",
        command: "git merge feature/login",
        risk: "caution",
        checkpoint: "git log on main now includes the feature work.",
      },
      {
        id: "c2s5",
        title: "Delete the merged branch",
        body: "Clean up the branch now that it is merged. The lowercase -d refuses to delete unmerged work, so it is safe.",
        command: "git branch -d feature/login",
        risk: "caution",
        checkpoint: "git branch no longer lists feature/login.",
      },
    ],
  },
  {
    id: "cli-advanced",
    path: "cli",
    level: "advanced",
    title: "Rebasing and recovering with the reflog",
    summary: "Tidy history with an interactive rebase, then practice recovering lost commits.",
    minutes: 20,
    steps: [
      {
        id: "c3s1",
        title: "Make a safety branch first",
        body: "Before rewriting history, create a backup pointer at your current commit. If anything goes wrong, this branch still points at the original.",
        command: "git branch backup",
        risk: "safe",
        checkpoint: "git branch lists a 'backup' branch at your current tip.",
      },
      {
        id: "c3s2",
        title: "Rebase onto the latest main",
        body: "Replay your branch's commits on top of the current main for a clean, linear history. Only do this with commits you have not shared.",
        command: "git rebase main",
        risk: "caution",
        checkpoint: "git log --graph shows your commits on top of main with no merge commit.",
      },
      {
        id: "c3s3",
        title: "Clean up commits interactively",
        body: "Squash and reword commits before sharing. In the editor, change 'pick' to 'squash' or 'reword' as needed. This rewrites commit ids.",
        command: "git rebase -i main",
        risk: "destructive",
        checkpoint: "Your branch has a tidier set of commits.",
      },
      {
        id: "c3s4",
        title: "Simulate losing a commit",
        body: "Practice recovery: move your branch back with a hard reset so a commit becomes unreachable. You will get it back next.",
        command: "git reset --hard HEAD~1",
        risk: "destructive",
        checkpoint: "git log shows one fewer commit than before.",
      },
      {
        id: "c3s5",
        title: "Recover with the reflog",
        body: "The reflog still remembers where HEAD was. Find the lost commit's id and reset back to it. This is your safety net.",
        command: "git reflog",
        risk: "safe",
        checkpoint: "You located the lost commit and restored it with git reset --hard <id>.",
      },
    ],
  },
];

const BY_ID = new Map(TUTORIALS.map((t) => [t.id, t] as const));

export function getTutorial(id: string): Tutorial | undefined {
  return BY_ID.get(id);
}
