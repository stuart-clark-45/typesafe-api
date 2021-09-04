/* eslint-disable prettier/prettier */
import fs from 'fs';
import readline from 'readline';
import { getCompilerErrors, getTestFiles } from './util';

const readLines = (fullFilePath: string) => {
  const fileStream = fs.createReadStream(fullFilePath);
  return readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
};

const startToken = '@expected-compiler-errors-start';
const startPattern = new RegExp(`//\\s*${startToken}\\b`);

class ParsedTS {
  public code: string[] = [];
  public expectedErrors: string[] = [];
}

const parseTS = async (fullFilePath: string): Promise<ParsedTS> => {
  let isCode = true;
  const parsedFile = new ParsedTS();

  for await (const line of readLines(fullFilePath)) {
    if (line.match(startPattern)) {
      isCode = false;
    }

    if (isCode) {
      parsedFile.code.push(line);
    } else {
      parsedFile.expectedErrors.push(line);
    }
  }

  return parsedFile;
};

const run = async () => {
  for (const file of await getTestFiles()) {
    const {code} = await parseTS(file);

    // Remove blank lines form the end of code
    for (let i = code.length - 1; i >= 0; i--) {
      const line = code[i];
      if (!line.length || line.match(/^\s*\n$/)) {
        code.pop();
      } else  {
        break;
      }
    }

    const errors = await getCompilerErrors(file);

    // Build the new code for the file
    const newCode = [
      ...code,
      "",
      `// ${startToken}`,
      ...errors.map((s) => `// ${s}`),
      ""
    ].join("\n");

    fs.writeFileSync(file, newCode);
  }
};

run().catch((err) => {
  console.log(err);
  process.exit(1);
});
