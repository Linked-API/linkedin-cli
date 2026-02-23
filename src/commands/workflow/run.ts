import * as fs from 'node:fs';

import { Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import { isStdinTty } from '@utils/tty';

export default class WorkflowRun extends BaseCommand {
  static override description = `Execute a custom workflow definition.

A workflow is a JSON object describing one or more LinkedIn actions to run sequentially.
See https://linkedapi.io/docs/building-workflows/ for the workflow format.
Available actions: https://linkedapi.io/docs/actions-overview/`;

  static override flags = {
    ...BaseCommand.baseFlags,
    file: Flags.string({
      description: 'Path to workflow JSON file',
      char: 'f',
    }),
  };

  static override examples = [
    '<%= config.bin %> workflow run --file workflow.json',
    'cat workflow.json | <%= config.bin %> workflow run',
  ];

  public async run(): Promise<void> {
    const { flags } = await this.parse(WorkflowRun);

    const client = await this.buildAuthenticatedClient();

    let workflowJson: string;

    if (flags.file) {
      if (!fs.existsSync(flags.file)) {
        process.stderr.write(`File not found: ${flags.file}\n`);
        this.exit(1);
        return;
      }

      workflowJson = fs.readFileSync(flags.file, 'utf-8');
    } else if (isStdinTty()) {
      process.stderr.write('No workflow definition provided. Use --file or pipe via stdin.\n');
      this.exit(5);
      return;
    } else {
      workflowJson = await readStdin();

      if (!workflowJson.trim()) {
        process.stderr.write('No workflow definition provided via stdin.\n');
        this.exit(5);
        return;
      }
    }

    let definition: unknown;

    try {
      definition = JSON.parse(workflowJson);
    } catch {
      process.stderr.write('Invalid JSON in workflow definition.\n');
      this.exit(1);
      return;
    }

    try {
      const result = await runWorkflow(client.customWorkflow, definition, {
        isQuiet: flags.quiet,
      });

      formatOutput({
        data: result.data,
        errors: result.errors,
        isJson: flags.json,
        fields: flags.fields,
        isQuiet: flags.quiet,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}
