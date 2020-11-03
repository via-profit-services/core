/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import glob from 'glob';

export const listMigrationsPerPackage = () => {
  const list: Array<{
    project: string;
    files: {
      migrations: string[];
      seeds: string[];
    };
  }> = [];
  const projectsList = glob.sync(`${process.cwd()}/node_modules/@via-profit-services/*/`);
  projectsList.forEach((projectPath) => {
    const projectName = path.basename(projectPath);
    const projectInfo: { migrations: string[]; seeds: string[]; [key: string]: string[] } = {
      migrations: [],
      seeds: [],
    };
    const migrationSearchPattern = `${projectPath}dist/database/@(migrations|seeds)/*.ts`;

    const projectMigrationFiles = glob.sync(migrationSearchPattern);
    projectMigrationFiles.forEach((filename) => {
      if (!filename.match(/\.d\.ts$/)) {
        const dir = path.basename(path.dirname(filename));
        projectInfo[dir].push(filename);
      }
    });

    list.push({
      project: projectName,
      files: projectInfo,
    });
  });

  return list;
};

export const getMigrations = (params: { migrations: string; seeds: string }) => {

  console.log('migrations', params.migrations)
  console.log('seeds', params.seeds)

  const migrationsListPerPackage = listMigrationsPerPackage();

  migrationsListPerPackage.forEach((projectData) => {
    const { files, project } = projectData;

    if (params.migrations) {
      let affected = 0;
      console.log('');
      console.log(`Migrations from project ${chalk.magenta(project)}`);
      const migrationsDestPath = path.resolve(process.cwd(), params.migrations);
      if (!fs.existsSync(migrationsDestPath)) {
        fs.mkdirSync(migrationsDestPath, {
          recursive: true,
        });
      }

      files.migrations.forEach((migrationSourceFile) => {
        const destinationFile = path.join(migrationsDestPath, path.basename(migrationSourceFile));
        if (!fs.existsSync(destinationFile)) {
          affected += 1;
          fs.copyFileSync(migrationSourceFile, destinationFile);
          console.log(
            `${chalk.yellow('Was created migration file')} ${chalk.cyan(path.basename(migrationSourceFile))}`,
          );
        }
      });

      if (affected) {
        console.log(`${chalk.bold.green(affected.toString())} ${chalk.yellow('file[s] was copied')}`);
      } else {
        console.log(chalk.grey('No files was copied'));
      }
    }

    if (params.seeds) {
      let affected = 0;
      console.log('');
      console.log(`Seeds for ${chalk.magenta(project)}`);

      const seedsDestPath = path.resolve(process.cwd(), params.seeds);
      if (!fs.existsSync(seedsDestPath)) {
        fs.mkdirSync(seedsDestPath, {
          recursive: true,
        });
      }
      files.seeds.forEach((seedSourceFile) => {
        const destinationFile = path.join(seedsDestPath, path.basename(seedSourceFile));
        if (!fs.existsSync(destinationFile)) {
          affected += 1;
          fs.copyFileSync(seedSourceFile, destinationFile);
          console.log(`${chalk.yellow('Was created seed file')} ${chalk.cyan(path.basename(seedSourceFile))}`);
        }
      });

      if (affected) {
        console.log(`${chalk.bold.green(affected.toString())} ${chalk.yellow('file[s] was copied')}`);
      } else {
        console.log(chalk.grey('No files was copied'));
      }
    }
  });
};


export const resolveKnexfile = (knexfile: string) => path.resolve(process.cwd(), knexfile);

export const execKnex = async (knexCommand: string, knexfile: string) => {
  const localKnexfile = resolveKnexfile(knexfile);

  return new Promise((resolve) => {
    const command = `knex ${knexCommand} --knexfile ${localKnexfile}`;

    if (!fs.existsSync(localKnexfile)) {
      console.log(chalk.red(`Knexfile not found in «${localKnexfile}»`));
      process.exit(1);
    }

    spawn('yarn', command.split(' '), { stdio: 'inherit' })
      .on('exit', (error) => {
        if (error) {
          console.log(chalk.red(`Failed to execute knex command ${command}`));
          console.log(chalk.red(error));
          process.exit(1);
        }

        resolve();
      });
  });
};
