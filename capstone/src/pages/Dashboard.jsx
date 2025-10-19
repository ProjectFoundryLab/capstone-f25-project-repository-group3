import { useNavigate } from 'react-router-dom' // or your router
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    } else {
      navigate('/auth') // or '/' for home page
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Welcome to your Dashboard</h1>
      <p>This page is only visible to logged-in users.</p>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  )
}