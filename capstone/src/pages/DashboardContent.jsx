import { HardDrive, Package } from "lucide-react"
import Card from "../components/Card"
import WindowSection from "../components/WindowSection"
import Tag from "../components/Tag";
import ProgressBar from "../components/ProgressBar";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function DashboardContent() {
    const [assets, setAssets] = useState([]);
    // initialize metrics with zeros so Card components receive defined values
    const [metrics, setMetrics] = useState([0, 0, 0, 0])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // fetch both recent assets and metrics on mount
        fetchAssets();
        fetchAssetMetrics();
    }, []);

    async function fetchAssets() {
        try {
        setLoading(true);
        
        const { data, error } = await supabase
            .from('v_assets_detailed') 
            .select('*')
            .in('state', ['in_use', 'in_stock'])
            .order('purchase_date', { ascending: false })
            .limit(5); 

        if (error) throw error;
        setAssets(data);
        
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function fetchAssetMetrics() {
        try {
            const { data,error } = await supabase
                .from('v_assets_metrics')
                .select('*')
            
            if (error) throw error;
            // Supabase may return an array with a single object { total_assets, in_use, in_stock, retired }
            // Normalize into an array of numbers so Card components receive primitive values.
            if (Array.isArray(data) && data.length > 0) {
                const m = data[0];
                setMetrics([
                    m.total_assets ?? 0,
                    m.in_use ?? 0,
                    m.in_stock ?? 0,
                    m.retired ?? 0,
                ]);
            } else if (data && typeof data === 'object') {
                const m = data;
                setMetrics([
                    m.total_assets ?? 0,
                    m.in_use ?? 0,
                    m.in_stock ?? 0,
                    m.retired ?? 0,
                ]);
            } else {
                setMetrics([0, 0, 0, 0]);
            }
        } catch (err) {
            setError(err.message)
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
        // single flex container: horizontal row with gap and wrapping on small screens
        <div className="dashboard-container lg:col-span-2 space-y-6">
            <div className="flex flex-wrap gap-4 items-stretch">
                <Card title="Total Assets" val={metrics[0]} />
                <Card title="In Use" val={metrics[1]} />
                <Card title="Retired" val={metrics[3]} />
            </div>

            <WindowSection title="Recently Added Assets" icon={HardDrive}>
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