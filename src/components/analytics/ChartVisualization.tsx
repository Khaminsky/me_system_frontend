// src/components/analytics/ChartVisualization.tsx

import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface ChartVisualizationProps {
  data: any[];
  type: 'column_chart' | 'bar_chart' | 'line_chart' | 'area_chart' | 'pie_chart';
  options: {
    show_legend?: boolean;
    show_values?: boolean;
    colors?: string[];
  };
  onDataClick?: (data: any) => void;
}

export default function ChartVisualization({ data, type, options, onDataClick }: ChartVisualizationProps) {
  const colors = options.colors || ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

  const handleClick = (data: any) => {
    if (onDataClick) {
      onDataClick(data);
    }
  };

  const renderChart = () => {
    switch (type) {
      case 'column_chart':
      case 'bar_chart':
        const ChartComponent = type === 'column_chart' ? BarChart : BarChart;
        return (
          <ChartComponent data={data} layout={type === 'bar_chart' ? 'vertical' : 'horizontal'}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {options.show_legend && <Legend />}
            <Bar
              dataKey="value"
              fill={colors[0]}
              onClick={handleClick}
              cursor={onDataClick ? 'pointer' : 'default'}
            />
          </ChartComponent>
        );

      case 'line_chart':
        return (
          <LineChart data={data} onClick={handleClick}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {options.show_legend && <Legend />}
            <Line
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              cursor={onDataClick ? 'pointer' : 'default'}
            />
          </LineChart>
        );

      case 'area_chart':
        return (
          <AreaChart data={data} onClick={handleClick}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {options.show_legend && <Legend />}
            <Area
              type="monotone"
              dataKey="value"
              fill={colors[0]}
              stroke={colors[0]}
              cursor={onDataClick ? 'pointer' : 'default'}
            />
          </AreaChart>
        );

      case 'pie_chart':
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
              onClick={handleClick}
              cursor={onDataClick ? 'pointer' : 'default'}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            {options.show_legend && <Legend />}
          </PieChart>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      {renderChart()}
    </ResponsiveContainer>
  );
}