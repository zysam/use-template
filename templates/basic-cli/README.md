# basic-cli
A powerful CLI tool for creating new projects from templates. This tool helps you quickly scaffold new projects using either built-in templates or your own custom templates.

## Features

- 🚀 Create new projects from templates with a simple interactive CLI
- 📁 Support for multiple template locations:
  - Built-in templates
  - User-specific templates (`~/.basic-cli/templates`)
  - Local project templates (`./templates`)
  - Custom template directories via environment variable
- 🔍 List available templates with descriptions
- ⚡ Skip files specified in .gitignore during template copying
- 💪 Support for template customization

## Installation

```bash
npm install -g basic-cli
```
## Usage

### List Available Templates

```bash
basic-cli list
```
This command shows all available templates and their locations.

### Create a New Project

```bash
basic-cli create <template-name>
```
This interactive command will:
1. Show a list of available templates
2. Prompt for your new project name
3. Create a new project based on the selected template

You can also specify an additional template directory:

```bash
basic-cli create -t /path/to/templates
```

## Template Locations

Templates are searched in the following locations:

1. Built-in templates directory
2. User's home directory: `~/.basic-cli/templates`
3. Local project directory: `./templates`
4. Custom locations specified in `USE_TEMPLATE_DIR` environment variable

### Setting Custom Template Locations

You can set additional template locations using the `USE_TEMPLATE_DIR` environment variable:

```bash
export USE_TEMPLATE_DIR=/path/to/templates
```

## Creating Your Own Templates

1. Create a new directory in any of the template locations
2. Add your template files
3. (Optional) Include a `package.json` with a description field to provide template information
4. Your template will automatically appear in the template list

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.