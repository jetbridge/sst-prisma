'use client'

import { useMutation } from '@apollo/client'
import { graphql } from '@common/generated/graphql'

const greetMutation = graphql('mutation Greet($name: String!) {\n  greet(name: $name) {\n    greeting\n  }\n}')

export const Greet = () => {
  const [greet, { data: greetResult, loading }] = useMutation(greetMutation)

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
