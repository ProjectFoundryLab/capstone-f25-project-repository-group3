import {
    HardDrive,
    PlusCircle,
    X
} from "lucide-react";
import WindowSection from "../components/WindowSection";
import Tag from "../components/Tag";
import Button from "../components/Button";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import QRCode from "qrcode";

export default function AssetsContent() {

    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showForm, setShowForm] = useState(false);

    const [models, setModels] = useState([]);
    const [categories, setCategories] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [people, setPeople] = useState([]);
    const [filteredPeople, setFilteredPeople] = useState([]);
    const [costCenters, setCostCenters] = useState([]);
    const [locations, setLocations] = useState([]);

    const [form, setForm] = useState({
        model_id: "",
        cost_center_id: "",
        department_id: "",
        person_id: "",
        purchase_date: "",
        cost: "",
        notes: "",
        location_id: "",
    });

    const [showModelForm, setShowModelForm] = useState(false);
    const [modelForm, setModelForm] = useState({
        category_id: "",
        vendor: "",
        name: "",
        sku: "",
    });

    useEffect(() => {
        fetchAssets();
        fetchDropdownData();
    }, []);

    async function fetchDropdownData() {
        const { data: modelData } = await supabase.from("asset_models").select("*").order("name");
        const { data: catData } = await supabase.from("asset_categories").select("*").order("name");
        const { data: deptData } = await supabase.from("departments").select("*").order("name");
        const { data: peopleData } = await supabase.from("people").select("*").eq("is_active", true);
        const { data: ccData } = await supabase.from("cost_centers").select("*").order("name");
        const { data: locData } = await supabase.from("locations").select("*").order("name");

        setModels(modelData || []);
        setCategories(catData || []);
        setDepartments(deptData || []);
        setPeople(peopleData || []);
        setCostCenters(ccData || []);
        setLocations(locData || []);
    }

    async function fetchAssets() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("v_assets_detailed")
                .select("*")
                .order("purchase_date", { ascending: false });

            if (error) throw error;
            setAssets(data);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function buttons() {
        return (
            <div className="flex space-x-2">
                <Button icon={PlusCircle} onClick={() => setShowForm(true)}>
                    New Asset
                </Button>

                <Button icon={PlusCircle} onClick={openModelModal}>
                    New Model
                </Button>
            </div>
        );
    }

    function openModelModal() {
        setShowModelForm(true);
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        if (name === "department_id") {
            setFilteredPeople(
                people.filter(p => p.department_id === value)
            );
        }
    }

    function handleModelChange(e) {
        const { name, value } = e.target;
        setModelForm(prev => ({ ...prev, [name]: value }));
    }

    async function submitModel() {
        if (!modelForm.name || modelForm.name.trim() === "") {
            alert("Model name is required");
            return;
        }

        const payload = {
            category_id: modelForm.category_id || null,
            vendor: modelForm.vendor || null,
            name: modelForm.name.trim(),
            sku: modelForm.sku || null,
        };

        const { data, error } = await supabase.from("asset_models").insert([payload]).select().single();

        if (error) {
            alert("Error creating model: " + error.message);
            return;
        }

        // add to local models list and keep sorted
        setModels(prev => {
            const next = (prev || []).concat([data]);
            next.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
            return next;
        });

        setShowModelForm(false);
        setModelForm({ category_id: "", vendor: "", name: "", sku: "" });
    }

    async function generateAssetTag(modelId) {
        const model = models.find(m => m.id === modelId);
        if (!model || !model.sku) return null;

        const { count } = await supabase
            .from("assets")
            .select("id", { count: "exact", head: true })
            .ilike("asset_tag", `${model.sku}-%`);

        return `${model.sku}-${count}`;
    }

    async function uploadQrCode(assetInfo) {
        const payload = {
            id: assetInfo.id,
            asset_tag: assetInfo.asset_tag,
            model: assetInfo.model_name,
            manufacturer: assetInfo.manufacturer,
            category: assetInfo.category_name,
            state: assetInfo.state,
            condition: assetInfo.condition,
            location: assetInfo.location_name,
            assigned_to: assetInfo.assigned_to_person,
            assigned_email: assetInfo.assigned_to_email,
            assigned_date: assetInfo.assigned_date
        };

        const qrJson = JSON.stringify(payload);

        const pngDataUrl = await QRCode.toDataURL(qrJson, {
            errorCorrectionLevel: "M"
        });

        const base64 = pngDataUrl.split(",")[1];
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

        const path = `${assetInfo.id}.png`;

        const { error: uploadError } = await supabase.storage
            .from("asset-qrcodes")
            .upload(path, bytes, {
                contentType: "image/png",
                upsert: true
            });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
            .from("asset-qrcodes")
            .getPublicUrl(path);

        return urlData.publicUrl;
    }

    async function submitForm() {
        const tag = await generateAssetTag(form.model_id);

        const { data: inserted, error: insertError } = await supabase
            .from("assets")
            .insert([
                {
                    model_id: form.model_id,
                    cost_center_id: form.cost_center_id,
                    department_id: form.department_id,
                    asset_tag: tag,
                    serial_number: tag,
                    purchase_date: form.purchase_date || null,
                    cost: form.cost || null,
                    currency: "USD",
                    notes: form.notes || null,
                    location_id: form.location_id || null,
                    state: "in_use",
                    condition: "excellent",
                }
            ])
            .select()
            .single();

        if (insertError) {
            alert("Error creating asset: " + insertError.message);
            return;
        }

        const assetId = inserted.id;

        if (form.person_id) {
            const { error: assignError } = await supabase
                .from("asset_assignments")
                .insert([
                    {
                        asset_id: assetId,
                        type: "user",
                        person_id: form.person_id
                    }
                ]);

            if (assignError) {
                alert("Asset created, but assignment failed: " + assignError.message);
            }
        }

        const { data: detailed } = await supabase
            .from("v_assets_detailed")
            .select("*")
            .eq("id", assetId)
            .single();

        let qrUrl;
        try {
            qrUrl = await uploadQrCode(detailed);
        } catch (err) {
            alert("Asset created but QR upload failed: " + err.message);
        }

        if (qrUrl) {
            await supabase
                .from("assets")
                .update({ qr_code_url: qrUrl })
                .eq("id", assetId);
        }

        setShowForm(false);
        await fetchAssets();
    }

    function getStatusColor(status) {
        const map = {
            in_use: "green",
            in_stock: "blue",
            maintenance: "red",
            retired: "gray",
            lost: "red",
        };
        return map[status] || "default";
    }

    return (
        <div className="assets-container">
            
            {/* CREATE ASSET MODAL */}
            {showForm && (
                <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-xl border">

                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Create Asset</h2>
                            <button onClick={() => setShowForm(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">

                            {/* MODEL */}
                            <div>
                                <label className="block text-sm">Model</label>
                                <select
                                    name="model_id"
                                    value={form.model_id}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded"
                                >
                                    <option value="">Select Model</option>
                                    {models.map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.name} {m.vendor ? `(${m.vendor})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* COST CENTER */}
                            <div>
                                <label className="block text-sm">Cost Center</label>
                                <select
                                    name="cost_center_id"
                                    value={form.cost_center_id}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded"
                                >
                                    <option value="">Select Cost Center</option>
                                    {costCenters.map(cc => (
                                        <option key={cc.id} value={cc.id}>
                                            {cc.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* DEPARTMENT */}
                            <div>
                                <label className="block text-sm">Department</label>
                                <select
                                    name="department_id"
                                    value={form.department_id}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded"
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* PERSON */}
                            <div>
                                <label className="block text-sm">Assign To</label>
                                <select
                                    name="person_id"
                                    value={form.person_id}
                                    onChange={handleChange}
                                    disabled={!form.department_id}
                                    className="w-full border p-2 rounded disabled:bg-gray-100"
                                >
                                    <option value="">Select User</option>
                                    {filteredPeople.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.first_name} {p.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* LOCATION */}
                            <div>
                                <label className="block text-sm">Location</label>
                                <select
                                    name="location_id"
                                    value={form.location_id}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded"
                                >
                                    <option value="">Select Location</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>
                                            {loc.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* PURCHASE DATE */}
                            <div>
                                <label className="block text-sm">Purchase Date</label>
                                <input
                                    type="date"
                                    name="purchase_date"
                                    value={form.purchase_date}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded"
                                />
                            </div>

                            {/* COST */}
                            <div>
                                <label className="block text-sm">Cost (USD)</label>
                                <input
                                    type="number"
                                    name="cost"
                                    value={form.cost}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded"
                                    step="0.01"
                                />
                            </div>

                            {/* NOTES */}
                            <div>
                                <label className="block text-sm">Notes</label>
                                <textarea
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded"
                                />
                            </div>

                            <Button onClick={submitForm} className="w-full">
                                Create Asset
                            </Button>

                        </div>
                    </div>
                </div>
            )}

            {/* CREATE MODEL MODAL */}
            {showModelForm && (
                <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-xl border">

                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">New Model</h2>
                            <button onClick={() => setShowModelForm(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">

                            <div>
                                <label className="block text-sm">Category</label>
                                <select
                                    name="category_id"
                                    value={modelForm.category_id}
                                    onChange={handleModelChange}
                                    className="w-full border p-2 rounded"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm">Vendor</label>
                                <input
                                    name="vendor"
                                    value={modelForm.vendor}
                                    onChange={handleModelChange}
                                    className="w-full border p-2 rounded"
                                />
                            </div>

                            <div>
                                <label className="block text-sm">Name</label>
                                <input
                                    name="name"
                                    value={modelForm.name}
                                    onChange={handleModelChange}
                                    className="w-full border p-2 rounded"
                                />
                            </div>

                            <div>
                                <label className="block text-sm">SKU</label>
                                <input
                                    name="sku"
                                    value={modelForm.sku}
                                    onChange={handleModelChange}
                                    className="w-full border p-2 rounded"
                                />
                            </div>

                            <Button onClick={submitModel} className="w-full">
                                Create Model
                            </Button>

                        </div>
                    </div>
                </div>
            )}

            {/* ASSET TABLE */}
            <WindowSection title="All Assets" icon={HardDrive} buttons={buttons()}>
                <h1>{error}</h1>

                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Asset ID</th>
                            <th className="px-6 py-3">Model</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Assigned To</th>
                        </tr>
                    </thead>

                    <tbody>
                        {assets.map(asset => (
                            <tr key={asset.id} className="bg-white border-b border-b-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">
                                    {asset.asset_tag || "No Tag"}
                                </td>
                                <td className="px-6 py-4">{asset.model_name}</td>
                                <td className="px-6 py-4">{asset.category_name}</td>
                                <td className="px-6 py-4">
                                    <Tag color={getStatusColor(asset.state)}>
                                        {asset.state.replace("_", " ")}
                                    </Tag>
                                </td>
                                <td className="px-6 py-4">
                                    {asset.assigned_to_person || (
                                        <span className="italic text-gray-400">
                                            Unassigned
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </WindowSection>
        </div>
    );
}
