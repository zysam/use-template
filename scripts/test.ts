import * as path from 'path';
import * as fs from 'fs-extra';
import { createFromTemplate } from '../src';

async function test() {
  // Test creating from template
  const projectName = 'test-project-01';
  const templatePath = path.join(__dirname, '../templates/basic-cli');
  const newProjectPath = path.join(__dirname, `./test-output/${projectName}`);

  // Clean up test directory
  await fs.remove(newProjectPath);

  try {
    await createFromTemplate({
      templatePath,
      targetPath: newProjectPath,
      skipGitIgnore: true,
      projectName
    });
    console.log('✅ Successfully created project from template');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

test();
