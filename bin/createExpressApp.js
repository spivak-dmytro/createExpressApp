const util = require('util');
const path = require('path');
const fs = require('fs/promises');
const fse = require('fs-extra');
const { program } = require('commander');

const deleteFolderRecursive = async (path) => {
  for (const file of await fs.readdir(path)) {
    const curPath = path + "/" + file;
    if((await fs.lstat(curPath)).isDirectory()) {
      await deleteFolderRecursive(curPath);
    } else {
      await fs.unlink(curPath);
    }
  }

  await fs.rmdir(path);
};

async function removeFiles(dir, removeName, removeExtension) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });

  for (const dirent of dirents) {
    if (dirent.name.includes(removeName)) {
      await fse.remove(path.resolve(dir, dirent.name));
      // await fs.unlink(path.resolve(dir, dirent.name));
      continue;
    }

    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      await removeFiles(res, removeName, removeExtension);
    }

    if (dirent.name.includes(removeExtension)) {
      await fs.rename(path.resolve(dir, dirent.name), path.resolve(dir, dirent.name.replace(removeExtension, '')));
    }
  }
}

const copyFiles = async (options) => {
  const { orm, name } = options;

  console.log(`Copying files for ${orm}`);

  console.log(`Creating "${name}" directory`);
  await fs.mkdir(path.join(__dirname, `./${name}`), { recursive: true });

  console.log(`Copying package.json`);
  if (orm === 'sequelize') {
    await fs.copyFile(path.join(__dirname, '../package-orm-sequelize.json'), `./${name}/package.json`);
    await fs.copyFile(path.join(__dirname,'../package-lock-orm-sequelize.json'), `./${name}/package-lock.json`);
  } else if (orm === 'mongoose') {
    await fs.copyFile(path.join(__dirname, '../package-orm-mongoose.json'), `./${name}/package.json`);
    await fs.copyFile(path.join(__dirname, '../package-lock-orm-mongoose.json'), `./${name}/package-lock.json`);
  }

  const rootFiles = [
    '.env.example',
    'README.md',
    '.eslintrc.js',
    '.gitignore',
    'CHANGELOG.md',
    'tsconfig.json',
  ];

  console.log(`Copying root files`);
  for (const file of rootFiles) {
    await fs.copyFile(`../${file}`, path.join(__dirname, `./${name}/${file}`));
  }

  await fse.copy('../tests', path.join(__dirname, `./${name}/tests`));
  await fse.copy('../src', path.join(__dirname, `./${name}/src`));

  await removeFiles(
    `./${name}/src`,
    orm === 'sequelize' ? '_orm_mongoose' : '_orm_sequelize',
    orm === 'sequelize' ? '_orm_sequelize' : '._orm_mongoose',
  );
}

program
  .name('createExpressApp')
  .description('Create an Express app')
  .version('0.0.1');

program
  .option('-M, --mongoose', 'Use Mongoose ORM')
  .option('-S, --sequelize', 'Use Sequelize ORM')
  .option('-n, --name <name>', 'Name of the app');

program.parse(process.argv);

const { mongoose, sequelize, name } = program.opts();

if (mongoose && sequelize) {
  console.log('You can only choose one ORM');
  process.exit(1);
}
if (!mongoose && !sequelize) {
    console.log('You must choose one ORM');
    process.exit(1);
}

copyFiles({
  orm: mongoose ? 'mongoose' : 'sequelize',
  name,
}).catch(err => {
    console.error(err);
    process.exit(1);
});
