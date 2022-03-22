import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

import { ALL_BOOKS, ALL_BOOKS_WITH_GENRE } from '../queries'

const Books = (props) => {
  const [genre, setGenre] = useState('all books')
  const { loading: allBooksLoading, data: allBooksData } = useQuery(ALL_BOOKS)
  const { loading: filterLoading, data: filterData } = useQuery(
    ALL_BOOKS_WITH_GENRE,
    {
      variables: { genre },
    },
  )
  const [genres, setGenres] = useState([])
  const [booksToShow, setBooksToShow] = useState([])

  //? No me sale pq filterData se llama con una query distinta a allbooks. Consigue todos los libros, pero es una query distinta. Asi que hay que actualizar la query del filterData
  useEffect(() => {
    if (filterData) {
      setBooksToShow(filterData.allBooks)
    }
  }, [filterData])

  useEffect(() => {
    if (allBooksData) {
      let placeGenre = allBooksData.allBooks.map((book) => {
        return book.genres
      })
      placeGenre = [...new Set(placeGenre.flat())]
      placeGenre.push('all books')
      setGenres(placeGenre)
    }
  }, [allBooksData])

  if (!props.show) {
    return null
  }

  if (filterLoading || allBooksLoading) {
    return <div>Loading filteres books...</div>
  }

  return (
    <div>
      <h2>books</h2>

      <h3>in genre {genre}</h3>

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
      {genres.map((genreArr) => {
        return (
          <button key={genreArr} onClick={() => setGenre(genreArr)}>
            {genreArr}
          </button>
        )
      })}
    </div>
  )
}

export default Books
