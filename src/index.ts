import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';
import Debug from 'debug';

const debug = Debug('use-template:index');

interface CreateOptions {
  templatePath: string;
  targetPath: string;
  skipGitIgnore?: boolean;
  projectName?: string;

  isReplaceAll?: boolean;
}

const defaultSkipFiles = ['node_modules/**', 'dist/**', '.git/**'];

async function replaceProjectName(filePath: string, oldName: string, newName: string) {
  const content = await fs.readFile(filePath, 'utf-8');
  const updated = content.replace(new RegExp(oldName, 'g'), newName);
  await fs.writeFile(filePath, updated);
}

async function updateProjectFiles(targetPath: string, projectName: string, isReplaceAll = false) {
  debug('isReplaceAll', isReplaceAll);
  const defaultReplaceFiles = ['package.json', 'README.md'];
  const packageJsonPath = path.join(targetPath, defaultReplaceFiles[0]);
  const readmePath = path.join(targetPath, defaultReplaceFiles[1]);

  if (fs.existsSync(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    const oldName = packageJson.name;

    // Update package.json
    packageJson.name = projectName;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    // Update README.md if it exists
    if (fs.existsSync(readmePath)) {
      await replaceProjectName(readmePath, oldName, projectName);
    }

    if (!isReplaceAll) {
      return;
    }


    // Find and update other files that might contain the project name
    const files = await glob('**/*', {
      cwd: targetPath,
      dot: true,
      ignore: [...defaultSkipFiles, ...defaultReplaceFiles],
      nodir: true
    });

    debug('files', files);

    const textFileExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.yml', '.yaml', '.html'];

    for (const file of files) {
      const filePath = path.join(targetPath, file);
      const ext = path.extname(filePath);

      // Only process text files
      if (textFileExtensions.includes(ext)) {
        const content = await fs.readFile(filePath, 'utf-8');
        if (content.includes(oldName)) {
          await replaceProjectName(filePath, oldName, projectName);
        }
      }
    }
  }
}

function convertGitIgnoreToGlob(pattern: string): string {
  // Remove leading and trailing whitespace
  pattern = pattern.trim();

  // Convert common gitignore patterns to glob
  if (pattern.startsWith('/')) {
    pattern = pattern.slice(1); // Remove leading slash
  }
  if (pattern.endsWith('/')) {
    pattern += '**'; // Add globstar for directories
  }
  if (!pattern.includes('*') && !pattern.endsWith('/')) {
    pattern = `**/${pattern}`; // Make pattern match files in all subdirectories
  }

  return pattern;
}

async function createFromTemplate(options: CreateOptions) {
  const { templatePath, targetPath, skipGitIgnore = true, projectName } = options;

  // Ensure paths are absolute
  const absoluteTemplatePath = path.resolve(templatePath);
  const absoluteTargetPath = path.resolve(targetPath);

  // Check if template exists
  if (!fs.existsSync(absoluteTemplatePath)) {
    throw new Error(`Template path does not exist: ${absoluteTemplatePath}`);
  }

  // Read gitignore if needed
  let ignorePatterns = [...defaultSkipFiles];
  if (skipGitIgnore) {
    const gitignorePath = path.join(absoluteTemplatePath, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignorePatterns = fs
        .readFileSync(gitignorePath, 'utf-8')
        .split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(convertGitIgnoreToGlob);
      ignorePatterns = [...ignorePatterns, ...gitignorePatterns];
    }
  }
  debug('ignorePatterns', ignorePatterns);

  // Copy files
  const files = await glob('**/*', {
    cwd: absoluteTemplatePath,
    dot: true,
    ignore: ignorePatterns,
    nodir: false
  });

  // debug
  debug('files', files);

  // return;

  for (const file of files) {
    const sourcePath = path.join(absoluteTemplatePath, file);
    const targetFilePath = path.join(absoluteTargetPath, file);

    if (fs.statSync(sourcePath).isDirectory()) {
      await fs.ensureDir(targetFilePath);
    } else {
      await fs.copy(sourcePath, targetFilePath);
    }
  }

  // Update project name in files if provided
  if (projectName) {
    await updateProjectFiles(absoluteTargetPath, projectName);
  }
}

export {
  createFromTemplate,
  type CreateOptions
};
