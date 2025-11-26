import WindowSection from "../components/WindowSection";
import Button from "../components/Button";
import { Building, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function DepartmentContent() {
    const [departments, setDepartments] = useState([]);
    const [error, setError] = useState(null);

    // Modal state
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [formError, setFormError] = useState("");

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

    // Insert new department
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

        // refresh + close form
        await fetchDepartments();
        setShowForm(false);
        setName("");
        setCode("");
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
            {/* --- Modal Form --- */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
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
                                <Button
                                    onClick={() => setShowForm(false)}
                                    type="button"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" icon={PlusCircle}>
                                    Add
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- Main Content Section --- */}
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
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map((dept) => (
                                <tr
                                    key={dept.id}
                                    className="bg-white border-b border-gray-200 hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 font-medium text-blue-600 hover:underline cursor-pointer">
                                        {dept.name}
                                    </td>
                                    <td className="px-6 py-4">{dept.code}</td>
                                    <td className="px-6 py-4">{dept.people_count}</td>
                                    <td className="px-6 py-4">{dept.asset_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </WindowSection>
        </>
    );
}
