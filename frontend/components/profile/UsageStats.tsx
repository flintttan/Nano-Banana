'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart } from '@/components/charts/BarChart';

interface UsageStatsProps {
  drawingPoints: number;
  creationCount: number;
  checkinCount: number;
  lastCheckinDate: string | null;
}

export default function UsageStats({
  drawingPoints,
  creationCount,
  checkinCount,
  lastCheckinDate,
}: UsageStatsProps) {
  // Mock data for charts - in a real app, this would come from an API
  const chartData = [
    { name: '签到次数', value: checkinCount },
    { name: '创作次数', value: creationCount },
    { name: '积分余额', value: drawingPoints / 10 }, // Scale down for visualization
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>积分余额</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-center">
            {drawingPoints}
            <span className="text-lg text-muted-foreground ml-2">积分</span>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-2">
            可用于AI图像生成
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>创作统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">总创作次数</span>
              <span className="text-2xl font-bold">{creationCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">连续签到</span>
              <span className="text-2xl font-bold">{checkinCount}</span>
            </div>
            {lastCheckinDate && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">最后签到</span>
                <span className="text-sm">{lastCheckinDate}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>使用概览</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            data={chartData}
            xKey="name"
            yKey="value"
            height={300}
          />
        </CardContent>
      </Card>
    </div>
  );
}
