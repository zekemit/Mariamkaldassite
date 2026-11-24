// Writes data/site-content.json (the local-development content store) from the verified default copy.
//   npm run seed:cms            create it if it does not exist
//   npm run seed:cms -- --force overwrite it (discarding local edits made through /admin)
// The path can be overridden with CMS_DATA_FILE, the same variable the app uses.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { defaultSiteContent } from '../src/content/defaults';
import { siteContentSchema } from '../src/lib/cms-schema';

const target = path.resolve(process.env.CMS_DATA_FILE?.trim() || 'data/site-content.json');
const force = process.argv.includes('--force');

const result = siteContentSchema.safeParse(defaultSiteContent);
if (!result.success) {
  console.error('The default content does not pass the CMS schema:', result.error.issues);
  process.exit(1);
}

if (existsSync(target) && !force) {
  console.log(`${path.relative(process.cwd(), target)} already exists; left as is (use --force to overwrite).`);
} else {
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(result.data, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${path.relative(process.cwd(), target)} from the default content.`);
}
