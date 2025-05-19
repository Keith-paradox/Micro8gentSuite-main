import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Phone, Clock, CheckCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type TimeRange = "weekly" | "monthly";

interface AnalyticsData {
  name: string;
  calls: number;
}

// Mock data - in a real app, this would come from an API call
const weeklyData: AnalyticsData[] = [
  { name: "Mon", calls: 12 },
  { name: "Tue", calls: 19 },
  { name: "Wed", calls: 15 },
  { name: "Thu", calls: 18 },
  { name: "Fri", calls: 22 },
  { name: "Sat", calls: 8 },
  { name: "Sun", calls: 5 },
];

const monthlyData: AnalyticsData[] = [
  { name: "Week 1", calls: 65 },
  { name: "Week 2", calls: 59 },
  { name: "Week 3", calls: 80 },
  { name: "Week 4", calls: 81 },
];

interface AnalyticsChartProps {
  totalCalls: number;
  avgDuration: string;
  completionRate: string;
}

const AnalyticsChart = ({ 
  totalCalls, 
  avgDuration, 
  completionRate 
}: AnalyticsChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
  
  const data = timeRange === "weekly" ? weeklyData : monthlyData;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Call Analytics</CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant={timeRange === "weekly" ? "default" : "outline"} 
              size="sm"
              onClick={() => setTimeRange("weekly")}
            >
              Weekly
            </Button>
            <Button 
              variant={timeRange === "monthly" ? "default" : "outline"} 
              size="sm"
              onClick={() => setTimeRange("monthly")}
            >
              Monthly
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="calls"
                stroke="#4f46e5"
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Calls</p>
            <div className="flex items-center justify-center mt-1">
              <Phone className="h-4 w-4 mr-1 text-primary" />
              <p className="text-xl font-semibold text-gray-900">{totalCalls}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Avg. Duration</p>
            <div className="flex items-center justify-center mt-1">
              <Clock className="h-4 w-4 mr-1 text-primary" />
              <p className="text-xl font-semibold text-gray-900">{avgDuration}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Completion Rate</p>
            <div className="flex items-center justify-center mt-1">
              <CheckCircle className="h-4 w-4 mr-1 text-primary" />
              <p className="text-xl font-semibold text-gray-900">{completionRate}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsChart;
