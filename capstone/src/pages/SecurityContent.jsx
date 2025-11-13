import { Shield, PlusCircle, Edit, Trash2 } from "lucide-react"
import WindowSection from "../components/WindowSection"
import Button from "../components/Button"

export default function SecurityContent() {
    const mockSecurityRoles = [
        { id: 'R-001', role: 'Global Admin', description: 'Full access to all modules and settings', members: 3 },
        { id: 'R-002', role: 'Asset Manager', description: 'Manages asset lifecycle, procurement, and stock', members: 5 },
        { id: 'R-003', role: 'IT Technician', description: 'Manages maintenance, assignments, and support tickets', members: 12 },
        { id: 'R-004', role: 'Department Manager', description: 'Read-only view for assets within their department', members: 8 },
        { id: 'R-005', role: 'Finance', description: 'Read-only view for procurement and cost centers', members: 4 },
    ];

    const buttons = () => {
        <div className="flex space-x-2">
            <Button icon={PlusCircle}>New Role</Button>
        </div>
    }

    return (
        <WindowSection title="Security Roles (RBAC)" icon={Shield} buttons={buttons()}>
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Role</th>
                        <th scope="col" className="px-6 py-3">Description</th>
                        <th scope="col" className="px-6 py-3">Members</th>
                        <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {mockSecurityRoles.map(r => (
                        <tr key={r.id} className="bg-white border-b border-b-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-blue-600 hover:underline cursor-pointer">{r.role}</td>
                            <td className="px-6 py-4">{r.description}</td>
                            <td className="px-6 py-4">{r.members}</td>
                             <td className="px-6 py-4 flex space-x-2">
                                <Edit className="w-5 h-5 text-gray-500 hover:text-blue-600 cursor-pointer" />
                                <Trash2 className="w-5 h-5 text-gray-500 hover:text-red-600 cursor-pointer" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </WindowSection>
    )
}