// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const path = require('path');
const readline = require('readline');

/**
 * Base Generator for LoopBack 4
 */
module.exports = class BaseGenerator extends Generator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
    this._setupGenerator();
  }

  /**
   * Subclasses can extend _setupGenerator() to set up the generator
   */
  _setupGenerator() {
    this.option('config', {
      type: String,
      description: 'JSON file to configure options',
    });

    this.option('skip-optional-prompts', {
      type: Boolean,
      description:
        'Run the generator in the mode without prompting optional questions',
    });

    this.artifactInfo = {
      rootDir: 'src',
    };
  }

  /**
   * Read a json document from stdin
   */
  _readJSONFromStdin() {
    const rl = readline.createInterface({
      input: process.stdin,
      // output: process.stdout,
    });

    const lines = [];
    if (process.stdin.isTTY) {
      this.log(
        chalk.green(
          'Please type in a json object line by line ' +
            '(Press <ctrl>-D or type EOF to end):',
        ),
      );
    }

    let err;
    return new Promise((resolve, reject) => {
      rl
        .on('SIGINT', () => {
          err = new Error('Canceled by user');
          rl.close();
          reject(err);
        })
        .on('line', line => {
          if (line === 'EOF') {
            rl.close();
          } else {
            lines.push(line);
          }
        })
        .on('close', () => {
          if (err) return;
          const jsonStr = lines.join('\n');
          try {
            const json = JSON.parse(jsonStr);
            resolve(json);
          } catch (e) {
            this.log(chalk.red(e));
            if (!process.stdin.isTTY) {
              this.log(chalk.red(jsonStr));
            }
            reject(e);
          }
        })
        .on('error', e => {
          err = e;
          rl.close();
          reject(err);
        });
    });
  }

  async setOptions() {
    let opts = {};
    const jsonFile = this.options.config;
    try {
      if (jsonFile === 'stdin' || !process.stdin.isTTY) {
        this.options['skip-optional-prompts'] = true;
        opts = await this._readJSONFromStdin();
      } else if (typeof jsonFile === 'string') {
        opts = this.fs.readJSON(path.resolve(process.cwd(), jsonFile));
      }
    } catch (e) {
      this.exit(e);
      return;
    }
    if (!(typeof opts === 'object')) {
      this.exit('Invalid config file: ' + jsonFile);
      return;
    }
    for (const o in opts) {
      if (this.options[o] == null) {
        this.options[o] = opts[o];
      }
    }
  }

  /**
   * Override the base prompt to skip prompts with default answers
   * @param questions One or more questions
   */
  async prompt(questions) {
    if (!this.options['skip-optional-prompts']) {
      if (!process.stdin.isTTY) {
        this.log(
          chalk.red('The stdin is not a terminal. No prompt is allowed.'),
        );
        process.exit(1);
      }
      // Non-express mode, continue to prompt
      return await super.prompt(questions);
    }
    // Normalize the questions to be an array
    if (!Array.isArray(questions)) {
      questions = [questions];
    }

    const answers = Object.assign({}, this.options);

    // Check if a question can be skipped in `express` mode
    const canBeSkipped = q =>
      q.default != null || // Having a default value
      this.options[q.name] != null || // Configured in options
      q.type === 'checkbox' || // A checkbox
      q.type === 'confirm'; // A confirmation

    // Get the default answer for a question
    const defaultAnswer = async q => {
      if (typeof q.default === 'function') {
        return await q.default(answers);
      }
      const defaultVal = q.default || this.options[q.name];
      if (defaultVal != null) return defaultVal;
      if (q.type === 'confirm') {
        return true;
      }
      return undefined;
    };

    for (const q of questions) {
      if (canBeSkipped(q)) {
        answers[q.name] = await defaultAnswer(q);
      } else {
        if (!process.stdin.isTTY) {
          this.log(
            chalk.red('The stdin is not a terminal. No prompt is allowed.'),
          );
          process.exit(1);
        }
        // Only prompt for non-skipped questions
        const props = await super.prompt([q]);
        Object.assign(answers, props);
      }
    }
    return answers;
  }

  /**
   * Override the usage text by replacing `yo loopback4:` with `lb4 `.
   */
  usage() {
    const text = super.usage();
    return text.replace(/^yo loopback4:/g, 'lb4 ');
  }

  /**
   * Tell this generator to exit with the given reason
   * @param {string|Error} reason
   */
  exit(reason) {
    // exit(false) should not exit
    if (reason === false) return;
    // exit(), exit(undefined), exit('') should exit
    if (!reason) reason = true;
    this.exitGeneration = reason;
  }

  /**
   * Check if the generator should exit
   */
  shouldExit() {
    return !!this.exitGeneration;
  }

  /**
   * Print out the exit reason if this generator is told to exit before it ends
   */
  end() {
    if (this.shouldExit()) {
      this.log(chalk.red('Generation is aborted:', this.exitGeneration));
      return false;
    }
    return true;
  }
};
