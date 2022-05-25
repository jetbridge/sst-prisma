import { DocumentNode } from 'graphql/language/ast';
import { gql } from 'graphql-tag';

export const Greet: DocumentNode = gql`
  mutation Greet($name: String!) {
    greet(name: $name) {
      greeting
    }
  }
`;
