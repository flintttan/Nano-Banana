'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { performCheckIn } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';

interface CheckInButtonProps {
  canCheckin: boolean;
  onCheckInSuccess: () => void;
}

export default function CheckInButton({ canCheckin, onCheckInSuccess }: CheckInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    points_earned: number;
    total_points: number;
    checkin_count: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const checkInResult = await performCheckIn();
      setResult(checkInResult);
      onCheckInSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '签到失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-xl font-semibold">每日签到</h3>
          <p className="text-sm text-muted-foreground text-center">
            每日签到可获得10积分，连续签到获得更多奖励
          </p>

          {result && (
            <div className="w-full p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-center text-green-800 dark:text-green-200 font-medium">
                签到成功！获得 {result.points_earned} 积分
              </p>
              <p className="text-center text-green-600 dark:text-green-300 text-sm mt-1">
                当前总积分: {result.total_points} | 连续签到: {result.checkin_count} 次
              </p>
            </div>
          )}

          {error && (
            <div className="w-full p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <p className="text-center text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <Button
            onClick={handleCheckIn}
            disabled={!canCheckin || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? '签到中...' : canCheckin ? '立即签到' : '今日已签到'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
