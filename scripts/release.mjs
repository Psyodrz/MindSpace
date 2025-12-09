import fs from 'fs';
import path from 'path';
import { exec, execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const CORE_DIR = path.resolve('apps/core');
const LANDING_PUBLIC_DIR = path.resolve('apps/landing/public');
const VERSION_TS_PATH = path.join(CORE_DIR, 'src/version.ts');
const VERSION_JSON_PATH = path.join(LANDING_PUBLIC_DIR, 'version.json');
const GRADLE_PATH = path.join(CORE_DIR, 'android/app/build.gradle');

// Helper to ask questions
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

// Helper to run commands
const run = (cmd, cwd = process.cwd()) => {
  console.log(`\n> ${cmd} (in ${cwd})`);
  try {
    execSync(cmd, { stdio: 'inherit', cwd });
  } catch (e) {
    console.error(`Command failed: ${cmd}`);
    process.exit(1);
  }
};

async function main() {
  console.log('🚀 MindSpace Release Automation 🚀');
  console.log('===================================\n');

  // 1. Read current version
  let currentVersion = '1.0.0'; // Default
  if (fs.existsSync(VERSION_TS_PATH)) {
    const content = fs.readFileSync(VERSION_TS_PATH, 'utf-8');
    const match = content.match(/CURRENT_VERSION = '([\d\.]+)';/);
    if (match) currentVersion = match[1];
  }

  console.log(`Current Version: ${currentVersion}`);
  
  // 2. Increment Version
  const parts = currentVersion.split('.').map(Number);
  parts[2] += 1; // Increment patch
  const newVersion = parts.join('.');
  
  const confirm = await ask(`Next Version will be: ${newVersion}. Proceed? (Y/n) `);
  if (confirm.toLowerCase() === 'n') {
    const manual = await ask('Enter manual version (e.g. 1.1.0): ');
    if (!manual) process.exit(0);
    // TODO: Validate input
  }

  const changeDesc = await ask('Enter Changelog description: ') || 'Performance improvements and bug fixes.';
  
  console.log(`\nUpdating to ${newVersion}...`);

  // 3. Update Files
  
  // version.ts
  let tsContent = fs.readFileSync(VERSION_TS_PATH, 'utf-8');
  tsContent = tsContent.replace(/CURRENT_VERSION = '[\d\.]+';/, `CURRENT_VERSION = '${newVersion}';`);
  fs.writeFileSync(VERSION_TS_PATH, tsContent);
  console.log('✔ Updated version.ts');

  // version.json
  if (fs.existsSync(VERSION_JSON_PATH)) {
    const jsonContent = JSON.parse(fs.readFileSync(VERSION_JSON_PATH, 'utf-8'));
    jsonContent.latestVersion = newVersion;
    jsonContent.changelog = changeDesc;
    fs.writeFileSync(VERSION_JSON_PATH, JSON.stringify(jsonContent, null, 2));
    console.log('✔ Updated version.json');
  }

  // build.gradle
  if (fs.existsSync(GRADLE_PATH)) {
    let gradleContent = fs.readFileSync(GRADLE_PATH, 'utf-8');
    // Increment versionCode
    gradleContent = gradleContent.replace(/versionCode (\d+)/, (match, code) => {
        return `versionCode ${parseInt(code) + 1}`;
    });
    // Update versionName
    gradleContent = gradleContent.replace(/versionName "[\d\.]+"/g, `versionName "${newVersion}"`);
    fs.writeFileSync(GRADLE_PATH, gradleContent);
    console.log('✔ Updated build.gradle');
  }

  // 4. Build Core
  console.log('\nBuilding Core App...');
  run('npm run build', CORE_DIR);

  // 5. Sync Capacitor
  console.log('\nSyncing with Android...');
  run('npx cap sync android', CORE_DIR);

  // 6. Manual Step Prompt
  console.log('\n🛑 MANUAL STEP REQUIRED 🛑');
  console.log('1. Open Android Studio.');
  console.log('2. Build -> Generate Signed Bundle / APK -> APK -> Release.');
  console.log(`3. Copy the built APK to: ${path.join(LANDING_PUBLIC_DIR, 'mindspace.apk')}`);
  console.log('   (Overwrite the existing file)');
  
  await ask('\nPress ENTER once you have placed the NEW APK file in the public folder...');

  // 7. Git Push
  console.log('\nCommitting and Deploying...');
  run('git add .');
  run(`git commit -m "chore: release version ${newVersion}"`);
  run('git push origin main');

  console.log('\n🎉 RELEASE COMPLETE! 🎉');
  console.log('Vercel will now deploy the new manifest and APK.');
  rl.close();
}

main();
