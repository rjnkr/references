/**
 * Bulk import of the official UN/LOCODE dataset - STUB / STARTING POINT.
 *
 * The seed script (prisma/seed.ts) only inserts ~40 well-known ports, which is
 * enough to click through the UI. The real dataset is published by UNECE as a
 * set of CSV files ("UNLOCODE CodeList" parts 1-3) and contains 100.000+
 * locations. It is not fetched or vendored by this repository: download it
 * manually from
 *
 *   https://unece.org/trade/cefact/unlocode-code-list-country-and-territory
 *
 * concatenate the CodeListPart CSVs if you want everything in one go, and run:
 *
 *   npm run import:unlocodes -- /path/to/code-list.csv
 *
 * The UNECE CSV has no header row and is Latin-1 encoded. Columns are:
 *
 *   0  Change indicator  (e.g. "", "+", "X" - "X" means the entry was removed)
 *   1  Country           (ISO 3166-1 alpha-2, e.g. "NL")
 *   2  Location          (3-character location code, e.g. "RTM"; empty on the
 *                         country header rows that precede each country block)
 *   3  Name              (diacritic-stripped name)
 *   4  NameWoDiacritics
 *   5  Subdivision
 *   6  Function          (a bitmask-ish string, "1" in position 1 = seaport)
 *   7  Status
 *   8  Date
 *   9  IATA
 *   10 Coordinates
 *   11 Remarks
 *
 * This script keeps only rows that have a location code and are flagged as a
 * port (function contains "1"), which is what this application cares about.
 * Adjust the filter if you also need airports / inland terminals.
 */
import 'dotenv/config';
import * as fs from 'fs';
import * as readline from 'readline';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Minimal CSV field splitter that honours double-quoted fields. */
function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields.map((f) => f.trim());
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Usage: npm run import:unlocodes -- <path-to-unece-code-list.csv>');
    process.exit(1);
  }
  if (!fs.existsSync(csvPath)) {
    console.error(`File not found: ${csvPath}`);
    process.exit(1);
  }

  // Map ISO country code -> Country.id so the FK can be filled in.
  const countryIdByIso = new Map(
    (await prisma.country.findMany({ select: { id: true, isoCode: true } })).map((c) => [
      c.isoCode,
      c.id,
    ]),
  );

  const stream = fs.createReadStream(csvPath, { encoding: 'latin1' });
  const lines = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let read = 0;
  let imported = 0;
  let skipped = 0;

  for await (const line of lines) {
    read++;
    if (!line.trim()) {
      continue;
    }

    const cols = splitCsvLine(line);
    const changeIndicator = cols[0];
    const country = (cols[1] ?? '').toUpperCase();
    const location = (cols[2] ?? '').toUpperCase();
    const name = cols[4] || cols[3] || '';
    const fn = cols[6] ?? '';

    // Country header rows have no location code; "X" marks removed entries.
    if (!country || !location || changeIndicator === 'X' || !name) {
      skipped++;
      continue;
    }
    // Function position 1 == seaport. Drop everything else.
    if (!fn.includes('1')) {
      skipped++;
      continue;
    }

    const code = `${country}${location}`;
    if (code.length !== 5) {
      skipped++;
      continue;
    }

    const countryId = countryIdByIso.get(country) ?? null;

    await prisma.unLocode.upsert({
      where: { code },
      update: { name: name.slice(0, 150), countryId },
      create: { code, name: name.slice(0, 150), countryId },
    });
    imported++;

    if (imported % 1000 === 0) {
      console.log(`  ${imported} imported...`);
    }
  }

  console.log(`Done. Read ${read} lines, imported ${imported}, skipped ${skipped}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
