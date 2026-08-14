import { useEffect, useState } from "react";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";

const emptyForm = {
  guest: "",
  room: "",
  checkInDate: "",
  checkOutDate: "",
  numberOfGuests: 1,
  specialRequests: "",
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [guests, setGuests] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  const loadBookings = async () => {
    const { data } = await api.get("/bookings", {
      params: statusFilter ? { status: statusFilter } : {},
    });
    setBookings(data);
  };

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const openCreate = async () => {
    setForm(emptyForm);
    setError("");
    setAvailableRooms([]);
    const { data } = await api.get("/guests");
    setGuests(data);
    setModalOpen(true);
  };

  const checkAvailability = async (checkInDate, checkOutDate) => {
    if (!checkInDate || !checkOutDate) return;
    try {
      const { data } = await api.get("/rooms/available", {
        params: { checkIn: checkInDate, checkOut: checkOutDate },
      });
      setAvailableRooms(data);
    } catch (err) {
      setAvailableRooms([]);
    }
  };

  const handleDateChange = (field, value) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    checkAvailability(updated.checkInDate, updated.checkOutDate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/bookings", form);
      setModalOpen(false);
      loadBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create booking");
    }
  };

  const handleAction = async (id, action) => {
    try {
      await api.put(`/bookings/${id}/${action}`);
      loadBookings();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action}`);
    }
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/bookings/${paymentTarget}/payment`, { amount: paymentAmount });
      setPaymentTarget(null);
      setPaymentAmount("");
      loadBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to record payment");
    }
  };

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate font-mono">Reservations</p>
          <h1 className="font-display text-3xl mt-1">Bookings</h1>
        </div>
        <button onClick={openCreate} className="btn-primary">
          + New Booking
        </button>
      </header>

      <select
        className="input-field max-w-[200px] mb-6"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="">All statuses</option>
        <option value="reserved">Reserved</option>
        <option value="checked-in">Checked in</option>
        <option value="checked-out">Checked out</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink/5 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-slate">Guest</th>
              <th className="px-4 py-3 font-medium text-slate">Room</th>
              <th className="px-4 py-3 font-medium text-slate">Dates</th>
              <th className="px-4 py-3 font-medium text-slate">Amount</th>
              <th className="px-4 py-3 font-medium text-slate">Status</th>
              <th className="px-4 py-3 font-medium text-slate">Payment</th>
              <th className="px-4 py-3 font-medium text-slate"></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id} className="border-t border-ink/5 align-top">
                <td className="px-4 py-3 font-medium">{b.guest?.name || "—"}</td>
                <td className="px-4 py-3 font-mono">{b.room?.roomNumber || "—"}</td>
                <td className="px-4 py-3 text-slate text-xs">
                  {new Date(b.checkInDate).toLocaleDateString()} →{" "}
                  {new Date(b.checkOutDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  ${b.amountPaid} / ${b.totalAmount}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={b.status} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={b.paymentStatus} />
                </td>
                <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                  {b.status === "reserved" && (
                    <button
                      onClick={() => handleAction(b._id, "checkin")}
                      className="text-teal font-medium"
                    >
                      Check in
                    </button>
                  )}
                  {b.status === "checked-in" && (
                    <button
                      onClick={() => handleAction(b._id, "checkout")}
                      className="text-teal font-medium"
                    >
                      Check out
                    </button>
                  )}
                  {["reserved", "checked-in"].includes(b.status) && (
                    <button
                      onClick={() => handleAction(b._id, "cancel")}
                      className="text-danger font-medium"
                    >
                      Cancel
                    </button>
                  )}
                  {b.paymentStatus !== "paid" && b.status !== "cancelled" && (
                    <button
                      onClick={() => setPaymentTarget(b._id)}
                      className="text-brass font-medium"
                    >
                      Pay
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-md">
            <h2 className="font-display text-xl mb-4">New Booking</h2>
            {error && (
              <p className="text-danger text-sm bg-danger/10 px-3 py-2 rounded-md mb-3">
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm text-slate">Guest</label>
                <select
                  required
                  className="input-field mt-1"
                  value={form.guest}
                  onChange={(e) => setForm({ ...form, guest: e.target.value })}
                >
                  <option value="">Select guest…</option>
                  {guests.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name} ({g.phone})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate">Check-in</label>
                  <input
                    type="date"
                    required
                    className="input-field mt-1"
                    value={form.checkInDate}
                    onChange={(e) => handleDateChange("checkInDate", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate">Check-out</label>
                  <input
                    type="date"
                    required
                    className="input-field mt-1"
                    value={form.checkOutDate}
                    onChange={(e) => handleDateChange("checkOutDate", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate">Available room</label>
                <select
                  required
                  className="input-field mt-1"
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                >
                  <option value="">
                    {form.checkInDate && form.checkOutDate
                      ? "Select room…"
                      : "Pick dates first"}
                  </option>
                  {availableRooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.roomNumber} · {r.type} · ${r.pricePerNight}/night
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate">Number of guests</label>
                <input
                  type="number"
                  min={1}
                  className="input-field mt-1"
                  value={form.numberOfGuests}
                  onChange={(e) => setForm({ ...form, numberOfGuests: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-slate">Special requests</label>
                <textarea
                  className="input-field mt-1"
                  rows={2}
                  value={form.specialRequests}
                  onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Create Booking
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

      {paymentTarget && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-sm">
            <h2 className="font-display text-xl mb-4">Record Payment</h2>
            <form onSubmit={submitPayment} className="space-y-3">
              <div>
                <label className="text-sm text-slate">Amount ($)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  className="input-field mt-1"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Record Payment
                </button>
                <button
                  type="button"
                  className="btn-secondary flex-1"
                  onClick={() => setPaymentTarget(null)}
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

export default Bookings;
