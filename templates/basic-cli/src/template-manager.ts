import path from 'path';
import fs from 'fs-extra';


interface Template {
  name: string;
  path: string;
  description?: string;
  source: string;
}

export class TemplateManager {
  private templateDirs: string[] = [];

  constructor() {
    // Default template directories
    this.addTemplateDir(path.join(__dirname, '../templates')); // Built-in templates

    // User's home directory templates
    const userTemplatesDir = path.join(process.env.HOME || process.env.USERPROFILE || '', '.use-template/templates');
    this.addTemplateDir(userTemplatesDir);

    // Local project templates
    const localTemplatesDir = path.join(process.cwd(), 'templates');
    this.addTemplateDir(localTemplatesDir);

    // Read from environment variable if set
    const envTemplatesDir = process.env.USE_TEMPLATE_DIR;
    if (envTemplatesDir) {
      envTemplatesDir.split(path.delimiter).forEach(dir => this.addTemplateDir(dir));
    }
  }

  addTemplateDir(dir: string) {
    if (!this.templateDirs.includes(dir)) {
      this.templateDirs.push(dir);
    }
  }

  async getTemplates(): Promise<Template[]> {
    const templates: Template[] = [];

    for (const dir of this.templateDirs) {
      if (!fs.existsSync(dir)) continue;

      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const templatePath = path.join(dir, entry.name);
          const packageJsonPath = path.join(templatePath, 'package.json');
          let description = '';

          if (fs.existsSync(packageJsonPath)) {
            const packageJson = await fs.readJson(packageJsonPath);
            description = packageJson.description || '';
          }

          templates.push({
            name: entry.name,
            path: templatePath,
            description,
            source: path.relative(process.cwd(), dir)
          });
        }
      }
    }

    return templates;
  }

  getTemplateDirs(): string[] {
    return this.templateDirs;
  }
}