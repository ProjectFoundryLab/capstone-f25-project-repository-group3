import { ShoppingCart, Sliders, PlusCircle } from "lucide-react";
import Button from "../components/Button";
import WindowSection from "../components/WindowSection";
import Tag from "../components/Tag";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ProcurementContent() {
    const mockProcurement = [
        { id: 'PO-2024-001', vendor: 'Dell Technologies', date: '2024-01-15', items: 25, status: 'Received', total: '45,000.00' },
        { id: 'PO-2024-002', vendor: 'Apple Inc.', date: '2024-02-01', items: 10, status: 'Pending', total: '18,000.00' },
        { id: 'PO-2024-003', vendor: 'Cisco Systems', date: '2024-02-10', items: 5, status: 'Received', total: '22,500.00' },
    ];

    const [pos, setPos] = useState([])
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchPos()
    }, [])

    async function fetchPos() {
        try {
            const { data, error } = await supabase
            .from('v_purchase_orders_with_vendors')
            .select('*')

            if (error) throw error;
            setPos(data)
        } catch (err) {
            setError(err.message);
        }
    }

    const buttons = () => {
        return (
            <div className="flex space-x-2">
                <Button variant="secondary" icon={Sliders}>Filters</Button>
                <Button icon={PlusCircle}>New PO</Button>
            </div>
        )
    }

    return (
        <WindowSection title="Purchase Orders" icon={ShoppingCart} buttons={buttons()}>
            {error ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-800">Error loading purchase orders:</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
            ) : (
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Order ID</th>
                            <th scope="col" className="px-6 py-3">Vendor</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Items</th>
                            <th scope="col" className="px-6 py-3">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pos.map(po => (
                            <tr key={po.id} className="bg-white border-b border-b-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-blue-600 hover:underline cursor-pointer">{po.po_number}</td>
                                <td className="px-6 py-4">{po.vendor_name}</td>
                                <td className="px-6 py-4">{po.order_date}</td>
                                <td className="px-6 py-4">{po.po_line_count}</td>
                                <td className="px-6 py-4">${po.total_po_cost}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </WindowSection>
    )
}