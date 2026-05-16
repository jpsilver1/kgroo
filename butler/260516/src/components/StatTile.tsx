export function StatTile({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "up" | "down" | "neutral";
}) {
  return (
    <section className="stat-tile">
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
      <small>{detail}</small>
    </section>
  );
}
