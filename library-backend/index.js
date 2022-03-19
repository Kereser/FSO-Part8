require('dotenv').config()
const { ApolloServer, gql, UserInputError } = require('apollo-server')
const { v1: uuid } = require('uuid')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')

const MONGODB_URI = process.env.MONGODB_URI

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Successfully connect to MongoDB'))
  .catch((error) => {
    console.log(error.message)
  })

const typeDefs = gql`
  type Author {
    name: String!
    born: Int
    bookCount: Int
    id: ID!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: ID, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
  }
`

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: async (root, args) => {
      const author = await Author.findById(args.author)
      if (!args.author && !args.genre) {
        return await Book.find({}).populate('author')
      }
      if (args.author && args.genre) {
        return await Book.find({
          genres: { $in: [args.genre] },
          author: author._id,
        }).populate('author')
      }
      if (args.author && !args.genre) {
        return await Book.find({ author: author._id }).populate('author')
      }
      return await Book.find({ genres: { $in: [args.genre] } }).populate(
        'author',
      )

      //? Solo tengo arreglada la parte de allBooks. De resto falta todo del 8.13
    },
    allAuthors: async () => await Author.find({}),
  },
  Author: {
    bookCount: async (root, args) => {
      return await Book.find({ author: root._id }).then((res) => res.length)
    },
  },
  Mutation: {
    addBook: async (root, args) => {
      const bookAtDb = await Book.findOne({ title: args.title })
      const author = await Author.findOne({ name: args.author })

      if (bookAtDb) {
        throw new UserInputError('Book is already added to the DB', {
          invalidArgs: args,
        })
      }

      if (!author) {
        const newAuthor = new Author({
          name: args.author,
        })
        await newAuthor.save()
        const bookToDB = new Book({
          title: args.title,
          published: args.published,
          author: newAuthor._id,
          genres: args.genres,
        })
        try {
          await bookToDB.save()
        } catch (error) {
          throw new UserInputError(error.message, { invalidArgs: args })
        }
        return await bookToDB.populate('author')
      }

      const bookToDB = new Book({
        title: args.title,
        published: args.published,
        author: author._id,
        genres: args.genres,
      })
      try {
        await bookToDB.save()
      } catch (error) {
        throw new UserInputError(error.message, { invalidArgs: args })
      }
      return await bookToDB.populate('author')
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name })
      if (!author) {
        return null
      }
      author.born = args.setBornTo

      return await author.save()
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
