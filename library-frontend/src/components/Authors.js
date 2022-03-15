import { useQuery } from '@apollo/client'

import { ALL_AUTHORS } from '../queries'
import UpdateBirth from './UpdateBirth'

const Authors = (props) => {
  const { loading, data } = useQuery(ALL_AUTHORS)

  if (!props.show) {
    return null
  }

  if (loading) {
    return <div>loading...</div>
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
      <UpdateBirth Authors={data.allAuthors} />
    </div>
  )
}

export default Authors
