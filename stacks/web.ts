import { StackContext, NextjsSite } from '@serverless-stack/resources';

export function WebStack({ stack }: StackContext) {
  // Web
  // docs: https://docs.serverless-stack.com/constructs/NextjsSite
  const frontendSite = new NextjsSite(stack, 'Web', {
    path: 'web',
    environment: {
      NEXT_PUBLIC_REGION: stack.region,
    },
  });

  stack.addOutputs({
    WebURL: frontendSite.url,
  });
}
