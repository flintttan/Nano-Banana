'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchApiKeys, ApiKey } from '@/lib/api';
import ApiKeyManager from '@/components/profile/ApiKeyManager';

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadApiKeys = async () => {
    try {
      setIsLoading(true);
      const keys = await fetchApiKeys();
      setApiKeys(keys);
    } catch (err) {
      console.error('Failed to load API keys:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="p-8 min-h-screen bg-gray-950">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <p className="text-white">加载中...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-8 min-h-screen bg-gray-950">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">API密钥管理</h1>
            <p className="text-gray-400">
              管理您的API密钥，用于在积分用完后继续使用AI绘图服务
            </p>
          </div>

          {/* Info Card */}
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardHeader>
              <CardTitle className="text-blue-400">使用说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• 配置您的API密钥后，当账户积分用完时将自动使用您的API Key</p>
              <p>• 支持OpenAI、Azure OpenAI等兼容的API服务</p>
              <p>• 您可以随时启用或禁用API Key的使用</p>
              <p>• API Key将加密存储，我们不会查看或使用您的密钥</p>
            </CardContent>
          </Card>

          {/* API Key Manager */}
          <ApiKeyManager />

          {/* Usage Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>支持的API服务</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">OpenAI API</h4>
                <p className="text-sm text-muted-foreground">
                  Base URL: https://api.openai.com
                </p>
                <p className="text-xs text-muted-foreground">
                  支持GPT-4、DALL-E等模型
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Azure OpenAI</h4>
                <p className="text-sm text-muted-foreground">
                  Base URL: https://{'{your-resource-name}'}.openai.azure.com
                </p>
                <p className="text-xs text-muted-foreground">
                  企业级OpenAI服务
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">其他兼容服务</h4>
                <p className="text-sm text-muted-foreground">
                  支持任何OpenAI兼容的API服务
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
