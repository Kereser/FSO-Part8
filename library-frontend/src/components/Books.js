import { useQuery } from '@apollo/client'
import { useState } from 'react'

import { ALL_BOOKS } from '../queries'

const Books = (props) => {
  const [filter, setFilter] = useState('all books')
  const { loading, data } = useQuery(ALL_BOOKS)

  if (!props.show) {
    return null
  }

  if (loading) {
    return <div>Loading...</div>
  }

  let genres = data.allBooks.map((book) => {
    return book.genres
  })

  genres = [...new Set(genres.flat())]
  genres.push('all books')

  let booksToShow = []

  if (filter === 'all books') {
    booksToShow = data.allBooks
  } else {
    booksToShow = data.allBooks.filter((book) => {
      return book.genres.includes(filter) ? book : null
    })
  }

  return (
    <div>
      <h2>books</h2>

      <h3>in genre {filter}</h3>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksToShow.map((book) => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {genres.map((genre) => {
        return (
          <button key={genre} onClick={() => setFilter(genre)}>
            {genre}
          </button>
        )
      })}
    </div>
  )
}

export default Books
