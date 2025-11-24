import WindowSection from "../components/WindowSection";
import Button from "../components/Button";
import { Building, Sliders, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function DepartmentContent() {
    const [departments, setDepartments] = useState([])
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchDepartments()
    }, [])
    
    async function fetchDepartments() {
        try {
            const { data, error } = await supabase
                .from('v_departments_with_counts')
                .select('*')

            if (error) throw error;
            setDepartments(data);
        } catch (err) {
            setError(err.message)
        }
    }

    const buttons = () => {
        return (
            <div className="flex space-x-2">
                <Button icon={PlusCircle}>New Department</Button>
            </div>
        )
    }

    return (
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
                            <th scope="col" className="px-6 py-3">Department</th>
                            <th scope="col" className="px-6 py-3">Code</th>
                            <th scope="col" className="px-6 py-3">Users</th>
                            <th scope="col" className="px-6 py-3">Assets</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map(dept => (
                            <tr key={dept.id} className="bg-white border-b border-b-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-blue-600 hover:underline cursor-pointer">{dept.name}</td>
                                <td className="px-6 py-4">{dept.code}</td>
                                <td className="px-6 py-4">{dept.people_count}</td>
                                <td className="px-6 py-4">{dept.asset_count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </WindowSection>
    )
}