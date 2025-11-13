import { ShoppingCart, Sliders, PlusCircle } from "lucide-react";
import Button from "../components/Button";
import WindowSection from "../components/WindowSection";
import Tag from "../components/Tag";

export default function ProcurementContent() {
    const mockProcurement = [
        { id: 'PO-2024-001', vendor: 'Dell Technologies', date: '2024-01-15', items: 25, status: 'Received', total: '45,000.00' },
        { id: 'PO-2024-002', vendor: 'Apple Inc.', date: '2024-02-01', items: 10, status: 'Pending', total: '18,000.00' },
        { id: 'PO-2024-003', vendor: 'Cisco Systems', date: '2024-02-10', items: 5, status: 'Received', total: '22,500.00' },
    ];

    const buttons = () => {
        <div className="flex space-x-2">
            <Button variant="secondary" icon={Sliders}>Filters</Button>
            <Button icon={PlusCircle}>New PO</Button>
        </div>
    }

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
        <WindowSection title="Purchase Orders" icon={ShoppingCart} buttons={buttons()}>
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Order ID</th>
                        <th scope="col" className="px-6 py-3">Vendor</th>
                        <th scope="col" className="px-6 py-3">Date</th>
                        <th scope="col" className="px-6 py-3">Items</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {mockProcurement.map(po => (
                        <tr key={po.id} className="bg-white border-b border-b-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-blue-600 hover:underline cursor-pointer">{po.id}</td>
                            <td className="px-6 py-4">{po.vendor}</td>
                            <td className="px-6 py-4">{po.date}</td>
                            <td className="px-6 py-4">{po.items}</td>
                            <td className="px-6 py-4"><Tag color={getStatusColor(po.status)}>{po.status}</Tag></td>
                            <td className="px-6 py-4">${po.total}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </WindowSection>
    )
}