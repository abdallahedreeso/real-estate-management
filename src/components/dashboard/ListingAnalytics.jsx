import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const ListingAnalytics = ({ properties = [] }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();

  // Guard for empty properties state
  if (!properties || properties.length === 0) {
    return (
      <div
        className={`p-6 rounded-xl border mb-6 text-center ${
          isDarkMode ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-white border-gray-200 text-gray-500"
        }`}
      >
        No properties listed yet to analyze.
      </div>
    );
  }

  // 1. Calculate Portfolio metrics
  const totalValue = properties.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
  const avgPrice = Math.round(totalValue / properties.length);
  const totalCount = properties.length;

  // 2. Aggregate Data for Bar Chart: Average Price by State
  const stateMap = {};
  properties.forEach((p) => {
    const stateName = p.state || "Other";
    if (!stateMap[stateName]) {
      stateMap[stateName] = { state: stateName, totalPrice: 0, count: 0 };
    }
    stateMap[stateName].totalPrice += parseFloat(p.price) || 0;
    stateMap[stateName].count += 1;
  });

  const stateData = Object.values(stateMap).map((item) => ({
    state: item.state,
    avgPrice: Math.round(item.totalPrice / item.count),
    count: item.count,
  }));

  // 3. Aggregate Data for Pie Chart: Rent vs Sale Listing Types
  const typeMap = {};
  properties.forEach((p) => {
    // Normalizing type comparison
    const rawType = p.property_type || "Other";
    const typeLabel =
      rawType.toLowerCase().includes("rent") || rawType.toLowerCase().includes("إيجار")
        ? "Rent"
        : "Sale";
    typeMap[typeLabel] = (typeMap[typeLabel] || 0) + 1;
  });

  const typeData = Object.keys(typeMap).map((key) => ({
    name: key,
    value: typeMap[key],
  }));

  // Curated theme colors
  const COLORS = ["#7C3AED", "#10B981", "#F59E0B", "#EF4444"];
  const gridColor = isDarkMode ? "#374151" : "#E5E7EB";
  const labelColor = isDarkMode ? "#9CA3AF" : "#4B5563";

  return (
    <div className="mb-8">
      {/* Micro-Stat Portfolio Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div
          className={`p-6 rounded-xl border shadow-sm transition duration-300 ${
            isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-800"
          }`}
        >
          <div className="text-sm font-medium text-gray-400 mb-1">Total Portfolio Value</div>
          <div className="text-3xl font-extrabold text-violet-600 dark:text-violet-400">
            ${totalValue.toLocaleString()}
          </div>
        </div>

        <div
          className={`p-6 rounded-xl border shadow-sm transition duration-300 ${
            isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-800"
          }`}
        >
          <div className="text-sm font-medium text-gray-400 mb-1">Average Property Price</div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            ${avgPrice.toLocaleString()}
          </div>
        </div>

        <div
          className={`p-6 rounded-xl border shadow-sm transition duration-300 ${
            isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-800"
          }`}
        >
          <div className="text-sm font-medium text-gray-400 mb-1">Active Listings</div>
          <div className="text-3xl font-extrabold text-amber-500 dark:text-amber-400">
            {totalCount}
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* State distribution Bar Chart */}
        <div
          className={`p-6 rounded-xl border shadow-sm ${
            isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-800"
          }`}
        >
          <h4 className="font-bold text-base mb-4">Average Property Price by State ($)</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="state" stroke={labelColor} fontSize={12} />
                <YAxis stroke={labelColor} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
                    borderColor: isDarkMode ? "#374151" : "#E5E7EB",
                    color: isDarkMode ? "#F9FAFB" : "#111827",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="avgPrice" fill="#7C3AED" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Listing types Pie Chart */}
        <div
          className={`p-6 rounded-xl border shadow-sm ${
            isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-800"
          }`}
        >
          <h4 className="font-bold text-base mb-4">Listing Ratio (Rent vs Sale)</h4>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
                    borderColor: isDarkMode ? "#374151" : "#E5E7EB",
                    color: isDarkMode ? "#F9FAFB" : "#111827",
                    borderRadius: "8px",
                  }}
                />
                <Legend layout="horizontal" align="center" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

ListingAnalytics.propTypes = {
  properties: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      property_type: PropTypes.string,
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      state: PropTypes.string,
      address: PropTypes.string,
      is_available: PropTypes.bool,
    })
  ),
};

export default ListingAnalytics;
