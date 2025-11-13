import { Package, Sliders, PlusCircle } from "lucide-react";
import WindowSection from "../components/WindowSection";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";

export default function SoftwareContent() {
    const buttons = () => {
        return (
            <div className="flex space-x-2">
                 <Button variant="secondary" icon={Sliders}>Filters</Button>
                 <Button icon={PlusCircle}>New Software</Button>
            </div>
        )
    }

    const mockSoftware = [
        { id: 'SW001', title: 'Microsoft 365 E5', category: 'Productivity', licenses: 250, allocated: 210 },
        { id: 'SW002', title: 'Adobe Creative Cloud', category: 'Design', licenses: 50, allocated: 45 },
        { id: 'SW003', title: 'Slack Enterprise', category: 'Communication', licenses: 500, allocated: 480 },
        { id: 'SW004', title: 'Jira Cloud', category: 'Development', licenses: 150, allocated: 145 },
    ];

    return (
        <WindowSection title="Software Licenses" icon={Package} buttons={buttons()}>
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Title</th>
                        <th scope="col" className="px-6 py-3">Category</th>
                        <th scope="col" className="px-6 py-3">Seats</th>
                        <th scope="col" className="px-6 py-3">Allocated</th>
                        <th scope="col" className="px-6 py-3">Available</th>
                        <th scope="col" className="px-6 py-3">Utilization</th>
                    </tr>
                </thead>
                <tbody>
                    {mockSoftware.map(sw => (
                        <tr key={sw.id} className="bg-white border-b border-b-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-blue-600 hover:underline cursor-pointer">{sw.title}</td>
                            <td className="px-6 py-4">{sw.category}</td>
                            <td className="px-6 py-4">{sw.licenses}</td>
                            <td className="px-6 py-4">{sw.allocated}</td>
                            <td className="px-6 py-4 font-medium text-green-600">{sw.licenses - sw.allocated}</td>
                            <td className="px-6 py-4"><ProgressBar value={sw.allocated} max={sw.licenses} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </WindowSection>
    )
}