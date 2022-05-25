import { DocumentNode } from "graphql/language/ast";
import { gql } from "graphql-tag";

export const SayHello: DocumentNode = gql`
  mutation SayHello($name: String!) {
    sayHello(name: $name) {
      greeting
    }
  }
`;
