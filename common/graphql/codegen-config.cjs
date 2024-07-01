/**
 * @type {import('@graphql-codegen/cli').CodegenConfig}
 */
const config = {
  schema: 'common/graphql/schema/*.graphql',
  documents: ['common/graphql/documents/**/*.{ts,graphql}'],
  ignoreNoDocuments: true, // for better experience with the watcher
  config: {
    enumsAsTypes: true,
    maybeValue: 'T | null | undefined',
    arrayInputCoercion: false,
    strictScalars: true,
    useTypeImports: true,
    scalars: {
      AWSDate: 'any',
      AWSDateTime: 'any',
      AWSEmail: 'any',
      AWSIPAddress: 'any',
      AWSJSON: 'any',
      AWSPhone: 'any',
      AWSTime: 'any',
      AWSTimestamp: 'any',
      AWSURL: 'any',
      ID: 'string',
    },
  },
  generates: {
    // output combined graphql schema
    'schema/generated/platform.graphql': {
      config: {
        // include AppSync directives in the generated schema
        includeDirectives: true,
      },
      plugins: ['schema-ast'],
    },
    'common/graphql/generated/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
        fragmentMasking: { unmaskFunctionName: 'getFragment' },
        useTypeImports: true,
        documentMode: 'string', // reduce bundle size https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#documentmode
      },
    },
  },
};

module.exports = config;
// export default config
