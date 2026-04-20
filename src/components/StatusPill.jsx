export default function StatusPill({ status }) {
    const safeStatus = status === "delay" ? "delay" : status === "closed" ? "closed" : "in-time";

    return <span className={`status ${safeStatus}`}>{safeStatus}</span>;
}
