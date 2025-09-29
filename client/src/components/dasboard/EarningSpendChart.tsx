import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface ChartData {
  name: string;
  value: number;
}

interface EarningsSpendChartProps {
  earned: number;
  spent: number;
}

const COLORS = ['#38bdf8', '#f472b6']; // Sky Blue for Earned, Pink for Spent

const CustomLegend = (props: any) => {
  const { payload } = props;
  return (
    <div className="flex flex-col justify-center h-full gap-4">
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center gap-3">
          <div style={{ backgroundColor: entry.color }} className="w-3 h-3 rounded-full flex-shrink-0" />
          <div>
            <p className="text-slate-300 text-sm">{entry.value}</p>
            <p className="font-bold text-white text-lg">₹{entry.payload.value.toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
};


const EarningsSpendChart = ({ earned, spent }: EarningsSpendChartProps) => {
  const data: ChartData[] = [
    { name: 'Total Earned', value: earned || 0 },
    { name: 'Total Spent', value: spent || 0 },
  ];

  const hasData = (earned + spent) > 0;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl shadow-lg mb-12">
      <h2 className="text-2xl font-bold text-white mb-6">Financial Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Chart Area */}
        <div className="w-full h-56"> {/* <-- Increased height from h-48 to h-56 */}
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data as any}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend content={<CustomLegend />} layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="w-full h-full flex items-center justify-center">
                <div className="w-40 h-40 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center">
                    <p className="text-slate-500 text-sm">No data yet</p>
                </div>
            </div>
          )}
        </div>

        {/* Stats Area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-green-400 text-sm mb-1">
              <FaArrowUp />
              <span>Total Earned</span>
            </div>
            <p className="text-3xl font-bold text-white">₹{earned.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-pink-400 text-sm mb-1">
              <FaArrowDown />
              <span>Total Spent</span>
            </div>
            <p className="text-3xl font-bold text-white">₹{spent.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsSpendChart;