import { useQuery } from '@apollo/client'

import { ALL_AUTHORS } from '../queries'
import UpdateBirth from './UpdateBirth'

const Authors = ({ show, token }) => {
  const { loading, data } = useQuery(ALL_AUTHORS)

  if (!show) {
    return null
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {token === null ? null : <UpdateBirth Authors={data.allAuthors} />}
    </div>
  )
}

export default Authors
