import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: '../graphql/schema/*.graphql',
  documents: '../graphql/documents/*.graphql',
  generates: {
    'src/generated/gql/': {
      preset: 'client',
      plugins: [],
    },
    // output combined graphql schema
    '../graphql/generated/schema.graphql': {
      config: {
        // include AppSync directives in the generated schema
        includeDirectives: true,
      },
      plugins: ['schema-ast'],
    },
  },
};

export default config;
