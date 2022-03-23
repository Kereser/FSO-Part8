import { useApolloClient, useSubscription } from '@apollo/client'
import { useState } from 'react'

import Authors from './components/Authors'
import Books from './components/Books'
import LoginForm from './components/LoginForm'
import NewBook from './components/NewBook'
import Recommendations from './components/Recommendations'
import { BOOK_ADDED, ALL_BOOKS, ALL_AUTHORS, AUTHOR_ADDED } from './queries'

export const updateBookCache = (cache, query, bookAdded) => {
  const uniqBeTitle = (a) => {
    let uniqSet = new Set()
    return a.filter((book) => {
      return uniqSet.has(book) ? false : uniqSet.add(book)
    })
  }

  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: uniqBeTitle(allBooks.concat(bookAdded)),
    }
  })
}

export const updateAuthorCache = (cache, query, author) => {
  cache.updateQuery(query, ({ allAuthors }) => {
    if (!allAuthors.find((auth) => auth.name === author.name)) {
      return {
        allAuthors: allAuthors.concat(author),
      }
    }
    const newAuthor = author
    return {
      allAuthors: allAuthors.map((auth) => {
        return auth.name === newAuthor.name ? newAuthor : auth
      }),
    }
  })
}

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  const handleLogout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    setPage('authors')
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: async ({ subscriptionData }) => {
      const newBook = await subscriptionData.data.bookAdded
      alert(`${newBook.title} added`)
      updateBookCache(client.cache, { query: ALL_BOOKS }, newBook)
      console.log(subscriptionData)
    },
  })

  useSubscription(AUTHOR_ADDED, {
    onSubscriptionData: async ({ subscriptionData }) => {
      const newAuthor = await subscriptionData.data.authorAdded
      updateAuthorCache(client.cache, { query: ALL_AUTHORS }, newAuthor)
      console.log(subscriptionData)
    },
  })

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token === null ? (
          <button onClick={() => setPage('login')}>login</button>
        ) : (
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('recommendations')}>
              recommendations
            </button>
            <button onClick={handleLogout}>log-out</button>
          </>
        )}
      </div>

      <Authors show={page === 'authors'} token={token} />

      <Books show={page === 'books'} />

      <LoginForm
        show={page === 'login'}
        setToken={setToken}
        setPage={setPage}
      />

      <Recommendations show={page === 'recommendations'} />

      <NewBook show={page === 'add'} />
    </div>
  )
}

export default App
