import { gql } from '@apollo/client'

//? Queries
export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      bookCount
      name
      born
    }
  }
`

export const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      author {
        name
        born
        bookCount
      }
      published
      genres
    }
  }
`

export const ALL_BOOKS_WITH_GENRE = gql`
  query allBookGenre($genre: String!) {
    allBooks(genre: $genre) {
      title
      author {
        name
        bookCount
        born
      }
      published
      genres
    }
  }
`

export const ME = gql`
  query {
    me {
      username
      favoriteGenre
    }
  }
`

//? Mutations
export const ADD_BOOK = gql`
  mutation addingBook(
    $title: String!
    $published: Int!
    $author: String!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      published: $published
      author: $author
      genres: $genres
    ) {
      title
      published
      author {
        name
        bookCount
        born
      }
      genres
      id
    }
  }
`

export const EDIT_AUTHOR = gql`
  mutation editBorn($name: String!, $born: Int!) {
    editAuthor(name: $name, setBornTo: $born) {
      name
      born
      bookCount
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`
