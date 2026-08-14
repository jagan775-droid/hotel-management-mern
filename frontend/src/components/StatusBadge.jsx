const styles = {
  available: "bg-success/10 text-success",
  occupied: "bg-danger/10 text-danger",
  maintenance: "bg-warning/10 text-warning",
  cleaning: "bg-brass/10 text-brass",
  reserved: "bg-teal/10 text-teal",
  "checked-in": "bg-danger/10 text-danger",
  "checked-out": "bg-slate/10 text-slate",
  cancelled: "bg-slate/10 text-slate line-through",
  unpaid: "bg-danger/10 text-danger",
  partial: "bg-warning/10 text-warning",
  paid: "bg-success/10 text-success",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize font-mono ${
      styles[status] || "bg-slate/10 text-slate"
    }`}
  >
    {status}
  </span>
);

export default StatusBadge;
