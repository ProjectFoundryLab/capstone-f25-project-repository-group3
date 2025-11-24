import { Bookmark, Sliders, PlusCircle } from "lucide-react";
import WindowSection from "../components/WindowSection";
import Button from "../components/Button";
import Tag from "../components/Tag";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function WarrantyContent() {
    const [warranties, setWarranties] = useState([])
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchWarranties()
    }, [])

    async function fetchWarranties() {
        try {
            const { data, error } = await supabase
                .from('v_warranties_with_model_and_vendor') 
                .select('*')
            
                if (error) throw error;
                setWarranties(data);
        } catch (err) {
            setError(err.message)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'green';
            case 'Expired': return 'gray';
            default: return 'gray';
        }
    };

    const buttons = () => {
        return (
            <div className="flex space-x-2">
                <Button variant="secondary" icon={Sliders}>Filters</Button>
                <Button icon={PlusCircle}>New Warranty</Button>
            </div>
        )
    }

    return (
        <WindowSection title="Warranties and Contracts" icon={Bookmark} buttons={buttons()}>
            {error ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-800">Error loading warranties:</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
            ) : (
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Model</th>
                            <th scope="col" className="px-6 py-3">Vendor</th>
                            <th scope="col" className="px-6 py-3">End Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {warranties.map(w => (
                            <tr key={w.id} className="bg-white border-b border-b-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4">{w.model_name}</td>
                                <td className="px-6 py-4">{w.vendor_name}</td>
                                <td className="px-6 py-4">{w.end_date}</td>
                                <td className="px-6 py-4"><Tag color={getStatusColor(w.status)}>{w.status}</Tag></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </WindowSection>
    )
}