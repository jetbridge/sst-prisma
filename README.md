# Serverless Stack + Prisma - Starter Kit

## What is this?

If you want to build a serverless app with AWS CDK, Lambda, and Postgres, this is the template for you.

You can click "Use this template" button in GitHub to fork this repo. You can [merge](https://stackoverflow.com/a/69563752) in improvements in this repo to your project over time.

Clone your copy of this template, then do a search and replace for "myapp" to give it a name.

## Quickstart

### Prerequisites

Assumes you have [Node 20](https://nodejs.org/en/download/current/) installed and AWS credentials [configured](https://docs.sst.dev/advanced/iam-credentials).

### Setup

Edit `sst.config.ts` and set your default AWS profile and region.

```shell
npm i -g pnpm  # install pnpm globally
pnpm i  # install dependencies + generate types from DB and GQL schemas
pnpm db:migrate  # run DB migrations
pnpm dev  # start local dev server
```

### Config

Set your default AWS profile and region in `sst.config.ts`.

Edit .env or .env.$stage to set infrastructure vars.

## Features

All features are optional, delete what you don't need.

Click links to learn more and view documentation.

- 🌩 [Serverless Stack](https://serverless-stack.com/) - powerful CDK developer experience tools
- 🌤 [AWS CDK](https://aws.amazon.com/cdk/) - cloud-native infrastructure as code
- ፨ [GraphQL API](https://docs.serverless-stack.com/constructs/GraphQLApi)
  - ⇅ [AWS AppSync](https://docs.aws.amazon.com/appsync/latest/devguide/what-is-appsync.html) - serverless GraphQL AWS service
  - ✽ [Code generation](https://www.graphql-code-generator.com/) of [TypeScript](https://www.graphql-code-generator.com/docs/guides/front-end-typescript-only) + [react client](https://the-guild.dev/graphql/codegen/docs/guides/react-vue)
- 🌐 [REST API gateway](https://docs.serverless-stack.com/api)
- 🖥 [NextJS](https://nextjs.org/) frontend w/ Material-UI
  - 🎨 [Material-UI](https://mui.com/material-ui/getting-started/overview/) - react components and styling solution
  - 🔓 [NextAuth.js](https://next-auth.js.org/) - authentication and session management
- 🔓 [AWS Cognito](https://aws.amazon.com/cognito/) - authentication backend
- 💾 [Prisma ORM](https://www.prisma.io/docs/)
  - 📚 Prisma engine lambda layer
  - 📜 Prisma DB migration CDK script
  - 🐳 Database integration test setup with postgres in docker
- 🔋 [Aurora Serverless RDS](https://aws.amazon.com/rds/aurora/serverless/) PostgreSQL
- ⚡️ [Live local lambda development](https://docs.serverless-stack.com/live-lambda-development) (`pnpm dev`)
  - 🐞 [Lambda debugging](https://docs.sst.dev/live-lambda-development#debugging-with-visual-studio-code) - set breakpoints on your lambda functions and step through in your IDE
- 📦 [pnpm](https://pnpm.io/) - fast and correct package manager
- 🚅 [vitest](https://vitest.dev/) - fast tests
- 🐛 [ES Modules](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/)
- 🔧 [ESBuild](https://esbuild.github.io/) - fast code bundling on backend (under the hood) with tree-shaking
- 🫙 [Middy](https://middy.js.org/) - middleware for Lambda functions
- 🛠 [AWS Lambda Powertools](https://awslabs.github.io/aws-lambda-powertools-typescript/latest/) - for [custom metrics](https://awslabs.github.io/aws-lambda-powertools-typescript/latest/core/metrics/), [structured logging](https://awslabs.github.io/aws-lambda-powertools-typescript/latest/core/logger/), and [tracing](https://awslabs.github.io/aws-lambda-powertools-typescript/latest/core/tracer/).

## Package scripts

Please see [package.json](package.json) `scripts` for more.

### Start live backend dev server with AWS

```shell
pnpm dev
```

### Start Nextjs frontend dev server

```shell
pnpm dev:web
```

### Run/generate DB migrations locally

```shell
pnpm db:migrate
```

### Just watch and perform type-checking

```shell
pnpm watch
```

### Deploy to your AWS environment

```shell
pnpm deploy
```

### Deploy to specific AWS environment (region/profile)

```shell
pnpm deploy --region eu-west-1 --profile dev
```

### All SST/CDK commands

```shell
pnpm exec sst
pnpm exec cdk
```
