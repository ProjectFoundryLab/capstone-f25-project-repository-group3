import WindowSection from "../components/WindowSection";
import Button from "../components/Button";
import { Building, PlusCircle, Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function DepartmentContent() {
    const [departments, setDepartments] = useState([]);
    const [error, setError] = useState(null);

    // Create modal
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [formError, setFormError] = useState("");

    // Edit modal
    const [showEdit, setShowEdit] = useState(false);
    const [editDept, setEditDept] = useState(null);

    // Delete modal
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteDept, setDeleteDept] = useState(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    async function fetchDepartments() {
        try {
            const { data, error } = await supabase
                .from("v_departments_with_counts")
                .select("*");

            if (error) throw error;
            setDepartments(data);
        } catch (err) {
            setError(err.message);
        }
    }

    // CREATE
    async function addDepartment(e) {
        e.preventDefault();
        setFormError("");

        if (!name.trim()) {
            setFormError("Department name is required.");
            return;
        }

        const { error } = await supabase
            .from("departments")
            .insert([{ name, code }]);

        if (error) {
            setFormError(error.message);
            return;
        }

        await fetchDepartments();
        setShowForm(false);
        setName("");
        setCode("");
    }

    // EDIT
    function openEditModal(dept) {
        setEditDept(dept);
        setName(dept.name);
        setCode(dept.code);
        setShowEdit(true);
    }

    async function saveEdit(e) {
        e.preventDefault();

        const { error } = await supabase
            .from("departments")
            .update({
                name,
                code: code || null
            })
            .eq("id", editDept.id);

        if (error) {
            setFormError(error.message);
            return;
        }

        setShowEdit(false);
        setEditDept(null);
        await fetchDepartments();
    }

    // DELETE
    function openDeleteModal(dept) {
        setDeleteDept(dept);
        setShowDeleteConfirm(true);
    }

    async function confirmDelete() {
        await supabase.from("departments").delete().eq("id", deleteDept.id);

        setShowDeleteConfirm(false);
        setDeleteDept(null);
        await fetchDepartments();
    }

    const buttons = () => {
        return (
            <div className="flex space-x-2">
                <Button icon={PlusCircle} onClick={() => setShowForm(true)}>
                    New Department
                </Button>
            </div>
        );
    };

    return (
        <>
            {/* -------- Add Modal -------- */}
            {showForm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-semibold mb-4">Add Department</h2>
                        <form onSubmit={addDepartment} className="space-y-4">

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Department Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Code (optional)
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                            </div>

                            {formError && (
                                <p className="text-red-600 text-sm">{formError}</p>
                            )}

                            <div className="flex justify-end space-x-2">
                                <Button type="button" onClick={() => setShowForm(false)}>
                                    Cancel
                                </Button>
                                <Button icon={PlusCircle} type="submit">
                                    Add
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* -------- Edit Modal -------- */}
            {showEdit && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-semibold mb-4">Edit Department</h2>

                        <form onSubmit={saveEdit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Department Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Code
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button size="sm" onClick={() => setShowEdit(false)}>
                                    Cancel
                                </Button>
                                <Button size="sm" icon={Edit} type="submit">
                                    Save
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* -------- Delete Modal -------- */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-semibold mb-4">Delete Department</h2>
                        <p className="text-sm mb-6">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold">{deleteDept?.name}</span>?
                        </p>

                        <div className="flex justify-end space-x-2">
                            <Button size="sm" onClick={() => setShowDeleteConfirm(false)}>
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                variant="danger"
                                icon={Trash2}
                                onClick={confirmDelete}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* -------- Main Section -------- */}
            <WindowSection title="Departments" icon={Building} buttons={buttons()}>
                {error ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-medium text-red-800">Error loading departments:</p>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Department</th>
                                <th className="px-6 py-3">Code</th>
                                <th className="px-6 py-3">Users</th>
                                <th className="px-6 py-3">Assets</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map((dept) => (
                                <tr
                                    key={dept.id}
                                    className="bg-white border-b border-gray-200 hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 font-medium text-blue-600">
                                        {dept.name}
                                    </td>
                                    <td className="px-6 py-4">{dept.code}</td>
                                    <td className="px-6 py-4">{dept.people_count}</td>
                                    <td className="px-6 py-4">{dept.asset_count}</td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                size="sm"
                                                icon={Edit}
                                                onClick={() => openEditModal(dept)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                icon={Trash2}
                                                onClick={() => openDeleteModal(dept)}
                                            >
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
        </>
    );
}
