'use client'

import * as GQL from '../../../../../common/graphql/generated/gql'

export const Greet = () => {
  const [greet, { data: greetResult, loading }] = GQL.useGreetMutation()

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <button
        onClick={() => {
          greet({ variables: { name: 'world' } })
        }}
      >
        greet
      </button>

      {loading && <progress className="m-4 w-48" />}
      {greetResult && <div>{greetResult.greet?.greeting}</div>}
    </div>
  )
}
