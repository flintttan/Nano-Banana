'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { fetchUserInfo, UserInfo } from '@/lib/api';
import CheckInButton from '@/components/profile/CheckInButton';
import UsageStats from '@/components/profile/UsageStats';
import ProfileForm from '@/components/profile/ProfileForm';
import ApiKeyManager from '@/components/profile/ApiKeyManager';

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const loadUserInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const info = await fetchUserInfo();
      setUserInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取用户信息失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserInfo();
  }, []);

  const handleCheckInSuccess = () => {
    loadUserInfo();
  };

  const handleProfileSave = async (data: { username: string; email: string }) => {
    // TODO: Implement profile update API call
    // For now, just simulate the API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Updating profile:', data);
    await loadUserInfo();
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="p-8 min-h-screen bg-gray-950">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <p className="text-white">加载中...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="p-8 min-h-screen bg-gray-950">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <p className="text-red-500">{error}</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!userInfo) {
    return (
      <ProtectedRoute>
        <div className="p-8 min-h-screen bg-gray-950">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <p className="text-white">未找到用户信息</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-8 min-h-screen bg-gray-950">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">
                {userInfo.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-white">{userInfo.username}</h1>
              <p className="text-gray-400">{userInfo.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                注册时间: {new Date(userInfo.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">概览</TabsTrigger>
              <TabsTrigger value="profile">个人资料</TabsTrigger>
              <TabsTrigger value="api-keys">API密钥</TabsTrigger>
              <TabsTrigger value="settings">设置</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <CheckInButton
                  canCheckin={userInfo.can_checkin}
                  onCheckInSuccess={handleCheckInSuccess}
                />
                <Card>
                  <CardHeader>
                    <CardTitle>账户信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">用户ID</span>
                      <span className="text-sm">{userInfo.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">积分余额</span>
                      <span className="text-sm font-bold">{userInfo.drawing_points}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">总创作数</span>
                      <span className="text-sm">{userInfo.creation_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">签到次数</span>
                      <span className="text-sm">{userInfo.checkin_count}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <UsageStats
                drawingPoints={userInfo.drawing_points}
                creationCount={userInfo.creation_count}
                checkinCount={userInfo.checkin_count}
                lastCheckinDate={userInfo.last_checkin_date}
              />
            </TabsContent>

            <TabsContent value="profile" className="space-y-6 mt-6">
              <ProfileForm
                username={userInfo.username}
                email={userInfo.email}
                onSave={handleProfileSave}
              />

              <Card>
                <CardHeader>
                  <CardTitle>密码管理</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    定期更新密码可以提高账户安全性
                  </p>
                  <Button variant="outline">修改密码</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api-keys" className="space-y-6 mt-6">
              <ApiKeyManager />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>账户设置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">通知偏好</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      管理您接收的通知类型
                    </p>
                    <Button variant="outline">管理通知设置</Button>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-2 text-red-500">危险操作</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      这些操作不可恢复，请谨慎操作
                    </p>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        停用账户
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full justify-start"
                        onClick={() => {
                          if (
                            confirm(
                              '确定要删除账户吗？此操作不可恢复，所有数据将永久删除。'
                            )
                          ) {
                            alert('账户删除功能开发中');
                          }
                        }}
                      >
                        删除账户
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}
