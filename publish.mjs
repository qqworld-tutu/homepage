import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('.', import.meta.url));
const message = process.argv.slice(2).join(' ').trim();
if (!message || message === '--help') {
  console.log('Usage: npm run publish -- "Update academic homepage"');
  console.log('Build the homepage, commit all non-ignored changes, and push main.');
  process.exit(message ? 0 : 1);
}
function run(command, args, capture = false) {
  const result = spawnSync(command, args, {cwd:root, encoding:'utf8', stdio:capture ? 'pipe' : 'inherit'});
  if (result.error) { console.error(result.error.message); process.exit(1); }
  if (result.status !== 0) { if(capture) console.error(result.stderr); process.exit(result.status || 1); }
  return capture ? result.stdout.trim() : '';
}
if (run('git',['branch','--show-current'],true) !== 'main') throw new Error('Switch to main before publishing.');
run(process.execPath, ['build.mjs']);
if (run('git',['status','--porcelain'],true)) {
  run('git',['add','--all']);
  run('git',['commit','-m',message]);
}
run('git',['push','origin','main']);
console.log('Pushed. GitHub Actions will build and deploy the homepage.');
