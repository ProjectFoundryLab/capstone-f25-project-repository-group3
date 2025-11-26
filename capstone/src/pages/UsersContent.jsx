import Button from "../components/Button"
import { PlusCircle, Users } from "lucide-react"
import WindowSection from "../components/WindowSection";
import { supabase } from "../lib/supabaseClient";
import { useState, useEffect } from "react";

export default function UsersContent() {
    const [users, setUsers] = useState([])
    const [error, setError] = useState(null)

    const [showModal, setShowModal] = useState(false)

    // Dropdown data
    const [departments, setDepartments] = useState([])
    const [managers, setManagers] = useState([])

    // New user form
    const [newUser, setNewUser] = useState({
        department_id: "",
        first_name: "",
        last_name: "",
        email: "",
        user_type: "General User",
        managed_by: ""
    })

    useEffect(() => {
        fetchUsers()
        fetchDepartments()
        fetchManagers()
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

    async function fetchDepartments() {
        const { data, error } = await supabase
            .from("departments")
            .select("*")
            .order("name", { ascending: true })

        if (!error) setDepartments(data)
    }

    async function fetchManagers() {
        const { data, error } = await supabase
            .from("people")
            .select("id, first_name, last_name")
            .eq("user_type", "Manager")
            .order("first_name", { ascending: true })

        if (!error) setManagers(data)
    }

    async function addUser(e) {
        e.preventDefault()

        const finalEmail = `${newUser.email.replace("@bqre.com", "")}@bqre.com`

        const manager_id =
            newUser.user_type === "Manager"
                ? null
                : newUser.managed_by || null

        try {
            const { error } = await supabase
                .from("people")
                .insert({
                    department_id: newUser.department_id || null,
                    first_name: newUser.first_name,
                    last_name: newUser.last_name,
                    email: finalEmail,
                    user_type: newUser.user_type,
                    managed_by: manager_id
                })

            if (error) throw error

            setShowModal(false)
            setNewUser({
                department_id: "",
                first_name: "",
                last_name: "",
                email: "",
                user_type: "General User",
                managed_by: ""
            })

            fetchUsers()
            fetchManagers()
        } catch (error) {
            setError(error.message)
        }
    }

    const buttons = () => (
        <div className="flex space-x-2">
            <Button icon={PlusCircle} onClick={() => setShowModal(true)}>
                New User
            </Button>
        </div>
    )

    return (
        <>
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
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Department</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Manager</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-blue-600 hover:underline cursor-pointer">
                                        {user.first_name + " " + user.last_name}
                                    </td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">{user.department_name}</td>
                                    <td className="px-6 py-4">{user.user_type}</td>
                                    <td className="px-6 py-4">{user.manager_name || ""}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </WindowSection>

            {/* ---------- Add User Modal ---------- */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold mb-4">Add New User</h2>

                        <form onSubmit={addUser} className="space-y-3">

                            <input
                                type="text"
                                className="w-full border rounded p-2"
                                placeholder="First Name"
                                value={newUser.first_name}
                                onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                                required
                            />

                            <input
                                type="text"
                                className="w-full border rounded p-2"
                                placeholder="Last Name"
                                value={newUser.last_name}
                                onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                                required
                            />

                            {/* Email field with suffix */}
                            <div>
                                <label className="text-sm text-gray-600">Email</label>
                                <div className="flex items-center border rounded overflow-hidden mt-1">
                                    <input
                                        type="text"
                                        className="w-full p-2 outline-none"
                                        placeholder="username"
                                        value={newUser.email}
                                        onChange={(e) =>
                                            setNewUser({
                                                ...newUser,
                                                email: e.target.value.replace("@bqre.com", "")
                                            })
                                        }
                                        required
                                    />
                                    <span className="px-3 text-gray-600 bg-gray-100 border-l">
                                        @bqre.com
                                    </span>
                                </div>
                            </div>

                            {/* Department dropdown */}
                            <select
                                className="w-full border rounded p-2"
                                value={newUser.department_id}
                                onChange={(e) =>
                                    setNewUser({ ...newUser, department_id: e.target.value })
                                }
                                required
                            >
                                <option value="">Select Department</option>
                                {departments.map(dep => (
                                    <option key={dep.id} value={dep.id}>
                                        {dep.name}
                                    </option>
                                ))}
                            </select>

                            {/* User type dropdown */}
                            <select
                                className="w-full border rounded p-2"
                                value={newUser.user_type}
                                onChange={(e) =>
                                    setNewUser({ ...newUser, user_type: e.target.value, managed_by: "" })
                                }
                            >
                                <option value="General User">General</option>
                                <option value="Manager">Manager</option>
                            </select>

                            {/* Manager dropdown only if NOT a manager */}
                            {newUser.user_type !== "Manager" && (
                                <select
                                    className="w-full border rounded p-2"
                                    value={newUser.managed_by}
                                    onChange={(e) =>
                                        setNewUser({ ...newUser, managed_by: e.target.value })
                                    }
                                    required
                                >
                                    <option value="">Select Manager</option>
                                    {managers.map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.first_name} {m.last_name}
                                        </option>
                                    ))}
                                </select>
                            )}

                            <div className="flex justify-end space-x-2 mt-4">
                                <Button onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button icon={PlusCircle} type="submit">Add User</Button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
