import Button from "../components/Button"
import { PlusCircle, Users, Edit, Trash2, X } from "lucide-react"
import WindowSection from "../components/WindowSection";
import { supabase } from "../lib/supabaseClient";
import { useState, useEffect } from "react";

export default function UsersContent() {
    const [users, setUsers] = useState([])
    const [error, setError] = useState(null)

    const [showModal, setShowModal] = useState(false)
    const [editModal, setEditModal] = useState(false)

    const [currentUser, setCurrentUser] = useState(null)

    const [departments, setDepartments] = useState([])
    const [managers, setManagers] = useState([])

    const [newUser, setNewUser] = useState({
        department_id: "",
        first_name: "",
        last_name: "",
        email: "",
        user_type: "General User",
        managed_by: ""
    })

    // ---------- NEW STATE FOR ASSETS ----------
    const [showAssetsModal, setShowAssetsModal] = useState(false)
    const [userAssets, setUserAssets] = useState([])

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

        const manager_name =
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
                    managed_by: manager_name
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

    function openEditModal(user) {
        setCurrentUser({
            id: user.id,
            department_id: user.department_id || "",
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email.replace("@bqre.com", ""),
            user_type: user.user_type,
            managed_by: user.managed_by || ""
        })
        setEditModal(true)
    }

    async function updateUser(e) {
        e.preventDefault()

        const finalEmail = `${currentUser.email.replace("@bqre.com", "")}@bqre.com`

        const managerName =
            currentUser.user_type === "Manager"
                ? null
                : currentUser.managed_by || null

        try {
            const { error } = await supabase
                .from("people")
                .update({
                    department_id: currentUser.department_id || null,
                    first_name: currentUser.first_name,
                    last_name: currentUser.last_name,
                    email: finalEmail,
                    user_type: currentUser.user_type,
                    managed_by: managerName
                })
                .eq("id", currentUser.id)

            if (error) throw error

            setEditModal(false)
            fetchUsers()
            fetchManagers()
        } catch (err) {
            setError(err.message)
        }
    }

    async function deleteUser(id) {
        try {
            const { error } = await supabase
                .from("people")
                .update({ is_active: false })
                .eq("id", id)

            if (error) throw error

            fetchUsers()
        } catch (err) {
            setError(err.message)
        }
    }

    // ---------- FETCH USER ASSETS ----------
    async function fetchUserAssets(personId) {
        try {
            const { data, error } = await supabase
                .from("v_assets_detailed")
                .select("*")
                .eq("person_id", personId)

            if (error) throw error

            setUserAssets(data)
            setShowAssetsModal(true)
        } catch (err) {
            setError(err.message)
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
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                                    <td
                                        className="px-6 py-4 font-medium text-blue-600 hover:underline cursor-pointer"
                                        onClick={() => fetchUserAssets(user.id)}
                                    >
                                        {user.first_name} {user.last_name}
                                    </td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">{user.department_name}</td>
                                    <td className="px-6 py-4">{user.user_type}</td>
                                    <td className="px-6 py-4">{user.managed_by || ""}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <Button size="sm" icon={Edit} onClick={() => openEditModal(user)}>
                                                Edit
                                            </Button>
                                            <Button size="sm" variant="danger" icon={Trash2} onClick={() => deleteUser(user.id)}>
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </WindowSection>

            {/* ---------- Add User Modal ---------- */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl border w-full max-w-lg">
                        
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Add New User</h2>
                            <button onClick={() => setShowModal(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

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
                                        <option 
                                            key={m.id} 
                                            value={`${m.first_name} ${m.last_name}`}
                                        >
                                            {m.first_name} {m.last_name}
                                        </option>
                                    ))}
                                </select>
                            )}

                            <div className="flex justify-end space-x-2 pt-2">
                                <Button variant="ghost" onClick={() => setShowModal(false)}>
                                    Cancel
                                </Button>
                                <Button icon={PlusCircle} type="submit">
                                    Add User
                                </Button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* ---------- Edit User Modal ---------- */}
            {editModal && currentUser && (
                <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl border w-full max-w-lg">
                        
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Edit User</h2>
                            <button onClick={() => setEditModal(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={updateUser} className="space-y-3">

                            <input
                                type="text"
                                className="w-full border rounded p-2"
                                placeholder="First Name"
                                value={currentUser.first_name}
                                onChange={(e) => setCurrentUser({ ...currentUser, first_name: e.target.value })}
                                required
                            />

                            <input
                                type="text"
                                className="w-full border rounded p-2"
                                placeholder="Last Name"
                                value={currentUser.last_name}
                                onChange={(e) => setCurrentUser({ ...currentUser, last_name: e.target.value })}
                                required
                            />

                            <div>
                                <label className="text-sm text-gray-600">Email</label>
                                <div className="flex items-center border rounded overflow-hidden mt-1">
                                    <input
                                        type="text"
                                        className="w-full p-2 outline-none"
                                        value={currentUser.email}
                                        onChange={(e) =>
                                            setCurrentUser({
                                                ...currentUser,
                                                email: e.target.value.replace("@bqre.com", "")
                                            })
                                        }
                                    />
                                    <span className="px-3 bg-gray-100 border-l">@bqre.com</span>
                                </div>
                            </div>

                            <select
                                className="w-full border rounded p-2"
                                value={currentUser.department_id}
                                onChange={(e) =>
                                    setCurrentUser({ ...currentUser, department_id: e.target.value })
                                }
                            >
                                <option value="">Select Department</option>
                                {departments.map(dep => (
                                    <option key={dep.id} value={dep.id}>
                                        {dep.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="w-full border rounded p-2"
                                value={currentUser.user_type}
                                onChange={(e) =>
                                    setCurrentUser({
                                        ...currentUser,
                                        user_type: e.target.value,
                                        managed_by: ""
                                    })
                                }
                            >
                                <option value="General User">General</option>
                                <option value="Manager">Manager</option>
                            </select>

                            {currentUser.user_type !== "Manager" && (
                                <select
                                    className="w-full border rounded p-2"
                                    value={currentUser.managed_by}
                                    onChange={(e) =>
                                        setCurrentUser({ ...currentUser, managed_by: e.target.value })
                                    }
                                >
                                    <option value="">Select Manager</option>
                                    {managers.map(m => (
                                        <option 
                                            key={m.id} 
                                            value={`${m.first_name} ${m.last_name}`}
                                        >
                                            {m.first_name} {m.last_name}
                                        </option>
                                    ))}
                                </select>
                            )}

                            <div className="flex justify-end space-x-2 pt-2">
                                <Button variant="ghost" onClick={() => setEditModal(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Save Changes
                                </Button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* ---------- Assets Assigned Modal ---------- */}
            {showAssetsModal && (
                <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl border w-full max-w-2xl">
                        
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Assigned Assets</h2>
                            <button onClick={() => setShowAssetsModal(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {userAssets.length === 0 ? (
                            <p className="text-gray-600">No assets assigned.</p>
                        ) : (
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                                    <tr>
                                        <th className="px-4 py-2">Asset Tag</th>
                                        <th className="px-4 py-2">Model</th>
                                        <th className="px-4 py-2">State</th>
                                        <th className="px-4 py-2">Condition</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userAssets.map((a) => (
                                        <tr key={a.id} className="border-b border-b-gray-200 hover:bg-gray-50">
                                            <td className="px-4 py-2">{a.asset_tag}</td>
                                            <td className="px-4 py-2">{a.model_name}</td>
                                            <td className="px-4 py-2">{a.state}</td>
                                            <td className="px-4 py-2">{a.condition}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
