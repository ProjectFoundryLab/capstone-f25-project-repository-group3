import { Bookmark, Sliders, PlusCircle } from "lucide-react";
import WindowSection from "../components/WindowSection";
import Button from "../components/Button";
import Tag from "../components/Tag";

export default function WarrantyContent() {
    const mockWarranties = [
        { id: 'W-001', assetId: 'ASSET001', model: 'Latitude 7420', provider: 'Dell ProSupport', endDate: '2026-01-14', status: 'Active' },
        { id: 'W-002', assetId: 'ASSET002', model: 'iPhone 14', provider: 'AppleCare+', endDate: '2025-09-19', status: 'Active' },
        { id: 'W-003', assetId: 'ASSET003', model: 'Cisco 9300', provider: 'Cisco SmartNET', endDate: '2027-10-31', status: 'Active' },
        { id: 'W-004', assetId: 'ASSET004', model: 'OptiPlex 5090', provider: 'Dell Basic', endDate: '2023-05-09', status: 'Expired' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'green';
            case 'Expired': return 'gray';
            default: return 'gray';
        }
    };

    const buttons = () => {
        <div className="flex space-x-2">
            <Button variant="secondary" icon={Sliders}>Filters</Button>
            <Button icon={PlusCircle}>New Warranty</Button>
        </div>
    }

    return (
        <WindowSection title="Warranties and Contracts" icon={Bookmark} buttons={buttons()}>
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Asset ID</th>
                        <th scope="col" className="px-6 py-3">Model</th>
                        <th scope="col" className="px-6 py-3">Provider</th>
                        <th scope="col" className="px-6 py-3">End Date</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {mockWarranties.map(w => (
                        <tr key={w.id} className="bg-white border-b border-b-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-blue-600 hover:underline cursor-pointer">{w.assetId}</td>
                            <td className="px-6 py-4">{w.model}</td>
                            <td className="px-6 py-4">{w.provider}</td>
                            <td className="px-6 py-4">{w.endDate}</td>
                            <td className="px-6 py-4"><Tag color={getStatusColor(w.status)}>{w.status}</Tag></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </WindowSection>
    )
}