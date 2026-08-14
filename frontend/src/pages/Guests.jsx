import { useEffect, useState } from "react";
import api from "../api/axios";

const emptyGuest = {
  name: "",
  email: "",
  phone: "",
  idType: "Passport",
  idNumber: "",
  address: "",
  notes: "",
};

const Guests = () => {
  const [guests, setGuests] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyGuest);
  const [error, setError] = useState("");

  const loadGuests = async () => {
    const { data } = await api.get("/guests", { params: search ? { search } : {} });
    setGuests(data);
  };

  useEffect(() => {
    loadGuests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreate = () => {
    setForm(emptyGuest);
    setEditingId(null);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (guest) => {
    setForm(guest);
    setEditingId(guest._id);
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/guests/${editingId}`, form);
      } else {
        await api.post("/guests", form);
      }
      setModalOpen(false);
      loadGuests();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save guest");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this guest record?")) return;
    try {
      await api.delete(`/guests/${id}`);
      loadGuests();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete guest");
    }
  };

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate font-mono">Directory</p>
          <h1 className="font-display text-3xl mt-1">Guests</h1>
        </div>
        <button onClick={openCreate} className="btn-primary">
          + Add Guest
        </button>
      </header>

      <input
        placeholder="Search by name, phone, email, or ID…"
        className="input-field max-w-sm mb-6"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink/5 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-slate">Name</th>
              <th className="px-4 py-3 font-medium text-slate">Contact</th>
              <th className="px-4 py-3 font-medium text-slate">ID</th>
              <th className="px-4 py-3 font-medium text-slate"></th>
            </tr>
          </thead>
          <tbody>
            {guests.map((g) => (
              <tr key={g._id} className="border-t border-ink/5">
                <td className="px-4 py-3 font-medium">{g.name}</td>
                <td className="px-4 py-3 text-slate">
                  <div>{g.phone}</div>
                  {g.email && <div className="text-xs">{g.email}</div>}
                </td>
                <td className="px-4 py-3 text-slate font-mono text-xs">
                  {g.idType}: {g.idNumber}
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button onClick={() => openEdit(g)} className="text-teal font-medium">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(g._id)} className="text-danger font-medium">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {guests.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate">
                  No guests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-md">
            <h2 className="font-display text-xl mb-4">{editingId ? "Edit Guest" : "Add Guest"}</h2>
            {error && (
              <p className="text-danger text-sm bg-danger/10 px-3 py-2 rounded-md mb-3">
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm text-slate">Full name</label>
                <input
                  required
                  className="input-field mt-1"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate">Phone</label>
                  <input
                    required
                    className="input-field mt-1"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate">Email</label>
                  <input
                    type="email"
                    className="input-field mt-1"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate">ID type</label>
                  <select
                    className="input-field mt-1"
                    value={form.idType}
                    onChange={(e) => setForm({ ...form, idType: e.target.value })}
                  >
                    <option>Passport</option>
                    <option>Driver's License</option>
                    <option>National ID</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate">ID number</label>
                  <input
                    required
                    className="input-field mt-1"
                    value={form.idNumber}
                    onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate">Address</label>
                <input
                  className="input-field mt-1"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-slate">Notes</label>
                <textarea
                  className="input-field mt-1"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  {editingId ? "Save Changes" : "Add Guest"}
                </button>
                <button
                  type="button"
                  className="btn-secondary flex-1"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guests;
