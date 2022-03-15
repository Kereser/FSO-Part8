import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'

const UpdateBirth = ({ Authors }) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const [updateBorn] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  })

  const submit = (e) => {
    e.preventDefault()

    console.log(name)
    updateBorn({ variables: { name, born } })

    setName('')
    setBorn('')
  }

  const options = Authors.filter((a) => a.born === null)

  return (
    <div>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <div>
          <select value={name} onChange={({ target }) => setName(target.value)}>
            <option value=''>Choose one</option>
            {options.map((o) => {
              return (
                <option key={o.name} value={o.name}>
                  {o.name}
                </option>
              )
            })}
          </select>
        </div>
        <div>
          born{' '}
          <input
            value={born}
            onChange={({ target }) => setBorn(Number(target.value))}
          />
        </div>
        <button type='submit'>Update Author</button>
      </form>
    </div>
  )
}

export default UpdateBirth
