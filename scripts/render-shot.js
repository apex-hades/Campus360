const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const targetFile = process.argv[2] || '1_System_Architecture';

const htmlPath = path.resolve(`diagrams/${targetFile}.html`);
const outPng = path.resolve(`diagrams/${targetFile}.png`);
const tempDir = path.resolve(process.env.TEMP, 'edge_diagram_temp');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

console.log('Rendering:', htmlPath);
console.log('Target PNG:', outPng);

const args = [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  `--user-data-dir=${tempDir}`,
  `--screenshot=${outPng}`,
  '--window-size=1920,1080',
  '--hide-scrollbars',
  `file:///${htmlPath.replace(/\\/g, '/')}`
];

const proc = spawn(edgePath, args);

proc.on('close', (code) => {
  if (fs.existsSync(outPng)) {
    console.log(`SUCCESS! Generated: ${outPng} (${fs.statSync(outPng).size} bytes)`);
  } else {
    console.error('Failed to generate PNG.');
  }
});
