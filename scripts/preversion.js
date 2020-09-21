/* eslint-disable import/no-extraneous-dependencies */
const { spawn } = require('child_process');
const chalk = require('chalk');


console.log(chalk.yellow('Make a new build'));
spawn('yarn', ['dist'], { stdio: 'inherit' })
  .on('exit', (buildError) => {
    if (buildError) {
      console.log(chalk.red('build error'));
      console.log(chalk.red(buildError));
      process.exit(1);
    }

    spawn('git', ['add', '--all'], { stdio: 'inherit' })
      .on('exit', (addError) => {
        if (addError) {
          console.log(chalk.red('git error'));
          console.log(chalk.red(addError));
          process.exit(1);
        }

        spawn('git', ['commit', '-m', '"Build"'], { stdio: 'inherit' })
          .on('exit', (commitError) => {
            if (commitError) {
              console.log(chalk.red('git error'));
              console.log(chalk.red(commitError));
              process.exit(1);
            }

            console.log(chalk.green('Operation complete'));
          });
      });
  });
