require('dotenv').config()
const { UserInputError, AuthenticationError } = require('apollo-server')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
  Query: {
    bookCount: async () => await Book.find({}).then((res) => res.length),
    authorCount: async () => {
      console.log('Entro a buscar autores')
      return await Author.find({}).then((res) => res.length)
    },
    allBooks: async (root, args) => {
      console.log('Entro a todos los libros.', args)
      const author = await Author.findById(args.author)
      if ((!args.author && !args.genre) || args.genre === 'all books') {
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
    },
    allAuthors: async () => await Author.find({}),
    me: async (root, args, { currentUser }) => {
      return currentUser
    },
  },
  Author: {
    bookCount: async (root, args) => {
      console.log('Entro pa buscar los libros', root)
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
            invalidArgs: args,
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
          console.log('Falla guardada de libro')
          await Author.deleteOne({ _id: newAuthor._id })
          throw new UserInputError(error.message, { invalidArgs: args })
        }
        pubsub.publish('BOOK_ADDED', {
          bookAdded: await bookToDB.populate('author'),
        })

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
        await Author.deleteOne({ _id: author._id })
        throw new UserInputError(error.message, { invalidArgs: args })
      }
      pubsub.publish('BOOK_ADDED', {
        bookAdded: await bookToDB.populate('author'),
      })

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

      return await newUser.save()
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
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED']),
    },
  },
}

module.exports = resolvers
