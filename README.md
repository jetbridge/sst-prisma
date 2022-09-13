# Serverless Stack + Prisma - Starter Kit

## What is this?

If you want to build a serverless app with AWS CDK, Lambda, and Postgres, this is the template for you.

You can click "Use this template" button in GitHub to fork this repo. You can [merge](https://stackoverflow.com/a/69563752) in improvements in this repo to your project over time.

Clone your copy of this template, then do a search and replace for "myapp" to give it a name.

## Quickstart

### Prerequisites

Assumes you have [Node 16](https://nodejs.org/en/download/current/) installed and AWS credentials [configured](https://serverless-stack.com/chapters/configure-the-aws-cli.html).

### Setup

```shell
npm i -g pnpm  # install pnpm globally
pnpm i  # install dependencies + generate types from DB and GQL schemas
pnpm start  # start backend
```

## Features

All features are optional, delete what you don't need.

Click links to learn more and view documentation.

- 🌩 [Serverless Stack](https://serverless-stack.com/) - powerful CDK developer experience tools
- 🌤 [AWS CDK](https://aws.amazon.com/cdk/) - cloud-native infrastructure as code
- ፨ [GraphQL API](https://docs.serverless-stack.com/constructs/GraphQLApi)
  - ⇅ [AWS AppSync](https://docs.aws.amazon.com/appsync/latest/devguide/what-is-appsync.html) - serverless GraphQL AWS service
  - ✽ [Code generation](https://www.graphql-code-generator.com/) of [TypeScript](https://www.graphql-code-generator.com/docs/guides/front-end-typescript-only) + [apollo client](https://www.graphql-code-generator.com/plugins/typescript-react-apollo)
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
- ⚡️ [Live local lambda development](https://docs.serverless-stack.com/live-lambda-development) (`pnpm start`)
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
pnpm start
```

### Start Nextjs frontend dev server

```shell
pnpm start:web
```

### Start backend and frontend together

```shell
pnpm fullstack
```

### Run/generate DB migrations locally

```shell
pnpm db:migrate:dev
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
