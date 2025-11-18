import { HardDrive, ChevronsUpDown, QrCode, Sliders, PlusCircle, Printer } from "lucide-react";
import WindowSection from "../components/WindowSection";
import Tag from "../components/Tag";
import Button from "../components/Button";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AssetsContent() {
    const buttons = () => {
        return (
            <div className="flex space-x-2">
                <Button icon={PlusCircle}>New Asset</Button>
            </div>
        )
    }

    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAssets();
    }, []);
    
    async function fetchAssets() {
        try {
        setLoading(true);
        
        // 1. Query the VIEW exactly like a table
        const { data, error } = await supabase
            .from('v_assets_detailed') 
            .select('*')
            .order('purchase_date', { ascending: false }); // Optional sorting

        if (error) throw error;
        setAssets(data);
        
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const getStatusColor = (status) => {
        const map = {
        in_use: 'green',       // active
        in_stock: 'blue',      // ready
        maintenance: 'red',    // issue
        retired: 'gray',       // dead
        lost: 'red',           // alert
        };

        return map[status] || 'default';
    };

    return (
        <div className="assets-container">
            <WindowSection title="All Assets" icon={HardDrive} buttons={buttons()}>
                <h1>{error}</h1>
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
                        {assets.map((asset) => (
                        <tr key={asset.id} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                            {/* Use asset_tag for the readable ID, not the UUID */}
                            <td className="px-6 py-4 font-medium text-gray-900">
                            {asset.asset_tag || 'No Tag'}
                            </td>
                            
                            <td className="px-6 py-4">
                            {asset.model_name}
                            </td>
                            
                            <td className="px-6 py-4">
                            {asset.category_name}
                            </td>
                            
                            <td className="px-6 py-4">
                            {/* Ensure your Tag component accepts these string values */}
                            <Tag color={getStatusColor(asset.state)}>
                                {asset.state.replace('_', ' ')}
                            </Tag>
                            </td>
                            
                            <td className="px-6 py-4">
                            {asset.assigned_to_person || <span className="italic text-gray-400">Unassigned</span>}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </WindowSection>
        </div>
    )
}