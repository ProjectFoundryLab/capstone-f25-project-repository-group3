import Button from "../components/Button"
import { Sliders, PlusCircle, Users } from "lucide-react"
import WindowSection from "../components/WindowSection";
import { supabase } from "../lib/supabaseClient";
import { useState, useEffect } from "react";

export default function UsersContent() {
    const [users, setUsers] = useState([])
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    async function fetchUsers() {
        try {
            const { data, error } = await supabase
            .from('people_with_department')
            .select('*')
            .eq('is_active', true)

            if (error) throw error
            setUsers(data)
        } catch (error) {
            setError(error.message)
        }
    }

    const buttons = () => {
        return (
            <div className="flex space-x-2">
                 <Button icon={PlusCircle}>New User</Button>
            </div>
        )
    }

    return (
        <WindowSection title="All Active Users" icon={Users} buttons={buttons()}>
            {error ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-800">Error loading users:</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
            ) : (
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Department</th>
                            <th scope="col" className="px-6 py-3">Role</th>
                            <th scope="col" className="px-6 py-3">Manager</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="bg-white border-b border-b-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-blue-600 hover:underline cursor-pointer">{user.first_name + " " + user.last_name}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">{user.department_name}</td>
                                <td className="px-6 py-4">{user.user_type}</td>
                                <td className="px-6 py-4">{user.managed_by}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </WindowSection>
    )
}