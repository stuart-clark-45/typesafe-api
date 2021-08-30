import { replaceUrlParams } from '../src';

it('replaceUrlParams(..)', async () => {
  const params = { a: 1, b: 2 };
  const path = '/something/:a/:b';
  expect(replaceUrlParams(path, params)).toBe('/something/1/2');
});
