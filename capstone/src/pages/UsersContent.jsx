import Button from "../components/Button"
import { Sliders, PlusCircle, Users } from "lucide-react"
import WindowSection from "../components/WindowSection";

export default function UsersContent() {
    const mockUsers = [
        { id: 'j.doe', name: 'John Doe', email: 'j.doe@example.com', department: 'Engineering', location: 'New York' },
        { id: 's.smith', name: 'Sarah Smith', email: 's.smith@example.com', department: 'Marketing', location: 'London' },
        { id: 'a.williams', name: 'Alex Williams', email: 'a.williams@example.com', department: 'IT Operations', location: 'New York' },
        { id: 'p.jones', name: 'Pat Jones', email: 'p.jones@example.com', department: 'Sales', location: 'Tokyo' },
    ];

    const buttons = () => {
        return (
            <div className="flex space-x-2">
                 <Button variant="secondary" icon={Sliders}>Filters</Button>
                 <Button icon={PlusCircle}>New User</Button>
            </div>
        )
    }

    return (
        <WindowSection title="All Users" icon={Users} buttons={buttons()}>
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Email</th>
                        <th scope="col" className="px-6 py-3">Department</th>
                        <th scope="col" className="px-6 py-3">Location</th>
                        <th scope="col" className="px-6 py-3">User ID</th>
                    </tr>
                </thead>
                <tbody>
                    {mockUsers.map(user => (
                        <tr key={user.id} className="bg-white border-b border-b-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-blue-600 hover:underline cursor-pointer">{user.name}</td>
                            <td className="px-6 py-4">{user.email}</td>
                            <td className="px-6 py-4">{user.department}</td>
                            <td className="px-6 py-4">{user.location}</td>
                            <td className="px-6 py-4 text-gray-600">{user.id}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </WindowSection>
    )
}