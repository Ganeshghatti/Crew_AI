import { Link } from "react-router-dom";

function DashboardStats({ path, iconlarge, name, desc, colorIndex }) {
  const COLORS = ["primary", "primary"];

  const getDescStyle = () => {
    if (description.includes("↗︎"))
      return "font-bold text-green-700 dark:text-green-300";
    else if (description.includes("↙"))
      return "font-bold text-rose-500 dark:text-red-400";
    else return "";
  };

  return (
    <div className="stats shadow py-4">
      <Link to={`${path}`}>
        <div className="stat">
          <div
            className={`stat-figure text-xl dark:text-slate-300 text-${
              COLORS[colorIndex % 2]
            }`}
          >
            {iconlarge}
          </div>
          <div className="stat-title dark:text-slate-300 break-words whitespace-normal">{desc}</div>
          <div
            className={`stat-value dark:text-slate-300 text-${
              COLORS[colorIndex % 2]
            }`}
          >
            {name}
          </div>
        </div>{" "}
      </Link>
    </div>
  );
}

export default DashboardStats;
