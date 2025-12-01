import { ShoppingCart, Sliders, PlusCircle, X, Trash2, Edit, Plus } from "lucide-react";
import Button from "../components/Button";
import WindowSection from "../components/WindowSection";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * ProcurementContent.jsx
 *
 * Full Procurement page with CRUD UI for:
 * - purchase_orders (PO)
 * - po_lines (line items)
 *
 * Modal style: Option A (centered white box)
 *
 * Notes:
 * - This file follows the existing patterns used across the project (Button, WindowSection, tailwind classes).
 * - All Supabase operations are implemented and refresh the main list via fetchPos().
 * - The PO detail modal contains a PO lines editor (create/edit/delete).
 */

export default function ProcurementContent() {
  // --- main data + ui state ---
  const [pos, setPos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // modal states
  const [showNewPoModal, setShowNewPoModal] = useState(false);
  const [showEditPoModal, setShowEditPoModal] = useState(false);
  const [showDeletePoConfirm, setShowDeletePoConfirm] = useState(false);

  // currently selected PO for view/edit
  const [activePo, setActivePo] = useState(null);

  // PO form state (used for new & edit)
  const emptyPoForm = { vendor_id: "", po_number: "", order_date: "", status: "open", notes: "" };
  const [poForm, setPoForm] = useState(emptyPoForm);

  // PO lines editor state
  const [poLines, setPoLines] = useState([]);
  const [lineForm, setLineForm] = useState({
    id: null,
    po_id: null,
    model_id: "",
    quantity: 1,
    unit_cost: "",
    currency: "USD",
    expected_date: ""
  });
  const [showLineModal, setShowLineModal] = useState(false);
  const [isEditingLine, setIsEditingLine] = useState(false);

  // vendor + model lookup caches for selects (optional UX nicety)
  const [vendors, setVendors] = useState([]);
  const [models, setModels] = useState([]);

  useEffect(() => {
    fetchPos();
    fetchVendors();
    fetchModels();
  }, []);

  // ---------------------------
  // Data fetching helpers
  // ---------------------------
  async function fetchPos() {
    setLoading(true);
    try {
      // Using the view v_purchase_orders_with_vendors used elsewhere in your app
      const { data, error } = await supabase
        .from("v_purchase_orders_with_vendors")
        .select("*")
        .order("order_date", { ascending: false });

      if (error) throw error;
      setPos(data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  }

  async function fetchVendors() {
    try {
      const { data, error } = await supabase.from("vendors").select("id, name").order("name");
      if (error) throw error;
      setVendors(data || []);
    } catch (err) {
      console.error("Failed to load vendors", err);
    }
  }

  async function fetchModels() {
    try {
      const { data, error } = await supabase.from("asset_models").select("id, name").order("name");
      if (error) throw error;
      setModels(data || []);
    } catch (err) {
      console.error("Failed to load models", err);
    }
  }

  // ---------------------------
  // PURCHASE ORDER CRUD
  // ---------------------------
  async function createPO({ vendor_id, po_number, order_date, status = "open", notes = null }) {
    try {
      const { data, error } = await supabase
        .from("purchase_orders")
        .insert([{ vendor_id, po_number, order_date, status, notes }])
        .select()
        .single();

      if (error) throw error;
      await fetchPos();
      return data;
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create PO");
      return null;
    }
  }

  async function getPO(id) {
    try {
      const { data, error } = await supabase.from("purchase_orders").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch PO");
      return null;
    }
  }

  async function updatePO(id, updates) {
    try {
      const { data, error } = await supabase
        .from("purchase_orders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      await fetchPos();
      return data;
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update PO");
      return null;
    }
  }

  async function deletePO(id) {
    try {
      const { error } = await supabase.from("purchase_orders").delete().eq("id", id);
      if (error) throw error;
      await fetchPos();
      closeAllPoModals();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete PO");
    }
  }

  // ---------------------------
  // PO LINES CRUD
  // ---------------------------
  async function createPOLine({ po_id, model_id, quantity, unit_cost, currency, expected_date }) {
    try {
      const parsedCost = unit_cost === "" ? null : Number(unit_cost);
      const { data, error } = await supabase
        .from("po_lines")
        .insert([{ po_id, model_id, quantity: Number(quantity), unit_cost: parsedCost, currency, expected_date }])
        .select()
        .single();

      if (error) throw error;
      await reloadPoLines(po_id);
      await fetchPos();
      return data;
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add line");
      return null;
    }
  }

  async function getPOLines(po_id) {
    try {
      const { data, error } = await supabase.from("po_lines").select("*, asset_models(name)").eq("po_id", po_id);
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load lines");
      return [];
    }
  }

  async function updatePOLine(id, updates) {
    try {
      if (updates.quantity) updates.quantity = Number(updates.quantity);
      if (updates.unit_cost === "") updates.unit_cost = null;
      else if (updates.unit_cost != null) updates.unit_cost = Number(updates.unit_cost);

      const { data, error } = await supabase.from("po_lines").update(updates).eq("id", id).select().single();
      if (error) throw error;
      await reloadPoLines(data.po_id);
      await fetchPos();
      return data;
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update line");
      return null;
    }
  }

  async function deletePOLine(id) {
    try {
      // get po_id before deleting so we can reload
      const { data: lineData, error: fetchErr } = await supabase.from("po_lines").select("po_id").eq("id", id).single();
      if (fetchErr) throw fetchErr;

      const { error } = await supabase.from("po_lines").delete().eq("id", id);
      if (error) throw error;

      await reloadPoLines(lineData.po_id);
      await fetchPos();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete line");
    }
  }

  // Reload lines for a given PO and set local state
  async function reloadPoLines(po_id) {
    if (!po_id) return setPoLines([]);
    const lines = await getPOLines(po_id);
    setPoLines(lines);
  }

  // ---------------------------
  // Modal open/close helpers
  // ---------------------------
  function openNewPoModal() {
    setPoForm(emptyPoForm);
    setShowNewPoModal(true);
  }

  function openEditPoModal(po) {
    // prepare full object; the view may not include vendor_id so fetch the PO row
    setActivePo(po);
    setShowEditPoModal(true);
    // get full po details into the form
    (async () => {
      const full = await getPO(po.id);
      if (full) {
        setPoForm({
          vendor_id: full.vendor_id || "",
          po_number: full.po_number || "",
          order_date: full.order_date ? full.order_date.toString().slice(0, 10) : "",
          status: full.status || "open",
          notes: full.notes || ""
        });
        // load lines
        await reloadPoLines(po.id);
      }
    })();
  }

  function openPoDetail(po) {
    setActivePo(po);
    setShowEditPoModal(true);
    // fetch full details + lines
    (async () => {
      const full = await getPO(po.id);
      if (full) {
        setPoForm({
          vendor_id: full.vendor_id || "",
          po_number: full.po_number || "",
          order_date: full.order_date ? full.order_date.toString().slice(0, 10) : "",
          status: full.status || "open",
          notes: full.notes || ""
        });
        await reloadPoLines(po.id);
      }
    })();
  }

  function openDeleteConfirm(po) {
    setActivePo(po);
    setShowDeletePoConfirm(true);
  }

  function closeAllPoModals() {
    setShowNewPoModal(false);
    setShowEditPoModal(false);
    setShowDeletePoConfirm(false);
    setActivePo(null);
    setPoForm(emptyPoForm);
    setPoLines([]);
  }

  // ---------------------------
  // Form handlers
  // ---------------------------
  async function handleSubmitNewPo(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (!poForm.vendor_id || !poForm.po_number || !poForm.order_date) {
        setError("Vendor, PO number, and order date are required.");
        return;
      }
      await createPO({
        vendor_id: poForm.vendor_id,
        po_number: poForm.po_number,
        order_date: poForm.order_date,
        status: poForm.status || "open",
        notes: poForm.notes
      });
      setShowNewPoModal(false);
      setPoForm(emptyPoForm);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create PO");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitEditPo(e) {
    e.preventDefault();
    if (!activePo) return;
    setLoading(true);
    try {
      await updatePO(activePo.id, {
        vendor_id: poForm.vendor_id,
        po_number: poForm.po_number,
        order_date: poForm.order_date,
        status: poForm.status,
        notes: poForm.notes
      });
      setShowEditPoModal(false);
      setActivePo(null);
      setPoForm(emptyPoForm);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update PO");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmDeletePo() {
    if (!activePo) return;
    setLoading(true);
    try {
      await deletePO(activePo.id);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete PO");
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------
  // PO Line form handlers
  // ---------------------------
  function openNewLineModal(po_id) {
    setLineForm({
      id: null,
      po_id,
      model_id: "",
      quantity: 1,
      unit_cost: "",
      currency: "USD",
      expected_date: ""
    });
    setIsEditingLine(false);
    setShowLineModal(true);
  }

  function openEditLineModal(line) {
    setLineForm({
      id: line.id,
      po_id: line.po_id,
      model_id: line.model_id,
      quantity: line.quantity,
      unit_cost: line.unit_cost === null ? "" : String(line.unit_cost),
      currency: line.currency || "USD",
      expected_date: line.expected_date ? line.expected_date.toString().slice(0, 10) : ""
    });
    setIsEditingLine(true);
    setShowLineModal(true);
  }

  async function handleSubmitLine(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (!lineForm.model_id || !lineForm.quantity || !lineForm.po_id) {
        setError("Model, quantity and parent PO are required.");
        return;
      }

      if (isEditingLine && lineForm.id) {
        await updatePOLine(lineForm.id, {
          model_id: lineForm.model_id,
          quantity: Number(lineForm.quantity),
          unit_cost: lineForm.unit_cost === "" ? null : Number(lineForm.unit_cost),
          currency: lineForm.currency,
          expected_date: lineForm.expected_date || null
        });
      } else {
        await createPOLine({
          po_id: lineForm.po_id,
          model_id: lineForm.model_id,
          quantity: Number(lineForm.quantity),
          unit_cost: lineForm.unit_cost === "" ? null : Number(lineForm.unit_cost),
          currency: lineForm.currency,
          expected_date: lineForm.expected_date || null
        });
      }

      // reload lines for current PO and refresh list
      await reloadPoLines(lineForm.po_id);
      await fetchPos();
      setShowLineModal(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save line");
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------
  // UI render helpers
  // ---------------------------
  const buttons = () => {
    return (
      <div className="flex space-x-2">
        <Button icon={PlusCircle} onClick={openNewPoModal}>
          New PO
        </Button>
      </div>
    );
  };

  // ---------------------------
  // JSX
  // ---------------------------
  return (
    <div className="procurement-container">
      <WindowSection title="Purchase Orders" icon={ShoppingCart} buttons={buttons()}>
        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-800">Error:</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        ) : null}

        <div className="mt-4">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Vendor</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4">
                    Loading...
                  </td>
                </tr>
              ) : pos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 italic text-gray-500">
                    No purchase orders found.
                  </td>
                </tr>
              ) : (
                pos.map((po) => (
                  <tr key={po.id} className="bg-white border-b border-b-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-blue-600 hover:underline cursor-pointer" onClick={() => openPoDetail(po)}>
                      {po.po_number}
                    </td>
                    <td className="px-6 py-4">{po.vendor_name}</td>
                    <td className="px-6 py-4">{po.order_date}</td>
                    <td className="px-6 py-4">{po.po_line_count ?? 0}</td>
                    <td className="px-6 py-4">${po.total_po_cost ?? "0.00"}</td>
                    <td className="px-6 py-4">{po.status}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" icon={Edit} onClick={() => openEditPoModal(po)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="danger" icon={Trash2} onClick={() => openDeleteConfirm(po)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </WindowSection>

      {/* --------------------------
          New PO Modal (Option A)
         -------------------------- */}
      {showNewPoModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowNewPoModal(false)} />
          <div className="relative z-50 w-full max-w-2xl bg-white rounded-lg shadow-lg border p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Create Purchase Order</h3>
              <button className="p-2 hover:bg-gray-100 rounded" onClick={() => setShowNewPoModal(false)}>
                <X />
              </button>
            </div>

            <form className="mt-4 space-y-4" onSubmit={handleSubmitNewPo}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vendor</label>
                  <select
                    className="mt-1 block w-full rounded border p-2"
                    value={poForm.vendor_id}
                    onChange={(e) => setPoForm({ ...poForm, vendor_id: e.target.value })}
                    required
                  >
                    <option value="">Select a vendor</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">PO Number</label>
                  <input
                    className="mt-1 block w-full rounded border p-2"
                    value={poForm.po_number}
                    onChange={(e) => setPoForm({ ...poForm, po_number: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Order Date</label>
                  <input
                    type="date"
                    className="mt-1 block w-full rounded border p-2"
                    value={poForm.order_date}
                    onChange={(e) => setPoForm({ ...poForm, order_date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    className="mt-1 block w-full rounded border p-2"
                    value={poForm.status}
                    onChange={(e) => setPoForm({ ...poForm, status: e.target.value })}
                  >
                    <option value="open">open</option>
                    <option value="pending">pending</option>
                    <option value="received">received</option>
                    <option value="closed">closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  className="mt-1 block w-full rounded border p-2"
                  rows="3"
                  value={poForm.notes}
                  onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2 mt-2">
                <Button variant="ghost" onClick={() => setShowNewPoModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" icon={PlusCircle}>
                  Save PO
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------
          Edit / Detail PO Modal (Option A)
         -------------------------- */}
      {showEditPoModal && activePo && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => closeAllPoModals()} />
          <div className="relative z-50 w-full max-w-3xl bg-white rounded-lg shadow-lg border p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">PO Details — {activePo.po_number}</h3>
              <button className="p-2 hover:bg-gray-100 rounded" onClick={() => closeAllPoModals()}>
                <X />
              </button>
            </div>

            <form className="mt-4 space-y-4" onSubmit={handleSubmitEditPo}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vendor</label>
                  <select
                    className="mt-1 block w-full rounded border p-2"
                    value={poForm.vendor_id}
                    onChange={(e) => setPoForm({ ...poForm, vendor_id: e.target.value })}
                    required
                  >
                    <option value="">Select a vendor</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">PO Number</label>
                  <input
                    className="mt-1 block w-full rounded border p-2"
                    value={poForm.po_number}
                    onChange={(e) => setPoForm({ ...poForm, po_number: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Order Date</label>
                  <input
                    type="date"
                    className="mt-1 block w-full rounded border p-2"
                    value={poForm.order_date}
                    onChange={(e) => setPoForm({ ...poForm, order_date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    className="mt-1 block w-full rounded border p-2"
                    value={poForm.status}
                    onChange={(e) => setPoForm({ ...poForm, status: e.target.value })}
                  >
                    <option value="open">open</option>
                    <option value="pending">pending</option>
                    <option value="received">received</option>
                    <option value="closed">closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  className="mt-1 block w-full rounded border p-2"
                  rows="3"
                  value={poForm.notes}
                  onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-between items-center mt-2">
                <div className="flex space-x-2">
                  <Button variant="danger" icon={Trash2} onClick={() => openDeleteConfirm(activePo)}>
                    Delete PO
                  </Button>
                </div>

                <div className="flex space-x-2">
                  <Button variant="ghost" onClick={() => closeAllPoModals()}>
                    Cancel
                  </Button>
                  <Button type="submit" icon={PlusCircle}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>

            {/* PO Lines section */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium">Line Items</h4>
                <Button size="sm" icon={Plus} onClick={() => openNewLineModal(activePo.id)}>
                  Add Line
                </Button>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-2">Model</th>
                      <th className="px-4 py-2">Qty</th>
                      <th className="px-4 py-2">Unit Cost</th>
                      <th className="px-4 py-2">Currency</th>
                      <th className="px-4 py-2">Expected</th>
                      <th className="px-4 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {poLines && poLines.length > 0 ? (
                      poLines.map((line) => (
                        <tr key={line.id} className="bg-white border-b border-b-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-2">{line.asset_models?.name ?? line.model_id}</td>
                          <td className="px-4 py-2">{line.quantity}</td>
                          <td className="px-4 py-2">{line.unit_cost === null ? "-" : `$${line.unit_cost}`}</td>
                          <td className="px-4 py-2">{line.currency ?? "USD"}</td>
                          <td className="px-4 py-2">{line.expected_date ?? "-"}</td>
                          <td className="px-4 py-2">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" icon={Edit} onClick={() => openEditLineModal(line)}>
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                icon={Trash2}
                                onClick={() => {
                                  if (confirm("Delete this line item?")) deletePOLine(line.id);
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-3 italic text-gray-500">
                          No line items yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------
          Delete PO Confirmation Modal (Option A)
         -------------------------- */}
      {showDeletePoConfirm && activePo && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowDeletePoConfirm(false)} />
          <div className="relative z-50 w-full max-w-lg bg-white rounded-lg shadow-lg border p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Delete Purchase Order</h3>
              <button className="p-2 hover:bg-gray-100 rounded" onClick={() => setShowDeletePoConfirm(false)}>
                <X />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete <strong>{activePo.po_number}</strong>? This will also remove all associated line items.
              </p>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="ghost" onClick={() => setShowDeletePoConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="danger" icon={Trash2} onClick={handleConfirmDeletePo}>
                  Confirm Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------
          PO Line Modal (Option A)
         -------------------------- */}
      {showLineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowLineModal(false)} />
          <div className="relative z-60 w-full max-w-2xl bg-white rounded-lg shadow-lg border p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{isEditingLine ? "Edit Line Item" : "Add Line Item"}</h3>
              <button className="p-2 hover:bg-gray-100 rounded" onClick={() => setShowLineModal(false)}>
                <X />
              </button>
            </div>

            <form className="mt-4 space-y-4" onSubmit={handleSubmitLine}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Model</label>
                  <select
                    className="mt-1 block w-full rounded border p-2"
                    value={lineForm.model_id}
                    onChange={(e) => setLineForm({ ...lineForm, model_id: e.target.value })}
                    required
                  >
                    <option value="">Select a model</option>
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    className="mt-1 block w-full rounded border p-2"
                    value={lineForm.quantity}
                    onChange={(e) => setLineForm({ ...lineForm, quantity: Number(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="mt-1 block w-full rounded border p-2"
                    value={lineForm.unit_cost}
                    onChange={(e) => setLineForm({ ...lineForm, unit_cost: e.target.value })}
                    placeholder="Leave blank if not set"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Currency</label>
                  <input
                    className="mt-1 block w-full rounded border p-2"
                    value={lineForm.currency}
                    onChange={(e) => setLineForm({ ...lineForm, currency: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Expected Date</label>
                  <input
                    type="date"
                    className="mt-1 block w-full rounded border p-2"
                    value={lineForm.expected_date}
                    onChange={(e) => setLineForm({ ...lineForm, expected_date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Parent PO</label>
                  <select
                    className="mt-1 block w-full rounded border p-2"
                    value={lineForm.po_id || activePo?.id}
                    onChange={(e) => setLineForm({ ...lineForm, po_id: e.target.value })}
                    required
                  >
                    <option value="">Select PO</option>
                    {pos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.po_number}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-2">
                <Button variant="ghost" onClick={() => setShowLineModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" icon={PlusCircle}>
                  {isEditingLine ? "Save Line" : "Add Line"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
