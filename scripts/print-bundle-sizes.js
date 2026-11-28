const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const chunksDir = path.join(process.cwd(), '.next', 'static', 'chunks');

function collectJsFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectJsFiles(fullPath);
    }
    return entry.name.endsWith('.js') ? [fullPath] : [];
  });
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} kB`;
}

function main() {
  if (!fs.existsSync(chunksDir)) {
    console.log('No .next/static/chunks directory found; skipping bundle size report.');
    return;
  }

  const files = collectJsFiles(chunksDir)
    .map((filePath) => {
      const raw = fs.readFileSync(filePath);
      return {
        name: path.relative(chunksDir, filePath),
        size: raw.length,
        gzipSize: zlib.gzipSync(raw).length
      };
    })
    .sort((a, b) => b.gzipSize - a.gzipSize);

  const totalGzip = files.reduce((sum, file) => sum + file.gzipSize, 0);

  console.log('\nBundle size report (.next/static/chunks)');
  console.log('-----------------------------------------');
  for (const file of files) {
    console.log(`${formatKb(file.gzipSize).padStart(10)}  (raw ${formatKb(file.size)})  ${file.name}`);
  }
  console.log('-----------------------------------------');
  console.log(`Total gzip: ${formatKb(totalGzip)} across ${files.length} chunk(s)\n`);
}

main();
