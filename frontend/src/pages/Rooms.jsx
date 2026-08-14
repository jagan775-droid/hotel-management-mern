import { useEffect, useState } from "react";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

const emptyRoom = {
  roomNumber: "",
  type: "Single",
  floor: 1,
  pricePerNight: 60,
  capacity: 1,
  amenities: "",
  description: "",
  status: "available",
};

const cardAccent = {
  available: "border-l-success",
  occupied: "border-l-danger",
  maintenance: "border-l-warning",
  cleaning: "border-l-brass",
};

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyRoom);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const canManage = user?.role === "admin" || user?.role === "manager";

  const loadRooms = async () => {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (search) params.search = search;
    const { data } = await api.get("/rooms", { params });
    setRooms(data);
  };

  useEffect(() => {
    loadRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

  const openCreate = () => {
    setForm(emptyRoom);
    setEditingId(null);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (room) => {
    setForm({
      ...room,
      amenities: (room.amenities || []).join(", "),
    });
    setEditingId(room._id);
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      floor: Number(form.floor),
      pricePerNight: Number(form.pricePerNight),
      capacity: Number(form.capacity),
      amenities: form.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
    };
    try {
      if (editingId) {
        await api.put(`/rooms/${editingId}`, payload);
      } else {
        await api.post("/rooms", payload);
      }
      setModalOpen(false);
      loadRooms();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save room");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this room? This cannot be undone.")) return;
    try {
      await api.delete(`/rooms/${id}`);
      loadRooms();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete room");
    }
  };

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate font-mono">Inventory</p>
          <h1 className="font-display text-3xl mt-1">Rooms</h1>
        </div>
        {canManage && (
          <button onClick={openCreate} className="btn-primary">
            + Add Room
          </button>
        )}
      </header>

      <div className="flex gap-3 mb-6">
        <input
          placeholder="Search room number…"
          className="input-field max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input-field max-w-[180px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="cleaning">Cleaning</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div
            key={room._id}
            className={`card p-5 border-l-4 ${cardAccent[room.status] || "border-l-slate"}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-mono text-2xl text-ink">{room.roomNumber}</p>
                <p className="text-sm text-slate">{room.type} · Floor {room.floor}</p>
              </div>
              <StatusBadge status={room.status} />
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-xl">${room.pricePerNight}</span>
              <span className="text-xs text-slate">/ night · sleeps {room.capacity}</span>
            </div>
            {room.amenities?.length > 0 && (
              <p className="text-xs text-slate mt-2">{room.amenities.join(" · ")}</p>
            )}
            {canManage && (
              <div className="mt-4 flex gap-2">
                <button onClick={() => openEdit(room)} className="text-sm text-teal font-medium">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(room._id)}
                  className="text-sm text-danger font-medium"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
        {rooms.length === 0 && (
          <p className="text-slate col-span-full">No rooms match your filters.</p>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-md">
            <h2 className="font-display text-xl mb-4">
              {editingId ? "Edit Room" : "Add Room"}
            </h2>
            {error && (
              <p className="text-danger text-sm bg-danger/10 px-3 py-2 rounded-md mb-3">
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate">Room number</label>
                  <input
                    required
                    className="input-field mt-1"
                    value={form.roomNumber}
                    onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate">Type</label>
                  <select
                    className="input-field mt-1"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option>Single</option>
                    <option>Double</option>
                    <option>Deluxe</option>
                    <option>Suite</option>
                    <option>Family</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate">Floor</label>
                  <input
                    type="number"
                    required
                    className="input-field mt-1"
                    value={form.floor}
                    onChange={(e) => setForm({ ...form, floor: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate">Capacity</label>
                  <input
                    type="number"
                    required
                    className="input-field mt-1"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-slate">Price per night ($)</label>
                  <input
                    type="number"
                    required
                    className="input-field mt-1"
                    value={form.pricePerNight}
                    onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })}
                  />
                </div>
                {editingId && (
                  <div className="col-span-2">
                    <label className="text-sm text-slate">Status</label>
                    <select
                      className="input-field mt-1"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                )}
                <div className="col-span-2">
                  <label className="text-sm text-slate">Amenities (comma separated)</label>
                  <input
                    className="input-field mt-1"
                    value={form.amenities}
                    onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                    placeholder="WiFi, TV, Balcony"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  {editingId ? "Save Changes" : "Create Room"}
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

export default Rooms;
