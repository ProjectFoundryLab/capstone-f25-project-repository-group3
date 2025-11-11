import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import CommonView from './components/CommonView'
import PrivateRoute from './components/PrivateRoute'
import { useState } from 'react'

export default function App() {
  const [currentPage, setCurrentPage] = useState('Dashboard');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <CommonView currentPage={currentPage} setCurrentPage={setCurrentPage} />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
