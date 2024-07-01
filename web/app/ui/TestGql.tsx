'use client';

import * as GQL from '../../../common/graphql/generated/gql';

export const TestGql = () => {
  const [greet] = GQL.useGreetMutation();

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
