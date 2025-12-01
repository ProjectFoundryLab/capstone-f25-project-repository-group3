import { MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import WindowSection from "../components/WindowSection";
import { supabase } from "../lib/supabaseClient";

export default function SupportContent() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const [assets, setAssets] = useState([]);

    const [formData, setFormData] = useState({
        asset: "",        // asset_id
        title: "",
        description: "",
        status: "open",
        priority: "low",
    });

    useEffect(() => {
        fetchAssets();
    }, []);

    async function fetchAssets() {
        // Pull non-retired / non-lost assets for the dropdown
        const { data, error } = await supabase
            .from("v_assets_detailed")
            .select("id, model_name, asset_tag, state")
            .not("state", "in", "(retired,lost)");

        if (error) {
            console.error("Error fetching assets:", error);
            setMessage({ type: "error", text: "Failed to load assets for ticketing." });
            return;
        }

        setAssets(data || []);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const createTicket = async () => {
        const { asset, title, description, status, priority } = formData;

        const { data, error } = await supabase
            .from("tickets")
            .insert([
                {
                    asset_id: asset,
                    title,
                    description,
                    status,
                    priority,
                },
            ])
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    };

    const handleSubmit = async () => {
        if (!formData.asset) {
            setMessage({ type: "error", text: "Asset is required." });
            return;
        }
        if (!formData.title || !formData.description) {
            setMessage({ type: "error", text: "Title and description are required." });
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: "", text: "" });

        try {
            await createTicket();
            setMessage({ type: "success", text: "Ticket created successfully!" });

            setFormData({
                asset: "",
                title: "",
                description: "",
                status: "open",
                priority: "low",
            });
        } catch (error) {
            console.error("Error creating ticket:", error);
            setMessage({
                type: "error",
                text: error.message || "Failed to create ticket. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <WindowSection title="Submit a new Ticket" icon={MessageSquare}>
            <div className="space-y-4">
                {message.text && (
                    <div
                        className={`p-3 rounded-md ${
                            message.type === "success"
                                ? "bg-green-50 text-green-800"
                                : "bg-red-50 text-red-800"
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Asset dropdown (required) */}
                <div>
                    <label
                        htmlFor="asset"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Related Asset <span className="text-red-600">*</span>
                    </label>
                    <select
                        id="asset"
                        name="asset"
                        value={formData.asset}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="">Select an asset…</option>
                        {assets.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.model_name} — {a.asset_tag}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Title */}
                <div>
                    <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Title <span className="text-red-600">*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Briefly describe your issue"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>

                {/* Description */}
                <div>
                    <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Description <span className="text-red-600">*</span>
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Provide as much detail as possible..."
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>

                {/* Status */}
                <div>
                    <label
                        htmlFor="status"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Status
                    </label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                {/* Priority */}
                <div>
                    <label
                        htmlFor="priority"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Priority
                    </label>
                    <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </button>
            </div>
        </WindowSection>
    );
}
