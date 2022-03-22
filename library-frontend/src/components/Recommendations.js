import { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS_WITH_GENRE, ME } from '../queries'

const Recommendations = ({ show }) => {
  const [favoriteGenre, setFavoriteGenre] = useState('')
  const { loading: meLoading, data: meData } = useQuery(ME)
  const { loading: allBooksLoading, data: allBooksData } = useQuery(
    ALL_BOOKS_WITH_GENRE,
    {
      variables: { genre: favoriteGenre },
    },
  )

  useEffect(() => {
    console.log(meData)
    if (meData) {
      if (meData.me) {
        setFavoriteGenre(meData.me.favoriteGenre)
      }
    }
  }, [meData])

  if (!show) {
    return null
  }

  if (meLoading || allBooksLoading) {
    return <h1>Loading...</h1>
  }

  return (
    <div>
      <h2>Recommendations</h2>
      <p>
        books in your favorite genre <strong>{favoriteGenre}</strong>
      </p>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
        </thead>
        <tbody>
          {allBooksData.allBooks.map((book) => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommendations
