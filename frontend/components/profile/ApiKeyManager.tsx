'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  saveApiKey,
  deleteApiKey,
  toggleApiKeyStatus,
  testApiKey,
  fetchApiKeys,
  ApiKey,
} from '@/lib/api';

export default function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey | null>(null);
  const [formData, setFormData] = useState({
    apiKey: '',
    apiBaseUrl: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const loadApiKeys = async () => {
    try {
      const keys = await fetchApiKeys();
      setApiKeys(keys);
    } catch (err) {
      console.error('Failed to load API keys:', err);
    }
  };

  // Load API keys on component mount
  React.useEffect(() => {
    loadApiKeys();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setMessage(null);
      await saveApiKey(formData.apiKey, formData.apiBaseUrl || undefined);
      setMessage({ type: 'success', text: 'API Key保存成功' });
      setFormData({ apiKey: '', apiBaseUrl: '' });
      setIsEditing(false);
      await loadApiKeys();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : '保存失败',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除API Key吗？此操作不可恢复。')) {
      return;
    }
    try {
      setIsLoading(true);
      await deleteApiKey();
      setMessage({ type: 'success', text: 'API Key已删除' });
      await loadApiKeys();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : '删除失败',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setIsLoading(true);
      await toggleApiKeyStatus(!apiKeys?.is_active);
      setMessage({
        type: 'success',
        text: `API Key已${!apiKeys?.is_active ? '启用' : '禁用'}`,
      });
      await loadApiKeys();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : '状态更新失败',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    try {
      setIsLoading(true);
      await testApiKey(formData.apiKey);
      setMessage({ type: 'success', text: 'API Key格式有效' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : '测试失败',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {apiKeys && !isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>API Key配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">API Key</Label>
              <p className="text-sm font-mono mt-1 p-2 bg-muted rounded">
                {apiKeys.api_key_preview}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium">API Base URL</Label>
              <p className="text-sm mt-1">{apiKeys.api_base_url}</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">状态</Label>
                <p className="text-sm text-muted-foreground">
                  {apiKeys.is_active ? '已启用' : '已禁用'}
                </p>
              </div>
              <Switch checked={apiKeys.is_active} onCheckedChange={handleToggleStatus} />
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>创建时间: {apiKeys.created_at}</p>
              <p>更新时间: {apiKeys.updated_at}</p>
            </div>

            {message && (
              <div
                className={`p-3 rounded-md ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200'
                    : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="flex-1"
              >
                更新API Key
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
                className="flex-1"
              >
                删除
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? '更新API Key' : '配置API Key'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) =>
                    setFormData({ ...formData, apiKey: e.target.value })
                  }
                  placeholder="输入您的API Key"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiBaseUrl">
                  API Base URL <span className="text-muted-foreground">(可选)</span>
                </Label>
                <Input
                  id="apiBaseUrl"
                  value={formData.apiBaseUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, apiBaseUrl: e.target.value })
                  }
                  placeholder="https://api.openai.com"
                />
                <p className="text-xs text-muted-foreground">
                  如不填写，将使用默认地址
                </p>
              </div>

              {message && (
                <div
                  className={`p-3 rounded-md ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200'
                      : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? '保存中...' : '保存'}
                </Button>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({ apiKey: '', apiBaseUrl: '' });
                    }}
                    className="flex-1"
                  >
                    取消
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!apiKeys && !isEditing && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">您还未配置API Key</p>
            <Button onClick={() => setIsEditing(true)}>立即配置</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
