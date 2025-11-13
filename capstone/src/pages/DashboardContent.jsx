import { HardDrive, Package } from "lucide-react"
import Card from "../components/Card"
import WindowSection from "../components/WindowSection"
import Tag from "../components/Tag";
import ProgressBar from "../components/ProgressBar";

export default function DashboardContent() {
    const mockAssets = [
        { id: 'ASSET001', model: 'Latitude 7420', category: 'Laptop', status: 'In Use', user: 'j.doe', location: 'New York', purchaseDate: '2023-01-15', warrantyEnd: '2026-01-14' },
        { id: 'ASSET002', model: 'iPhone 14', category: 'Mobile', status: 'In Stock', user: 'n/a', location: 'Main Storage', purchaseDate: '2023-09-20', warrantyEnd: '2025-09-19' },
        { id: 'ASSET003', model: 'Cisco Catalyst 9300', category: 'Network', status: 'In Use', user: 'n/a', location: 'Data Center A', purchaseDate: '2022-11-01', warrantyEnd: '2027-10-31' },
        { id: 'ASSET004', model: 'Dell OptiPlex 5090', category: 'Desktop', status: 'Retired', user: 's.smith', location: 'Decommissioned', purchaseDate: '2020-05-10', warrantyEnd: '2023-05-09' },
        { id: 'ASSET005', model: 'Latitude 7420', category: 'Laptop', status: 'In Repair', user: 'p.jones', location: 'IT Workshop', purchaseDate: '2023-02-28', warrantyEnd: '2026-02-27' },
    ];

    const mockSoftware = [
        { id: 'SW001', title: 'Microsoft 365 E5', category: 'Productivity', licenses: 250, allocated: 210 },
        { id: 'SW002', title: 'Adobe Creative Cloud', category: 'Design', licenses: 50, allocated: 45 },
        { id: 'SW003', title: 'Slack Enterprise', category: 'Communication', licenses: 500, allocated: 480 },
        { id: 'SW004', title: 'Jira Cloud', category: 'Development', licenses: 150, allocated: 145 },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'In Use': return 'blue';
            case 'In Stock': return 'green';
            case 'Retired': return 'gray';
            case 'In Repair': return 'yellow';
            default: return 'gray';
        }
    };

    return (
        // single flex container: horizontal row with gap and wrapping on small screens
        <div className="dashboard-container lg:col-span-2 space-y-6">
            <div className="flex flex-wrap gap-4 items-stretch">
                <Card title="Total Assets" val="1,428" />
                <Card title="In Use" val="1,102" />
                <Card title="In Stock" val="250" />
                <Card title="Retired" val="76" />
            </div>

            <WindowSection title="Recently Added Assets" icon={HardDrive}>
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Asset ID</th>
                            <th scope="col" className="px-6 py-3">Model</th>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Assigned To</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockAssets.slice(0, 3).map(asset => (
                            <tr key={asset.id} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{asset.id}</td>
                                <td className="px-6 py-4">{asset.model}</td>
                                <td className="px-6 py-4">{asset.category}</td>
                                <td className="px-6 py-4"><Tag color={getStatusColor(asset.status)}>{asset.status}</Tag></td>
                                <td className="px-6 py-4">{asset.user}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </WindowSection>

            <WindowSection title="License Utilization" icon={Package}>
                <div className="content space-y-4">
                    {mockSoftware.map(sw => (
                        <div key={sw.id}>
                            <div className="flex justify-between items-center mb-1">
                                <p className="font-medium text-sm">{sw.title}</p>
                                <p className="text-sm text-gray-500">{sw.allocated} / {sw.licenses} seats</p>
                            </div>
                            <ProgressBar value={sw.allocated} max={sw.licenses} />
                        </div>
                    ))}
                </div>
            </WindowSection>
        </div>
    )
}