const StatCard = ({ label, value, accent = "teal", suffix = "" }) => {
  const accentClasses = {
    teal: "text-teal",
    brass: "text-brass",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
  };

  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-wider text-slate font-mono">{label}</p>
      <p className={`font-display text-3xl mt-2 ${accentClasses[accent] || "text-ink"}`}>
        {value}
        <span className="text-lg align-top ml-0.5">{suffix}</span>
      </p>
    </div>
  );
};

export default StatCard;
