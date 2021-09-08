import { getCompilerErrors, getTestFiles } from './util';
import { parseTS } from './parse-ts';

type AllFileErrors = {
  [key: string]: string[];
};

it('Compiler errors', async () => {
  const expected: AllFileErrors = {};
  const actual: AllFileErrors = {};

  for (const file of await getTestFiles()) {
    const errors = await getCompilerErrors(file);
    // Add "// " to make them the same as the parsed errors
    actual[file] = errors.map((s) => `// ${s}`);

    const { expectedErrors } = await parseTS(file);
    expected[file] = expectedErrors.slice(1);
  }

  expect(actual).toEqual(expected);
}, 30000);
