#!/usr/bin/env node
import { setupCLI } from './cli';

async function main() {
  const program = await setupCLI();
  program.parse();
}

main(); 