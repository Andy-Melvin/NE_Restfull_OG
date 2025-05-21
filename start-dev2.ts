
//npm install rimraf


// import { exec, spawn } from 'child_process';
// import path from 'path';
// import fs from 'fs';
// import rimraf from 'rimraf';

// const project = process.env.APP || 'frontend';
// const targetDir = path.resolve(process.cwd(), project === 'frontend' ? './frontend' : './backend');

// // Fixed commit time
// const commitDate = 'Mon May 19 11:30:00 2025 +0200';

// // Step 1: Git pull (silently, continue even if it fails)
// exec('git pull --quiet', { cwd: targetDir }, (pullError) => {
//   // Continue silently even if git pull fails
//   if (pullError) {
//     console.warn('[warn] git pull failed (ignored)');
//   }

//   // Step 2: Remove .git folder (cross-platform)
//   rimraf(path.join(targetDir, '.git'), (rimrafErr) => {
//     if (rimrafErr) {
//       console.warn('[warn] failed to remove .git (ignored)');
//     }

//     // Reinitialize git and commit
//     const initGit = `
//       git init &&
//       git add . &&
//       git -c user.name="dev" -c user.email="dev@example.com" \
//       -c commit.gpgsign=false \
//       -c core.autocrlf=false \
//       -c core.safecrlf=false \
//       -c core.eol=lf \
//       -c core.fileMode=false \
//       -c init.defaultBranch=main \
//       commit -m "Fresh start" --date="${commitDate}"
//     `;

//     exec(initGit, { cwd: targetDir, shell: true }, (resetError) => {
//       if (resetError) {
//         console.warn('[warn] git init/commit failed (ignored)');
//       }

//       // Step 3: Start dev server
//       spawn('npm', ['run', 'dev'], { cwd: targetDir, stdio: 'inherit', shell: true });
//     });
//   });
// });
