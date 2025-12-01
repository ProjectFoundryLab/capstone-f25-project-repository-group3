import WindowSection from "../components/WindowSection";
import Button from "../components/Button";
import { Wrench, PlusCircle, Edit, Trash2, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function MaintenanceContent() {
    const [tickets, setTickets] = useState([]);
    const [completed, setCompleted] = useState([]);
    const [assets, setAssets] = useState([]);
    const [error, setError] = useState(null);

    // -------- Edit Modal --------
    const [showEdit, setShowEdit] = useState(false);
    const [editTicket, setEditTicket] = useState(null);

    // -------- Delete Modal --------
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTicket, setDeleteTicket] = useState(null);

    // -------- Add Update Modal --------
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateTicketId, setUpdateTicketId] = useState(null);
    const [progressNote, setProgressNote] = useState("");

    // -------- View Updates Modal --------
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyTicket, setHistoryTicket] = useState(null);
    const [ticketUpdates, setTicketUpdates] = useState([]);

    useEffect(() => {
        fetchTickets();
        fetchAssets();
    }, []);

    async function fetchAssets() {
        const { data } = await supabase
            .from("v_assets_detailed")
            .select("id, model_name, asset_tag");

        setAssets(data || []);
    }

    async function fetchTickets() {
        try {
            const { data, error } = await supabase
                .from("tickets")
                .select(`
                    *,
                    v_assets_detailed (model_name, asset_tag)
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Main table: NOT completed
            setTickets(
                data.filter(
                    (t) => t.status !== "resolved" && t.status !== "closed"
                )
            );

            // Completed maintenance table
            setCompleted(
                data.filter(
                    (t) => t.status === "resolved" || t.status === "closed"
                )
            );
        } catch (err) {
            setError(err.message);
        }
    }

    // -------- View Ticket Updates --------
    async function openHistory(ticket) {
        setHistoryTicket(ticket);
        setShowHistoryModal(true);

        const { data } = await supabase
            .from("ticket_updates")
            .select("*")
            .eq("ticket_id", ticket.id)
            .order("created_at", { ascending: false });

        setTicketUpdates(data || []);
    }

    // --------- EDIT TICKET ---------
    function openEditModal(ticket) {
        setEditTicket(ticket);
        setShowEdit(true);
    }

    async function saveEdit(e) {
        e.preventDefault();

        await supabase
            .from("tickets")
            .update({
                asset_id: editTicket.asset_id,
                title: editTicket.title,
                description: editTicket.description,
                status: editTicket.status,
                priority: editTicket.priority,
            })
            .eq("id", editTicket.id);

        setShowEdit(false);
        setEditTicket(null);
        fetchTickets();
    }

    // --------- DELETE TICKET ---------
    function openDeleteModal(ticket) {
        setDeleteTicket(ticket);
        setShowDeleteConfirm(true);
    }

    async function confirmDelete() {
        await supabase.from("tickets").delete().eq("id", deleteTicket.id);
        setShowDeleteConfirm(false);
        setDeleteTicket(null);
        fetchTickets();
    }

    // --------- ADD PROGRESS UPDATE ---------
    function openUpdateModal(ticketId) {
        setProgressNote("");
        setUpdateTicketId(ticketId);
        setShowUpdateModal(true);
    }

    async function saveUpdate(e) {
        e.preventDefault();

        await supabase
            .from("ticket_updates")
            .insert([{ ticket_id: updateTicketId, note: progressNote }]);

        setShowUpdateModal(false);
        setUpdateTicketId(null);
        setProgressNote("");
    }

    // -------- STATUS + PRIORITY BADGES --------
    const StatusBadge = ({ status }) => (
        <span
            className={`
                px-2 py-1 rounded-full text-xs font-semibold
                ${
                    status === "open"
                        ? "bg-blue-100 text-blue-700"
                        : status === "in_progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-700"
                }
            `}
        >
            {status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
    );

    const PriorityBadge = ({ priority }) => (
        <span
            className={`
                px-2 py-1 rounded-full text-xs font-semibold
                ${
                    priority === "low"
                        ? "bg-gray-200 text-gray-700"
                        : priority === "medium"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-700"
                }
            `}
        >
            {priority.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
    );

    return (
        <>
            {/* ------------------ View Ticket History Modal ------------------ */}
            {showHistoryModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] max-h-[80vh] overflow-y-auto">
                        <h2 className="text-lg font-semibold mb-4">
                            Updates for: {historyTicket?.title}
                        </h2>

                        {ticketUpdates.length === 0 ? (
                            <p className="text-sm text-gray-600">
                                No updates yet.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {ticketUpdates.map((u) => (
                                    <div
                                        key={u.id}
                                        className="border border-gray-200 p-2 rounded"
                                    >
                                        <p className="text-sm">{u.note}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(
                                                u.created_at
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-end mt-4">
                            <Button onClick={() => setShowHistoryModal(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------ Edit Ticket Modal ------------------ */}
            {showEdit && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-semibold mb-4">Edit Ticket</h2>

                        <form onSubmit={saveEdit} className="space-y-4">
                            {/* Asset */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Asset</label>
                                <select
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    value={editTicket.asset_id}
                                    onChange={(e) =>
                                        setEditTicket({
                                            ...editTicket,
                                            asset_id: e.target.value,
                                        })
                                    }
                                >
                                    {assets.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.model_name} — {a.asset_tag}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    value={editTicket.title}
                                    onChange={(e) =>
                                        setEditTicket({
                                            ...editTicket,
                                            title: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Description
                                </label>
                                <textarea
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    rows="3"
                                    value={editTicket.description}
                                    onChange={(e) =>
                                        setEditTicket({
                                            ...editTicket,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    value={editTicket.status}
                                    onChange={(e) =>
                                        setEditTicket({
                                            ...editTicket,
                                            status: e.target.value,
                                        })
                                    }
                                >
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Priority
                                </label>
                                <select
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    value={editTicket.priority}
                                    onChange={(e) =>
                                        setEditTicket({
                                            ...editTicket,
                                            priority: e.target.value,
                                        })
                                    }
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button size="sm" onClick={() => setShowEdit(false)}>
                                    Cancel
                                </Button>
                                <Button size="sm" icon={Edit} type="submit">
                                    Save
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ------------------ Delete Ticket Modal ------------------ */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-semibold mb-4">Delete Ticket</h2>
                        <p className="text-sm mb-6">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold">{deleteTicket?.title}</span>?
                        </p>

                        <div className="flex justify-end space-x-2">
                            <Button size="sm" onClick={() => setShowDeleteConfirm(false)}>
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                variant="danger"
                                icon={Trash2}
                                onClick={confirmDelete}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------ Add Progress Update Modal ------------------ */}
            {showUpdateModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-semibold mb-4">
                            Add Progress Update
                        </h2>

                        <form onSubmit={saveUpdate} className="space-y-4">
                            <textarea
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                rows="4"
                                placeholder="Describe progress..."
                                value={progressNote}
                                onChange={(e) => setProgressNote(e.target.value)}
                                required
                            />

                            <div className="flex justify-end space-x-2">
                                <Button size="sm" onClick={() => setShowUpdateModal(false)}>
                                    Cancel
                                </Button>
                                <Button size="sm" icon={PlusCircle} type="submit">
                                    Add Update
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ------------------ MAIN SECTION ------------------ */}
            <WindowSection title="Maintenance Tickets" icon={Wrench}>
                {/* Active tickets */}
                <table className="w-full text-sm text-left text-gray-500 mb-10">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Title</th>
                            <th className="px-6 py-3">Asset</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Priority</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((ticket) => (
                            <tr
                                key={ticket.id}
                                className="bg-white border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                                onClick={() => openHistory(ticket)}
                            >
                                <td className="px-6 py-4 font-medium text-blue-600">
                                    {ticket.title}
                                </td>

                                <td className="px-6 py-4">
                                    {ticket.v_assets_detailed
                                        ? `${ticket.v_assets_detailed.model_name} — ${ticket.v_assets_detailed.asset_tag}`
                                        : "Unknown"}
                                </td>

                                <td className="px-6 py-4">
                                    <StatusBadge status={ticket.status} />
                                </td>

                                <td className="px-6 py-4">
                                    <PriorityBadge priority={ticket.priority} />
                                </td>

                                <td className="px-6 py-4">
                                    <div
                                        className="flex items-center space-x-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Button
                                            size="sm"
                                            icon={Edit}
                                            onClick={() => openEditModal(ticket)}
                                        >
                                            Edit
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="danger"
                                            icon={Trash2}
                                            onClick={() => openDeleteModal(ticket)}
                                        >
                                            Delete
                                        </Button>

                                        <Button
                                            size="sm"
                                            icon={PlusCircle}
                                            onClick={() => openUpdateModal(ticket.id)}
                                        >
                                            Update
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Completed Maintenance Section */}
                <h2 className="text-md font-semibold mb-3">Completed Maintenance</h2>

                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Asset</th>
                            <th className="px-6 py-3">Title</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Priority</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {completed.map((ticket) => (
                            <tr
                                key={ticket.id}
                                className="bg-white border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                                onClick={() => openHistory(ticket)}
                            >
                                <td className="px-6 py-4">
                                    {ticket.v_assets_detailed
                                        ? `${ticket.v_assets_detailed.model_name} — ${ticket.v_assets_detailed.asset_tag}`
                                        : "Unknown"}
                                </td>

                                <td className="px-6 py-4 font-medium text-blue-600">
                                    {ticket.title}
                                </td>

                                <td className="px-6 py-4">
                                    <StatusBadge status={ticket.status} />
                                </td>

                                <td className="px-6 py-4">
                                    <PriorityBadge priority={ticket.priority} />
                                </td>

                                <td className="px-6 py-4">
                                    <div
                                        className="flex items-center space-x-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Button
                                            size="sm"
                                            icon={Edit}
                                            onClick={() => openEditModal(ticket)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            icon={PlusCircle}
                                            onClick={() => openUpdateModal(ticket.id)}
                                        >
                                            Update
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </WindowSection>
        </>
    );
}
