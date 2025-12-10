import { getAuthToken, User } from '@/lib/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api';

export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AuthPayload {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  code: string;
}

export interface SendCodeRequest {
  email: string;
}

async function requestJson<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  // When sending FormData the browser must set the Content-Type header
  const isFormData =
    typeof FormData !== 'undefined' && init.body instanceof FormData;

  const headers: HeadersInit = {
    ...(init.headers || {}),
  };

  if (!isFormData && !('Content-Type' in (headers as Record<string, string>))) {
    // Default to JSON when the caller did not specify a content type
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...init,
    method: init.method ?? 'GET',
    headers,
  });

  const text = await response.text();
  let json: any = {};

  if (text) {
    try {
      json = JSON.parse(text);
    } catch (error) {
      throw new ApiError(
        '服务器返回了无效的 JSON 数据',
        response.status,
        text
      );
    }
  }

  if (!response.ok) {
    const message =
      (json && (json.error || json.message)) ||
      `请求失败，状态码: ${response.status}`;
    throw new ApiError(message, response.status, json);
  }

  return json as T;
}

async function requestApi<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const json = await requestJson<ApiResponse<T>>(path, init);

  if (json.success === false) {
    const message = json.error || json.message || '请求失败';
    throw new ApiError(message, 400, json);
  }

  // Some endpoints may return the payload directly under `data`
  if (typeof json.data !== 'undefined') {
    return json.data;
  }

  // Fallback – treat the whole response as the payload
  return (json as unknown) as T;
}

// ===== Image generation types =====

export interface ImageCreation {
  id: number;
  prompt: string;
  // Some endpoints use `image_url`, others return `url`
  image_url?: string;
  url?: string;
  model?: string | null;
  size?: string | null;
  created_at?: string;
  createdAt?: string;
  folder_path?: string | null;
}

export interface GenerateImageRequest {
  prompt: string;
  model?: string;
  size?: string;
  width?: number;
  height?: number;
  quantity?: number;
}

export interface BatchEditRequest {
  imageIds: number[];
  model: string;
  prompt?: string;
}

export interface BatchEditResult {
  queueId: number;
  imageCount: number;
  model: string;
  perImageCost: number;
  totalCost: number;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  drawing_points: number;
  creation_count: number;
  checkin_count: number;
  last_checkin_date: string | null;
  can_checkin: boolean;
  created_at: string;
}

export interface ApiKey {
  id: number;
  api_key_preview: string;
  api_base_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CheckInResult {
  points_earned: number;
  total_points: number;
  checkin_count: number;
  last_checkin_date: string;
}

export interface BatchQueue {
  id: number;
  batch_name: string;
  status: string;
  total_images: number;
  completed_images: number;
  failed_images: number;
  queue_type?: string;
  folder_path?: string | null;
  created_at?: string;
  completed_at?: string | null;
}

export interface BatchTask {
  id: number;
  status: string;
  original_image_url?: string;
  generated_image_url?: string | null;
  error_message?: string | null;
}

export interface BatchQueueDetail {
  queue: BatchQueue;
  tasks: BatchTask[];
}

/**
 * Login with email and password.
 */
export async function login(request: LoginRequest): Promise<AuthPayload> {
  return requestApi<AuthPayload>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Register a new user with verification code.
 */
export async function register(
  request: RegisterRequest
): Promise<AuthPayload> {
  return requestApi<AuthPayload>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Send verification code to the specified email.
 */
export async function sendVerificationCode(
  request: SendCodeRequest
): Promise<{ message?: string }>
{
  return requestApi<{ message?: string }>('/auth/send-code', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Get the current authenticated user using the stored token.
 */
export async function fetchCurrentUser(): Promise<User> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法获取用户信息', 401);
  }

  const payload = await requestApi<{ user: User }>('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return payload.user;
}

/**
 * Refresh access token using the existing one.
 */
export async function refreshToken(): Promise<AuthPayload> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未找到可刷新的访问令牌', 401);
  }

  return requestApi<AuthPayload>('/auth/refresh', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Fetch detailed user information and statistics.
 */
export async function fetchUserInfo(): Promise<UserInfo> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法获取用户统计信息', 401);
  }

  return requestApi<UserInfo>('/user/info', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Perform daily check-in to earn points.
 */
export async function performCheckIn(): Promise<CheckInResult> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法进行签到', 401);
  }

  return requestApi<CheckInResult>('/user/checkin', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Fetch user's API key configuration.
 */
export async function fetchApiKeys(): Promise<ApiKey | null> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法获取API Key', 401);
  }

  return requestApi<ApiKey | null>('/user/api-keys', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Create or update user's API key.
 */
export async function saveApiKey(
  apiKey: string,
  apiBaseUrl?: string
): Promise<{ message?: string }> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法保存API Key', 401);
  }

  return requestApi<{ message?: string }>('/user/api-keys', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      api_key: apiKey,
      api_base_url: apiBaseUrl,
    }),
  });
}

/**
 * Delete user's API key configuration.
 */
export async function deleteApiKey(): Promise<{ message?: string }> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法删除API Key', 401);
  }

  return requestApi<{ message?: string }>('/user/api-keys', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Toggle API key active status.
 */
export async function toggleApiKeyStatus(
  isActive: boolean
): Promise<{ message?: string }> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法更新API Key状态', 401);
  }

  return requestApi<{ message?: string }>('/user/api-keys/status', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      is_active: isActive,
    }),
  });
}

/**
 * Test API key validity.
 */
export async function testApiKey(
  apiKey: string
): Promise<{ message?: string }> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法测试API Key', 401);
  }

  return requestApi<{ message?: string }>('/user/api-keys/test', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      api_key: apiKey,
    }),
  });
}

/**
 * Generate one or more images from a text prompt.
 */
export async function generateImage(
  request: GenerateImageRequest
): Promise<ImageCreation | ImageCreation[]> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法生成图片', 401);
  }

  return requestApi<ImageCreation | ImageCreation[]>('/image/generate', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });
}

/**
 * Edit an existing image (image-to-image).
 */
export async function editImage(
  payload: Omit<GenerateImageRequest, 'quantity'> & { images: File[] }
): Promise<ImageCreation> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法编辑图片', 401);
  }

  if (!payload.images || payload.images.length === 0) {
    throw new ApiError('请至少选择一张要编辑的图片', 400);
  }

  const formData = new FormData();
  formData.append('prompt', payload.prompt);
  if (payload.model) formData.append('model', payload.model);
  if (typeof payload.width === 'number') {
    formData.append('width', String(payload.width));
  }
  if (typeof payload.height === 'number') {
    formData.append('height', String(payload.height));
  }

  payload.images.forEach((file) => {
    formData.append('image', file);
  });

  return requestApi<ImageCreation>('/image/edit', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
}

/**
 * Create a batch edit task based on existing creations.
 */
export async function batchEditImages(
  request: BatchEditRequest
): Promise<BatchEditResult> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法创建批量编辑任务', 401);
  }

  return requestApi<BatchEditResult>('/image/batch-edit', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });
}

/**
 * Fetch the authenticated user's image generation history.
 */
export async function fetchImageHistory(): Promise<ImageCreation[]> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法获取图片历史记录', 401);
  }

  return requestApi<ImageCreation[]>('/image/history', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Delete an image creation by id.
 */
export async function deleteImage(id: number): Promise<{ message?: string }> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法删除图片', 401);
  }

  return requestApi<{ message?: string }>(`/image/delete/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Get recent batch queues for the current user.
 */
export async function fetchBatchQueues(
  limit: number = 20
): Promise<BatchQueue[]> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法获取批量任务队列', 401);
  }

  const search = new URLSearchParams({ limit: String(limit) }).toString();

  return requestApi<BatchQueue[]>(`/batch/queues?${search}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Get detailed status for a specific batch queue.
 */
export async function fetchBatchQueueStatus(
  queueId: number | string
): Promise<BatchQueueDetail> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法获取队列状态', 401);
  }

  return requestApi<BatchQueueDetail>(`/batch/queue/${queueId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Cancel a running batch queue.
 */
export async function cancelBatchQueue(
  queueId: number | string
): Promise<{ message?: string }> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法取消队列', 401);
  }

  return requestApi<{ message?: string }>(`/batch/queue/${queueId}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ===== Admin Panel types =====

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  drawing_points: number;
  creation_count: number;
  checkin_count: number;
  last_checkin_date: string | null;
  is_active: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  total_creations: number;
  total_checkins: number;
  users_by_date: Array<{
    date: string;
    count: number;
  }>;
}

export interface AdminAnnouncement {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface AdminInspiration {
  id: number;
  title: string;
  prompt: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all users (admin only).
 */
export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法获取用户列表', 401);
  }

  return requestApi<AdminUser[]>('/admin/users', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Update user status (admin only).
 */
export async function updateUserStatus(
  userId: number,
  isActive: boolean
): Promise<{ message?: string }> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法更新用户状态', 401);
  }

  return requestApi<{ message?: string }>(`/admin/users/${userId}/status`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      is_active: isActive,
    }),
  });
}

/**
 * Adjust user points (admin only).
 */
export async function adjustUserPoints(
  userId: number,
  points: number,
  reason?: string
): Promise<{ message?: string }> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法调整用户积分', 401);
  }

  return requestApi<{ message?: string }>('/admin/users/points', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      user_id: userId,
      points,
      reason,
    }),
  });
}

/**
 * Fetch user statistics (admin only).
 */
export async function fetchAdminUserStats(): Promise<AdminUserStats> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法获取用户统计', 401);
  }

  return requestApi<AdminUserStats>('/admin/users/stats', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Fetch announcements (admin only).
 */
export async function fetchAdminAnnouncements(): Promise<AdminAnnouncement[]> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法获取公告列表', 401);
  }

  return requestApi<AdminAnnouncement[]>('/admin/announcements', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Create announcement (admin only).
 */
export async function createAnnouncement(
  title: string,
  content: string
): Promise<{ message?: string }> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法创建公告', 401);
  }

  return requestApi<{ message?: string }>('/admin/announcements', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title,
      content,
    }),
  });
}

/**
 * Delete announcement (admin only).
 */
export async function deleteAnnouncement(
  id: number
): Promise<{ message?: string }> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法删除公告', 401);
  }

  return requestApi<{ message?: string }>(`/admin/announcements/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Fetch inspiration prompts (admin only).
 */
export async function fetchAdminInspirations(): Promise<AdminInspiration[]> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法获取灵感提示列表', 401);
  }

  return requestApi<AdminInspiration[]>('/admin/inspirations', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Create inspiration prompt (admin only).
 */
export async function createInspiration(
  title: string,
  prompt: string
): Promise<{ message?: string }> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法创建灵感提示', 401);
  }

  return requestApi<{ message?: string }>('/admin/inspirations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title,
      prompt,
    }),
  });
}

/**
 * Delete inspiration prompt (admin only).
 */
export async function deleteInspiration(
  id: number
): Promise<{ message?: string }> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('未登录，无法删除灵感提示', 401);
  }

  return requestApi<{ message?: string }>(`/admin/inspirations/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
