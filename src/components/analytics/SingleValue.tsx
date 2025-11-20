// src/components/analytics/SingleValue.tsx

interface SingleValueProps {
  data: {
    value: number;
    label: string;
    trend?: number;
    target?: number;
  };
  options: any;
}

export default function SingleValue({ data, options }: SingleValueProps) {
  const percentageOfTarget = data.target ? (data.value / data.target) * 100 : null;
  
  return (
    <div className="bg-white rounded-lg shadow p-6 text-center">
      <p className="text-gray-600 text-sm mb-2">{data.label}</p>
      <p className="text-5xl font-bold text-gray-900">{data.value.toLocaleString()}</p>
      
      {data.trend !== undefined && (
        <div className={`mt-2 text-sm ${data.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {data.trend >= 0 ? '↑' : '↓'} {Math.abs(data.trend)}%
        </div>
      )}
      
      {percentageOfTarget !== null && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${Math.min(percentageOfTarget, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {percentageOfTarget.toFixed(1)}% of target ({data.target})
          </p>
        </div>
      )}
    </div>
  );
}