// Generates sample lab PDFs into infra/assets/ for Terraform to manage.
// Run once when adding/updating lab handouts: node make-pdfs.js
const fs   = require('fs');
const path = require('path');

const OUT  = path.join(__dirname, 'infra', 'assets');
const LABS = 5;

function makePDF(labNum) {
  const title    = `Lab ${labNum} Sample`;
  const subtitle = 'Nanyang Polytechnic  |  IT3226 Cloud Computing';

  const stream = Buffer.from(
    `BT\n` +
    `/F1 14 Tf\n` +
    `72 750 Td\n` +
    `(IT3226 Cloud Computing) Tj\n` +
    `0 -30 Td\n` +
    `/F1 36 Tf\n` +
    `(${title}) Tj\n` +
    `0 -60 Td\n` +
    `/F1 14 Tf\n` +
    `(${subtitle}) Tj\n` +
    `0 -40 Td\n` +
    `(This is a sample handout placeholder for demonstration purposes.) Tj\n` +
    `ET\n`,
    'latin1'
  );

  const parts  = [];
  let offset   = 0;
  const starts = new Array(6).fill(0);

  const push = (s) => {
    const b = typeof s === 'string' ? Buffer.from(s, 'latin1') : s;
    parts.push(b);
    offset += b.length;
  };

  push('%PDF-1.4\n');

  starts[1] = offset;
  push('1 0 obj\n<</Type /Catalog /Pages 2 0 R>>\nendobj\n');

  starts[2] = offset;
  push('2 0 obj\n<</Type /Pages /Kids [3 0 R] /Count 1>>\nendobj\n');

  starts[3] = offset;
  push('3 0 obj\n<</Type /Page /MediaBox [0 0 612 792] /Parent 2 0 R\n' +
       '  /Resources <</Font <</F1 4 0 R>>>> /Contents 5 0 R>>\nendobj\n');

  starts[4] = offset;
  push('4 0 obj\n<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>\nendobj\n');

  starts[5] = offset;
  push(`5 0 obj\n<</Length ${stream.length}>>\nstream\n`);
  push(stream);
  push('endstream\nendobj\n');

  const xrefStart = offset;
  const pad = n => String(n).padStart(10, '0');
  push(
    'xref\n0 6\n' +
    '0000000000 65535 f\r\n' +
    starts.slice(1).map(o => `${pad(o)} 00000 n\r\n`).join('')
  );
  push(`trailer\n<</Size 6 /Root 1 0 R>>\nstartxref\n${xrefStart}\n%%EOF\n`);

  return Buffer.concat(parts);
}

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

for (let i = 1; i <= LABS; i++) {
  const file = path.join(OUT, `lab-${i}.pdf`);
  fs.writeFileSync(file, makePDF(i));
  console.log(`Created ${path.relative(__dirname, file)}`);
}
