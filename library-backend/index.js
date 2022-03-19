require('dotenv').config()
const {
  ApolloServer,
  gql,
  UserInputError,
  AuthenticationError,
} = require('apollo-server')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

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

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: ID, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
    createUser(
      username: String!
      favoriteGenre: String!
      password: String!
    ): User
    login(username: String!, password: String!): Token
  }
`

const resolvers = {
  Query: {
    bookCount: async () => await Book.find({}).then((res) => res.length),
    authorCount: async () => await Author.find({}).then((res) => res.length),
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
    me: async (root, args, { currentUser }) => {
      return currentUser
    },
  },
  Author: {
    bookCount: async (root, args) => {
      return await Book.find({ author: root._id }).then((res) => res.length)
    },
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('Not authenticated')
      }

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
        try {
          await newAuthor.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args.author,
          })
        }
        const bookToDB = new Book({
          title: args.title,
          published: args.published,
          author: newAuthor._id,
          genres: args.genres,
        })
        try {
          await bookToDB.save()
        } catch (error) {
          throw new UserInputError(error.message, { invalidArgs: args.title })
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
    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('Not authenticated')
      }

      const author = await Author.findOne({ name: args.name })
      if (!author) {
        return null
      }
      author.born = args.setBornTo

      return await author.save()
    },
    createUser: async (root, args) => {
      const userAtDB = await User.findOne({ username: args.username })

      if (userAtDB) {
        throw new UserInputError('User already in DB.', {
          invalidArgs: args.username,
        })
      }

      const saltRounds = 10
      const passwordHash = await bcrypt.hash(args.password, saltRounds)

      const newUser = new User({
        username: args.username,
        passwordHash,
        favoriteGenre: args.favoriteGenre,
      })

      return await newUser.save().then((res) => res.toJSON())
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      const correctPassword =
        user === null
          ? false
          : await bcrypt.compare(args.password, user.passwordHash)

      if (!(user && correctPassword)) {
        throw new UserInputError('Wrong Credentials', {
          invalidArgs: args,
        })
      }

      const userToToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userToToken, process.env.JWT_SECRET) }
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
      const currentUser = await User.findById(decodedToken.id)

      return { currentUser }
    }
  },
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
