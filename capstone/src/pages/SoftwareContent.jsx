import { Package, PlusCircle, Edit, Trash2 } from "lucide-react";
import WindowSection from "../components/WindowSection";
import Button from "../components/Button";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SoftwareContent() {
    const [licenses, setLicenses] = useState([]);
    const [people, setPeople] = useState([]);
    const [error, setError] = useState(null);

    // Modal states
    const [showNewSoftware, setShowNewSoftware] = useState(false);
    const [showAddLicenses, setShowAddLicenses] = useState(false);
    const [showAssignLicense, setShowAssignLicense] = useState(false);

    // Edit + Delete modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [activeSoftware, setActiveSoftware] = useState(null);

    // Form fields
    const [newName, setNewName] = useState("");
    const [newPublisher, setNewPublisher] = useState("");

    const [selectedSoftware, setSelectedSoftware] = useState("");
    const [licenseAmount, setLicenseAmount] = useState(0);

    const [assignSoftwareId, setAssignSoftwareId] = useState("");
    const [assignPersonId, setAssignPersonId] = useState("");
    const [assignAvailable, setAssignAvailable] = useState(null);

    useEffect(() => {
        fetchLicenses();
        fetchPeople();
    }, []);
    
    async function fetchLicenses() {
        try {
            const { data, error } = await supabase
                .from("v_software_titles_summary")
                .select("*");

            if (error) throw error;
            setLicenses(data);
        } catch (error) {
            setError(error.message);
        }
    }

    async function fetchPeople() {
        const { data, error } = await supabase
            .from("people")
            .select("id, first_name, last_name");

        if (error) {
            setError(error.message);
            return;
        }

        setPeople(data);
    }

    // --- Create new software ---
    async function createSoftware(e) {
        e.preventDefault();

        const { error } = await supabase
            .from("software_titles")
            .insert({
                name: newName,
                publisher: newPublisher,
                count_available: 0,
                count_utilized: 0
            });

        if (error) {
            setError(error.message);
            return;
        }

        setShowNewSoftware(false);
        setNewName("");
        setNewPublisher("");
        fetchLicenses();
    }

    // --- Add licenses ---
    async function addLicenses(e) {
        e.preventDefault();

        const { error } = await supabase.rpc("increment_software_licenses", {
            software_id: selectedSoftware,
            amount: licenseAmount
        });

        if (error) {
            setError(error.message);
            return;
        }

        setShowAddLicenses(false);
        setLicenseAmount(0);
        fetchLicenses();
    }

    // --- Assign license ---
    async function assignLicense(e) {
        e.preventDefault();

        const { error } = await supabase.rpc("assign_software_license", {
            software_id: assignSoftwareId,
            person_id: assignPersonId
        });

        if (error) {
            setError(error.message);
            return;
        }

        setShowAssignLicense(false);
        setAssignSoftwareId("");
        setAssignPersonId("");
        setAssignAvailable(null);

        fetchLicenses();
    }

    // --- Edit Software ---
    function openEditModal(sw) {
        setActiveSoftware(sw);
        setNewName(sw.name);
        setNewPublisher(sw.publisher);
        setShowEditModal(true);
    }

    async function updateSoftware(e) {
        e.preventDefault();

        const { error } = await supabase
            .from("software_titles")
            .update({
                name: newName,
                publisher: newPublisher
            })
            .eq("id", activeSoftware.id);

        if (error) {
            setError(error.message);
            return;
        }

        setShowEditModal(false);
        setActiveSoftware(null);
        fetchLicenses();
    }

    // --- Delete Software ---
    async function deleteSoftware() {
        const { error } = await supabase
            .from("software_titles")
            .delete()
            .eq("id", activeSoftware.id);

        if (error) {
            setError(error.message);
            return;
        }

        setShowDeleteConfirm(false);
        setActiveSoftware(null);
        fetchLicenses();
    }

    const buttons = () => (
        <div className="flex space-x-2">
            <Button icon={PlusCircle} onClick={() => setShowNewSoftware(true)}>
                New Software
            </Button>

            <Button icon={PlusCircle} onClick={() => setShowAddLicenses(true)}>
                Add Licenses
            </Button>

            <Button icon={PlusCircle} onClick={() => setShowAssignLicense(true)}>
                Assign License
            </Button>
        </div>
    );

    return (
        <>
            {/* ------------------------ Add Software Modal ------------------------ */}
            {showNewSoftware && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <form className="bg-white p-6 rounded-lg shadow-lg w-96"
                        onSubmit={createSoftware}>
                        
                        <h2 className="text-lg font-semibold mb-4">Add Software</h2>

                        <label className="block mb-2 text-sm">Name</label>
                        <input
                            className="w-full p-2 rounded bg-gray-100 mb-4"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            required
                        />

                        <label className="block mb-2 text-sm">Publisher</label>
                        <input
                            className="w-full p-2 rounded bg-gray-100 mb-4"
                            value={newPublisher}
                            onChange={e => setNewPublisher(e.target.value)}
                        />

                        <div className="flex justify-end mt-4 space-x-2">
                            <Button type="button" onClick={() => setShowNewSoftware(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Save</Button>
                        </div>
                    </form>
                </div>
            )}

            {/* ------------------------ Edit Software Modal ------------------------ */}
            {showEditModal && activeSoftware && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <form
                        className="bg-white p-6 rounded-lg shadow-lg w-96"
                        onSubmit={updateSoftware}
                    >
                        <h2 className="text-lg font-semibold mb-4">
                            Edit Software
                        </h2>

                        <label className="block mb-2 text-sm">Name</label>
                        <input
                            className="w-full p-2 rounded bg-gray-100 mb-4"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            required
                        />

                        <label className="block mb-2 text-sm">Publisher</label>
                        <input
                            className="w-full p-2 rounded bg-gray-100 mb-4"
                            value={newPublisher}
                            onChange={e => setNewPublisher(e.target.value)}
                        />

                        <div className="flex justify-end mt-4 space-x-2">
                            <Button type="button"
                                onClick={() => {
                                    setShowEditModal(false);
                                    setActiveSoftware(null);
                                }}>
                                Cancel
                            </Button>
                            <Button type="submit">Save</Button>
                        </div>
                    </form>
                </div>
            )}

            {/* ------------------------ Delete Confirm Modal ------------------------ */}
            {showDeleteConfirm && activeSoftware && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-semibold mb-4 text-red-600">
                            Delete Software
                        </h2>

                        <p className="mb-4">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold">{activeSoftware.name}</span>?
                        </p>

                        <div className="flex justify-end space-x-2">
                            <Button onClick={() => setShowDeleteConfirm(false)}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={deleteSoftware}>
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------------ Add Licenses Modal ------------------------ */}
            {showAddLicenses && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <form className="bg-white p-6 rounded-lg shadow-lg w-96"
                        onSubmit={addLicenses}>

                        <h2 className="text-lg font-semibold mb-4">Add Licenses</h2>

                        <label className="block mb-2 text-sm">Software</label>
                        <select
                            className="w-full p-2 rounded bg-gray-100 mb-4"
                            value={selectedSoftware}
                            onChange={e => setSelectedSoftware(e.target.value)}
                            required
                        >
                            <option value="">Select...</option>
                            {licenses.map(l => (
                                <option key={l.id} value={l.id}>
                                    {l.name} ({l.publisher})
                                </option>
                            ))}
                        </select>

                        <label className="block mb-2 text-sm">Number of Licenses</label>
                        <input
                            type="number"
                            className="w-full p-2 rounded bg-gray-100 mb-4"
                            min="1"
                            value={licenseAmount}
                            onChange={e => setLicenseAmount(Number(e.target.value))}
                            required
                        />

                        <div className="flex justify-end mt-4 space-x-2">
                            <Button type="button" onClick={() => setShowAddLicenses(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Add</Button>
                        </div>
                    </form>
                </div>
            )}

            {/* ------------------------ Assign License Modal ------------------------ */}
            {showAssignLicense && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <form
                        className="bg-white p-6 rounded-lg shadow-lg w-96"
                        onSubmit={assignLicense}
                    >
                        <h2 className="text-lg font-semibold mb-4">Assign License</h2>

                        <label className="block mb-2 text-sm">Software</label>
                        <select
                            className="w-full p-2 rounded bg-gray-100 mb-2"
                            value={assignSoftwareId}
                            onChange={(e) => {
                                const id = e.target.value;
                                setAssignSoftwareId(id);

                                const sw = licenses.find((l) => l.id === id);
                                if (sw) {
                                    setAssignAvailable(sw.count_available);
                                } else {
                                    setAssignAvailable(null);
                                }
                            }}
                            required
                        >
                            <option value="">Select...</option>
                            {licenses.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.name} ({l.publisher})
                                </option>
                            ))}
                        </select>

                        {assignAvailable !== null && (
                            <div className="text-sm text-gray-600 mb-4">
                                Available Seats:{" "}
                                <span className={assignAvailable > 0 ? "text-green-600" : "text-red-600"}>
                                    {assignAvailable}
                                </span>
                            </div>
                        )}

                        <label className="block mb-2 text-sm">Person</label>
                        <select
                            className="w-full p-2 rounded bg-gray-100 mb-4"
                            value={assignPersonId}
                            onChange={(e) => setAssignPersonId(e.target.value)}
                            required
                        >
                            <option value="">Select...</option>
                            {people.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.first_name} {p.last_name}
                                </option>
                            ))}
                        </select>

                        <div className="flex justify-end mt-4 space-x-2">
                            <Button type="button" onClick={() => setShowAssignLicense(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={assignAvailable === 0}>
                                Assign
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* ------------------------ Main Table ------------------------ */}
            <WindowSection title="Software Licenses" icon={Package} buttons={buttons()}>
                {error && (
                    <div className="px-6 py-4 text-sm text-red-600">{error}</div>
                )}

                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Title</th>
                            <th className="px-6 py-3">Publisher</th>
                            <th className="px-6 py-3">Total Seats</th>
                            <th className="px-6 py-3">Available</th>
                            <th className="px-6 py-3">Allocated</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {licenses.map(sw => (
                            <tr key={sw.id} className="bg-white border-b border-b-gray-200 hover:bg-gray-50">
                                <td
                                    className="px-6 py-4 font-medium text-blue-600 hover:underline cursor-pointer"
                                    onClick={() => openEditModal(sw)}
                                >
                                    {sw.name}
                                </td>
                                <td className="px-6 py-4">{sw.publisher}</td>
                                <td className="px-6 py-4">{sw.count_total}</td>
                                <td className="px-6 py-4">{sw.count_available}</td>
                                <td className="px-6 py-4">{sw.count_utilized}</td>
                                
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            size="sm"
                                            icon={Edit}
                                            onClick={() => openEditModal(sw)}
                                        >
                                            Edit
                                        </Button>

                                        <Button
                                            size="sm"
                                            icon={Trash2}
                                            variant="danger"
                                            onClick={() => {
                                                setActiveSoftware(sw);
                                                setShowDeleteConfirm(true);
                                            }}
                                        >
                                            Delete
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
