const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const run = (cmd) => execSync(cmd).toString().trim();

const hash = (() => {
	try {
		return run('git rev-parse --short HEAD');
	} catch {
		return 'unknown';
	}
})();

const branch = (() => {
	try {
		return run('git rev-parse --abbrev-ref HEAD');
	} catch {
		return 'unknown';
	}
})();

const time = new Date().toISOString();

const target = path.join(__dirname, '..', 'public', 'version.json');
fs.writeFileSync(target, JSON.stringify({ hash, branch, time }, null, 2) + '\n');
console.log('stamped', target, { hash, branch, time });
