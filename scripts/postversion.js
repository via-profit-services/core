/* eslint-disable import/no-extraneous-dependencies */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const newPackageVersion = process.env.npm_package_version || '0.0.0';
const filesToContentReplace = ['./README.md'];

const replacements = [
  {
    name: 'version number of install info',
    regexp: /(?<=via-profit-services\/core.git#semver:)\^\d+\.\d+\.\d+/,
    replacement: newPackageVersion,
  },
  {
    name: 'version number of badges',
    regexp: /(?<=\?label=version&message=)v{0,}\d+\.\d+\.\d+/,
    replacement: newPackageVersion,
  },
];


// replace content
filesToContentReplace.forEach((filename) => {
  const filepath = path.resolve(filename);
  let content = fs.readFileSync(filepath, { encoding: 'utf8' });

  replacements.forEach(({ regexp, replacement, name }) => {
    const Reg = new RegExp(regexp, 'gmi');

    console.log(chalk.yellow(`Replace ${name} of file «${filename}»`));
    content = content.replace(Reg, replacement);
  });

  fs.writeFileSync(filepath, content, { encoding: 'utf8' });
});


spawn('git', ['add', '--all'], { stdio: 'inherit' })
  .on('exit', (addError) => {
    if (addError) {
      console.log(chalk.red('git error'));
      console.log(chalk.red(addError));
      process.exit(1);
    }

    spawn('git', ['commit', '-m', '"Bump"'], { stdio: 'inherit' })
      .on('exit', (commonError) => {
        if (commonError) {
          console.log(chalk.red('git error'));
          console.log(chalk.red(commonError));
          process.exit(1);
        }

        spawn('git', ['push', '--tags'], { stdio: 'inherit' })
          .on('exit', (pushError) => {
            if (pushError) {
              console.log(chalk.red('git error'));
              console.log(chalk.red(pushError));
              process.exit(1);
            }

            console.log(chalk.green('Operation complete'));
          });
      });
  });
