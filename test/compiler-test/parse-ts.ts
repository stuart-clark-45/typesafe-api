/* eslint-disable prettier/prettier */
import fs from 'fs';
import readline from 'readline';
import { EXPECTED_ERRORS_START } from './util';

const readLines = (fullFilePath: string) => {
  const fileStream = fs.createReadStream(fullFilePath);
  return readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
};

const startPattern = new RegExp(`//\\s*${EXPECTED_ERRORS_START}\\b`);

class ParsedTS {
  public code: string[] = [];
  public expectedErrors: string[] = [];
}

export const parseTS = async (fullFilePath: string): Promise<ParsedTS> => {
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
