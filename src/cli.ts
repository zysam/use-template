import { Command } from 'commander';
import * as inquirer from 'inquirer';
import * as path from 'path';
import * as fs from 'fs-extra';
import { createFromTemplate } from './index';
import { TemplateManager } from './template-manager';

const program = new Command();


async function setupCLI() {
  const templateManager = new TemplateManager();

  program
    .name('use-template')
    .description('CLI to create and manage project templates')
    .version('1.0.0');

  program
    .command('list')
    .description('List all available templates')
    .action(async () => {
      const templates = await templateManager.getTemplates();
      if (templates.length === 0) {
        console.log('No templates found.');
        console.log('\nTemplate search paths:');
        templateManager.getTemplateDirs().forEach(dir => {
          console.log(`- ${dir}`);
        });
        return;
      }

      console.log('\nAvailable templates:');
      templates.forEach(template => {
        console.log(`\n- ${template.name} (from ${template.source})`);
        if (template.description) {
          console.log(`  ${template.description}`);
        }
      });

      console.log('\nTemplate search paths:');
      templateManager.getTemplateDirs().forEach(dir => {
        console.log(`- ${dir}`);
      });
    });

  program
    .command('create')
    .description('Create a new project from a template')
    .option('-t, --template-dir <dir>', 'Additional template directory')
    .action(async (options) => {
      if (options.templateDir) {
        templateManager.addTemplateDir(path.resolve(options.templateDir));
      }

      const templates = await templateManager.getTemplates();

      if (templates.length === 0) {
        console.log('No templates available. Please add templates to one of these directories:');
        templateManager.getTemplateDirs().forEach(dir => {
          console.log(`- ${dir}`);
        });
        return;
      }

      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'template',
          message: 'Select a template:',
          choices: templates.map(t => ({
            name: `${t.name} (from ${t.source})${t.description ? ` - ${t.description}` : ''}`,
            value: t
          }))
        },
        {
          type: 'input',
          name: 'projectName',
          message: 'Enter the new project name:',
          validate: (input: string) => {
            if (!input.trim()) return 'Project name is required';
            if (!/^[a-z0-9-_]+$/.test(input)) {
              return 'Project name can only contain lowercase letters, numbers, hyphens, and underscores';
            }
            return true;
          }
        },
        // target path
        {
          type: 'input',
          name: 'targetPath',
          message: 'Enter the target path(relative to current directory):',
          default: process.cwd()
        },
        {
          type: 'confirm',
          name: 'isReplaceAll',
          message: 'Replace all occurrences of the project name in the template?',
          default: false
        }
      ]);

      let absTargetPath: string;
      if (answers.targetPath.startsWith('/')) {
        absTargetPath = path.resolve(answers.targetPath);
      } else {
        absTargetPath = path.resolve(process.cwd(), answers.targetPath);
      }

      const targetPath = path.join(absTargetPath, answers.projectName);

      try {
        await createFromTemplate({
          templatePath: answers.template.path,
          targetPath,
          skipGitIgnore: true,
          projectName: answers.projectName,
          isReplaceAll: answers.isReplaceAll
        });
        console.log(`\n✅ Successfully created project: ${answers.projectName}`);
      } catch (error) {
        console.error('❌ Failed to create project:', error);
      }
    });

  return program;
}

export { setupCLI }; 