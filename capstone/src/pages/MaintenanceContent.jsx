import { Wrench, Sliders, PlusCircle } from "lucide-react";
import WindowSection from "../components/WindowSection";
import Button from "../components/Button";
import Tag from "../components/Tag";

export default function MaintenanceContent() {
    const mockMaintenance = [
        { id: 'M-001', assetId: 'ASSET003', task: 'Firmware Update', type: 'Scheduled', scheduleDate: '2024-11-15', status: 'Pending' },
        { id: 'M-002', assetId: 'ASSET005', task: 'Screen Replacement', type: 'Repair', scheduleDate: '2024-10-28', status: 'In Progress' },
        { id: 'M-003', assetId: 'ASSET001', task: '3-Year Refresh', type: 'Refresh', scheduleDate: '2025-12-01', status: 'Pending' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'yellow';
            case 'In Progress': return 'blue';
            case 'Completed': return 'green';
            default: return 'gray';
        }
    };

    const buttons = () => {
        <div className="flex space-x-2">
            <Button variant="secondary" icon={Sliders}>Filters</Button>
            <Button icon={PlusCircle}>New Task</Button>
        </div>
    }

    return (
        <WindowSection title="Maintenence Tasks" icon={Wrench} buttons={buttons()}>
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Asset ID</th>
                        <th scope="col" className="px-6 py-3">Task</th>
                        <th scope="col" className="px-6 py-3">Type</th>
                        <th scope="col" className="px-6 py-3">Schedule Date</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {mockMaintenance.map(m => (
                        <tr key={m.id} className="bg-white border-b border-b-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-blue-600 hover:underline cursor-pointer">{m.assetId}</td>
                            <td className="px-6 py-4">{m.task}</td>
                            <td className="px-6 py-4">{m.type}</td>
                            <td className="px-6 py-4">{m.scheduleDate}</td>
                            <td className="px-6 py-4"><Tag color={getStatusColor(m.status)}>{m.status}</Tag></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </WindowSection>
    )
}