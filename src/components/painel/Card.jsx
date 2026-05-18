import "./painel.css";

export default function Card({ title, value }) {
  return (
    <div className="dashboard-card">
      <span>{title}</span>
      <h2>{value}</h2>
    </div>
  );
}