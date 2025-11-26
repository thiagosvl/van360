import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface GastosPieChartProps {
  chartData: Array<{
    name: string;
    value: number;
    count: number;
  }>;
  colors: string[];
  renderCustomizedLabel: (props: any) => React.ReactNode;
}

export const GastosPieChart = ({
  chartData,
  colors,
  renderCustomizedLabel,
}: GastosPieChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart legendType="none">
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          label={renderCustomizedLabel}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [
            value.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            }),
            "Total",
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

