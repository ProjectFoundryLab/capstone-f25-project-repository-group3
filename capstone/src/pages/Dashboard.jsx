import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Welcome to your Dashboard</h1>
      <p>This page is only visible to logged-in users.</p>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  )
}
