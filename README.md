# Serverless Stack + Prisma + RDS: Starter Kit

## What is this?

If you want to build a serverless app with AWS CDK, Lambda, and Postgres, this is the template for you.

## Quickstart

Assumes you have Node 16 installed and AWS credentials configured.

```shell
npm i -g pnpm
pnpm i
pnpm start
```

## Features

All features are optional, delete what you don't need.

- [Serverless Stack](https://serverless-stack.com/)
- [AWS CDK](https://aws.amazon.com/cdk/)
- GraphQL + TS + apollo client codegen
- REST API gateway
- Prisma ORM
- Prisma lambda layer
- Prisma DB migrations
- Aurora Serverless RDS Postgres
- NextJS frontend w/ Material-UI
- Integration test setup with postgres in docker
- Local development (`pnpm start`) - uses SST
- [pnpm](https://pnpm.io/) package manager
- Fast tests with [vitest](https://vitest.dev/)
- ES Modules
