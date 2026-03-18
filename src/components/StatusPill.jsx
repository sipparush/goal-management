export default function StatusPill({ status }) {
    const safeStatus = status === "delay" ? "delay" : "in-time";

    return <span className={`status ${safeStatus}`}>{safeStatus}</span>;
}
