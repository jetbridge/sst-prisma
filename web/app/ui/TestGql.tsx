'use client';

import { useMutation } from '@apollo/client';
import { graphql } from '@common/generated/graphql';

const greetMutation = graphql(`mutation Greet($name: String!) {\n  greet(name: $name) {\n    greeting\n  }\n}`);

export const TestGql = () => {
  const [greet] = useMutation(greetMutation);

  return (
    <button
      onClick={() => {
        greet({ variables: { name: 'world' } });
      }}
    >
      greet
    </button>
  );
};
