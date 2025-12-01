import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import CommonView from './components/CommonView'
import QRScanner from './components/QRScanner'
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
              {/* Mobile/Tablet View: Only QR Scanner */}
              <div className="xl:hidden w-full h-screen bg-slate-900 flex items-center justify-center">
                <QRScanner isMobileView={true} />
              </div>
              {/* Desktop View: Full Application */}
              <div className="hidden xl:block">
                <CommonView currentPage={currentPage} setCurrentPage={setCurrentPage} />
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
