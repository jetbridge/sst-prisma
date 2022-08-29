// TODO: I don't want to export any of these from index.ts
// I want package subpath exports in package.json to work properly with TypeScript
// so that users can say `import { sleep } from 'common/util/sleep'`
// this is still quite experimental though
// https://devblogs.microsoft.com/typescript/announcing-typescript-4-7-beta/#package-json-exports-imports-and-self-referencing
export * from './env.js';
export * from './auth.js';
export * from './gql.js';
export * from './util/index.js';

// change this
export const APP_NAME = 'myapp';
