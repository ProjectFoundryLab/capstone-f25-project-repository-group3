import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import MenuBar from '../components/MenuBar'
import ContentWindow from './ContentWindow'
import Ribbon from './Ribbon'

export default function Dashboard() {
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
    return null // Don't show anything while redirecting
  }

  return (
    <div className='flex flex-row'>
      <MenuBar />
      <div className='flex-grow'>
        <Ribbon />
        <ContentWindow />
      </div>
    </div>
  )
}