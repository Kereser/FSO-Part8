import { useEffect } from 'react'
import { useLazyQuery, useQuery } from '@apollo/client'
import { ALL_BOOKS_WITH_GENRE, ME } from '../queries'

const Recommendations = ({ show }) => {
  const { loading: meLoading, data: meData } = useQuery(ME)
  const [loadRecommendations, { data: recomenationData, loading, called }] =
    useLazyQuery(ALL_BOOKS_WITH_GENRE)

  useEffect(() => {
    console.log(meData)
    if (meData) {
      if (meData.me) {
        loadRecommendations({ variables: { genre: meData.me.favoriteGenre } })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meData])

  if (!show) {
    return null
  }

  if (meLoading || (loading && called)) {
    return <h1>Loading...</h1>
  }

  return (
    <div>
      <h2>Recommendations</h2>
      <p>
        books in your favorite genre <strong>{meData.me.favoriteGenre}</strong>
      </p>
      {recomenationData.allBooks.length === 0 ? (
        <div>No data to display at this genre</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th></th>
              <th>author</th>
              <th>published</th>
            </tr>
          </thead>
          <tbody>
            {recomenationData.allBooks.map((book) => (
              <tr key={book.title}>
                <td>{book.title}</td>
                <td>{book.author.name}</td>
                <td>{book.published}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Recommendations
