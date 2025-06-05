import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import packageJson from './package.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const names = ['@liry-ccc/koa-cors-middleware', 'koa-cors-middleware'];
const pj = resolve(__dirname, 'package.json');

const main = async () => {
  const originPackageJson = await readFile(pj);
  console.log('原始package.json');
  console.log(packageJson);
  console.log('删除package.json');
  await rm(pj);
  for (const name of names) {
    console.log(`写入 ${name} 包`);
    const nameJson = JSON.stringify(
      {
        ...packageJson,
        name,
        publishConfig: name.includes('@')
          ? undefined
          : {
              access: 'public'
            }
      },
      null,
      2
    );
    await writeFile(pj, nameJson);
    console.log(nameJson);
    console.log(`开始上传 ${name} 包`);
    console.log();
    execSync(`pnpm publish --no-git-checks --access public`, {
      encoding: 'utf-8',
      cwd: __dirname,
      stdio: 'inherit'
    });
  }
  console.log('还原package.json');
  writeFileSync(pj, originPackageJson);
};

await main();
