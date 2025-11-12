import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import MenuBar from '../components/MenuBar'
import Ribbon from './Ribbon'
import DashboardContent from '../pages/DashboardContent'
import AssetsContent from '../pages/AssetsContent'
import SoftwareContent from '../pages/SoftwareContent'
import ProcurementContent from '../pages/ProcurementContent'
import UsersContent from '../pages/UsersContent'
import DepartmentsContent from '../pages/DepartmentsContent'
import WarrantyContent from '../pages/WarrantyContent'
import MaintenanceContent from '../pages/MaintenanceContent'
import SecurityContent from '../pages/SecurityContent'
import SupportContent from '../pages/SupportContent'
import SettingsContent from '../pages/SettingsContent'

export default function CommonView(props) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Redirect to auth if not authenticated
      if (!session) {
        navigate('/auth')
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session) {
        navigate('/auth')
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>
  }

  if (!user) {
    return null
  }

  const renderPage = () => {
    switch(props.currentPage) {
      case 'Dashboard':
        return <DashboardContent />
      case 'Assets':
        return <AssetsContent />
      case 'Software':
        return <SoftwareContent />
      case 'Procurement':
        return <ProcurementContent />
      case 'Users':
        return <UsersContent />
      case 'Departments':
        return <DepartmentsContent />
      case 'Warranties':
        return <WarrantyContent />
      case 'Maintenance':
        return <MaintenanceContent />
      case 'Security':
        return <SecurityContent />
      case 'Support':
        return <SupportContent />
      case 'Settings':
        return <SettingsContent />
      default:
        return <DashboardContent />
    }
  }

  return (
    <div className='flex flex-row bg-gray-100'>
      <MenuBar currentPage={props.currentPage} setCurrentPage={props.setCurrentPage} />
      <div className='flex-grow'>
        <Ribbon />
        <main className="flex-1 p-6 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}