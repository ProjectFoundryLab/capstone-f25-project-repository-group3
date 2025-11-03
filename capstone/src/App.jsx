import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import CommonView from './components/CommonView'
import PrivateRoute from './components/PrivateRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <CommonView />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
