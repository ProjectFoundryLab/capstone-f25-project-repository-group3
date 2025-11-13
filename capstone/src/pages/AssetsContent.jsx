import { HardDrive, ChevronsUpDown, QrCode } from "lucide-react";
import WindowSection from "../components/WindowSection";
import Tag from "../components/Tag";

export default function AssetsContent() {
    const getStatusColor = (status) => {
        switch (status) {
            case 'In Use': return 'blue';
            case 'In Stock': return 'green';
            case 'Retired': return 'gray';
            case 'In Repair': return 'yellow';
            default: return 'gray';
        }
    };

    const mockAssets = [
        { id: 'ASSET001', model: 'Latitude 7420', category: 'Laptop', status: 'In Use', user: 'j.doe', location: 'New York', purchaseDate: '2023-01-15', warrantyEnd: '2026-01-14' },
        { id: 'ASSET002', model: 'iPhone 14', category: 'Mobile', status: 'In Stock', user: 'n/a', location: 'Main Storage', purchaseDate: '2023-09-20', warrantyEnd: '2025-09-19' },
        { id: 'ASSET003', model: 'Cisco Catalyst 9300', category: 'Network', status: 'In Use', user: 'n/a', location: 'Data Center A', purchaseDate: '2022-11-01', warrantyEnd: '2027-10-31' },
        { id: 'ASSET004', model: 'Dell OptiPlex 5090', category: 'Desktop', status: 'Retired', user: 's.smith', location: 'Decommissioned', purchaseDate: '2020-05-10', warrantyEnd: '2023-05-09' },
        { id: 'ASSET005', model: 'Latitude 7420', category: 'Laptop', status: 'In Repair', user: 'p.jones', location: 'IT Workshop', purchaseDate: '2023-02-28', warrantyEnd: '2026-02-27' },
    ];

    return (
        <div className="assets-container">
            <WindowSection title="All Assets" icon={HardDrive}>
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">QR Code</th>
                            <th scope="col" className="px-6 py-3">Asset ID <ChevronsUpDown className="inline w-4 h-4 ml-1 cursor-pointer"/></th>
                            <th scope="col" className="px-6 py-3">Model <ChevronsUpDown className="inline w-4 h-4 ml-1 cursor-pointer"/></th>
                            <th scope="col" className="px-6 py-3">Status <ChevronsUpDown className="inline w-4 h-4 ml-1 cursor-pointer"/></th>
                            <th scope="col" className="px-6 py-3">Assigned To <ChevronsUpDown className="inline w-4 h-4 ml-1 cursor-pointer"/></th>
                            <th scope="col" className="px-6 py-3">Location <ChevronsUpDown className="inline w-4 h-4 ml-1 cursor-pointer"/></th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockAssets.map(asset => (
                            <tr key={asset.id} className="bg-white border-b border-b-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <QrCode className="w-5 h-5 text-gray-500 hover:text-blue-600 cursor-pointer" onClick={() => onQrCodeClick(asset)} />
                                </td>
                                <td className="px-6 py-4 font-medium text-blue-600 hover:underline cursor-pointer">{asset.id}</td>
                                <td className="px-6 py-4">{asset.model}</td>
                                <td className="px-6 py-4"><Tag color={getStatusColor(asset.status)}>{asset.status}</Tag></td>
                                <td className="px-6 py-4">{asset.user}</td>
                                <td className="px-6 py-4">{asset.location}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </WindowSection>
        </div>
    )
}