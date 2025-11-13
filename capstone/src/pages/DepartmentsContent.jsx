import WindowSection from "../components/WindowSection";
import Button from "../components/Button";
import { Building, Sliders, PlusCircle } from "lucide-react";

export default function DepartmentContent() {
    const mockDepartments = [
        { id: 'D-ENG', name: 'Engineering', costCenter: '1001', manager: 'T. Lee', users: 28, assets: 45 },
        { id: 'D-MKT', name: 'Marketing', costCenter: '1002', manager: 'S. Smith', users: 15, assets: 25 },
        { id: 'D-SAL', name: 'Sales', costCenter: '1003', manager: 'R. Chen', users: 42, assets: 60 },
        { id: 'D-ITO', name: 'IT Operations', costCenter: '1004', manager: 'A. Williams', users: 12, assets: 30 },
    ];

    const buttons = () => {
        <div className="flex space-x-2">
            <Button variant="secondary" icon={Sliders}>Filters</Button>
            <Button icon={PlusCircle}>New Department</Button>
        </div>
    }

    return (
        <WindowSection title="Departments" icon={Building} buttons={buttons()}>
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Department</th>
                        <th scope="col" className="px-6 py-3">Cost Center</th>
                        <th scope="col" className="px-6 py-3">Manager</th>
                        <th scope="col" className="px-6 py-3">Users</th>
                        <th scope="col" className="px-6 py-3">Assets</th>
                    </tr>
                </thead>
                <tbody>
                    {mockDepartments.map(dept => (
                        <tr key={dept.id} className="bg-white border-b border-b-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-blue-600 hover:underline cursor-pointer">{dept.name}</td>
                            <td className="px-6 py-4">{dept.costCenter}</td>
                            <td className="px-6 py-4">{dept.manager}</td>
                            <td className="px-6 py-4">{dept.users}</td>
                            <td className="px-6 py-4">{dept.assets}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </WindowSection>
    )
}