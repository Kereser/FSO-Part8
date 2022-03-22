import { useMutation } from '@apollo/client'
import { useState } from 'react'

import {
  ADD_BOOK,
  ALL_AUTHORS,
  ALL_BOOKS,
  ALL_BOOKS_WITH_GENRE,
} from '../queries'

const NewBook = (props) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const [addingBook] = useMutation(ADD_BOOK, {
    update: (cache, mutationResponse) => {
      const newBook = mutationResponse.data.addBook
      cache.updateQuery({ query: ALL_AUTHORS }, ({ allAuthors }) => {
        if (!allAuthors.find((auth) => auth.name === newBook.author.name)) {
          return {
            allAuthors: allAuthors.concat(newBook.author),
          }
        }
        const newAuthor = newBook.author
        return {
          allAuthors: allAuthors.map((auth) => {
            return auth.name === newAuthor.name ? newAuthor : auth
          }),
        }
      })
      cache.evict({
        id: 'ROOT_QUERY',
        fieldName: 'allBooks',
      })
    },
  })

  if (!props.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    addingBook({ variables: { title, author, published, genres } })

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title{' '}
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author{' '}
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published{' '}
          <input
            type='number'
            value={published}
            onChange={({ target }) => setPublished(Number(target.value))}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type='button'>
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type='submit'>create book</button>
      </form>
    </div>
  )
}

export default NewBook
