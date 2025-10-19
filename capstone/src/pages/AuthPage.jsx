import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AuthPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        // Redirect to home page after successful sign-in
        window.location.href = '/'

        } catch (err) {
        setError(err.message)
        } finally {
        setLoading(false)
        }
    }

    return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">IT Asset Manager</h1>
            <p className="text-slate-400 text-sm">Sign in to your account</p>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 shadow-xl">
            <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
                </label>
                <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
                </label>
                <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white font-medium py-2.5 rounded-lg transition-colors duration-200"
            >
                {loading ? 'Loading...' : 'Sign In'}
            </button>
            </div>
        </div>
        </div>
    </div>
    )
    }