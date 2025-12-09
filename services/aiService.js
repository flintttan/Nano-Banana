// services/aiService.js [v23 - 终极修复：强制尺寸生效版]

const axios = require('axios');
const FormData = require('form-data');

class AIService {
  constructor() {
    // 系统默认配置
    this.defaultBaseURL = process.env.AI_API_BASE_URL;
    this.defaultApiKey = process.env.AI_API_KEY;
    this.timeout = 600000; // 延长超时时间到10分钟，避免大图生成过早超时
  }

  // 创建axios实例
  createClient(apiKey, baseURL) {
    const finalApiKey = apiKey || this.defaultApiKey;
    const finalBaseURL = baseURL || this.defaultBaseURL;

    return axios.create({
      baseURL: finalBaseURL,
      timeout: this.timeout,
      headers: {
        'Authorization': `Bearer ${finalApiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // 提取尺寸信息
  extractImageSize(imageData) {
    if (imageData.width && imageData.height) return { width: imageData.width, height: imageData.height };
    if (imageData.size && typeof imageData.size === 'string') {
      const match = imageData.size.match(/(\d+)x(\d+)/);
      if (match) return { width: parseInt(match[1]), height: parseInt(match[2]) };
    }
    if (imageData.url) {
      const urlParams = new URL(imageData.url);
      const w = urlParams.searchParams.get('w') || urlParams.searchParams.get('width');
      const h = urlParams.searchParams.get('h') || urlParams.searchParams.get('height');
      if (w && h) return { width: parseInt(w), height: parseInt(h) };
    }
    return null;
  }

  // ✅ 文生图：改为使用 OpenAI /v1/chat/completions 接口规范
  async generateImage(params) {
    const { 
      prompt, 
      model = 'gemini-2.5-flash-image', 
      size,          // 旧参数，仅用于本地记录，不再传给上游
      width,         // 前端宽度，仅用于本地记录
      height,        // 前端高度，仅用于本地记录
      apiKey = null,
      baseUrl = null
    } = params;

    const finalApiKey = apiKey || this.defaultApiKey;
    const finalBaseURL = baseUrl || this.defaultBaseURL;

    // chat/completions 文生图：严格对齐提供的规范，只发送 model + messages
    const requestData = {
      model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            }
          ]
        }
      ]
    };

    console.log('🎨 开始[文生图]:', { model, size, width, height });
    const fullUrl = `${finalBaseURL}/v1/chat/completions`;

    try {
      const response = await axios.post(fullUrl, requestData, {
        headers: {
          'Authorization': `Bearer ${finalApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: this.timeout
      });

      console.log('✅ [文生图] 请求成功');

      const images = this.parseImagesFromChatCompletion(
        response.data,
        width,
        height,
        size
      );

      // 为了兼容之前使用 /v1/images 接口的调用方，这里仍然返回 { data: [{ url, size, ... }] } 结构
      return { success: true, data: { data: images } };
    } catch (error) {
      if (error.response) {
        console.error('❌ [文生图]失败:', error.response.status, this.formatError(error));
      } else if (error.request) {
        console.error('❌ [文生图]失败 - 无响应:', error.code || error.message);
      } else {
        console.error('❌ [文生图]失败 - 请求异常:', error.message);
      }
      return { success: false, error: this.formatError(error) };
    }
  }

  // ✅ 图生图：改为使用 OpenAI /v1/chat/completions 接口规范
  async editImage(params) {
    const { 
      prompt, 
      image, 
      images, 
      model, 
      size, 
      width,         // 仅用于本地记录
      height,        // 仅用于本地记录
      originalName = 'upload.png',
      apiKey = null,
      baseUrl = null
    } = params;

    const finalApiKey = apiKey || this.defaultApiKey;
    const finalBaseURL = baseUrl || this.defaultBaseURL;

    // chat/completions 下，图片通过富文本 content 传递为 base64 data-url
    let finalSize = size;
    if (width && height) {
      finalSize = `${width}x${height}`;
    }

    const imageParts = [];

    // 处理图片：将上传的文件转为 data URL，并以 image_url 形式传递（参考规范）
    if (images && Array.isArray(images) && images.length > 0) {
      images.forEach((file) => {
        const base64 = file.buffer.toString('base64');
        const mime = file.mimetype || 'image/png';
        imageParts.push({
          type: 'image_url',
          image_url: { url: `data:${mime};base64,${base64}` }
        });
      });
    } else if (image) {
      const base64 = image.toString('base64');
      imageParts.push({
        type: 'image_url',
        image_url: { url: `data:image/png;base64,${base64}` }
      });
    }

    const userContent = [
      ...imageParts,
      { type: 'text', text: prompt }
    ];

    // 图生图请求体同样遵循规范：只发送 model + messages
    const requestData = {
      model,
      messages: [
        {
          role: 'user',
          content: userContent
        }
      ]
    };

    if (width && height) {
      console.log(`📐 [图生图] 本地记录尺寸: ${finalSize} (W:${width}, H:${height})`);
    }

    console.log('🎨 开始[图生图]:', {
      model,
      size: finalSize,
      width,
      height,
      imageCount: imageParts.length
    });

    const fullUrl = `${finalBaseURL}/v1/chat/completions`;

    try {
      const response = await axios.post(fullUrl, requestData, {
        headers: {
          'Authorization': `Bearer ${finalApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: this.timeout
      });

      console.log('✅ [图生图] 请求成功');

      const imagesFromChat = this.parseImagesFromChatCompletion(
        response.data,
        width,
        height,
        finalSize
      );

      return { success: true, data: { data: imagesFromChat } };

    } catch (error) {
      if (error.response) {
        console.error('❌ [图生图]失败:', error.response.status, this.formatError(error));
      } else if (error.request) {
        console.error('❌ [图生图]失败 - 无响应:', error.code || error.message);
      } else {
        console.error('❌ [图生图]失败 - 请求异常:', error.message);
      }
      return { success: false, error: this.formatError(error) };
    }
  }

  // 解析 /v1/chat/completions 响应中的图片 URL，并补充尺寸信息
  parseImagesFromChatCompletion(responseData, width, height, size) {
    const images = [];
    if (!responseData || !Array.isArray(responseData.choices)) return images;

    const requestedWidth = width ? parseInt(width) : null;
    const requestedHeight = height ? parseInt(height) : null;
    let requestedSize = size;
    if (!requestedSize && requestedWidth && requestedHeight) {
      requestedSize = `${requestedWidth}x${requestedHeight}`;
    }

    for (const choice of responseData.choices) {
      const message = choice.message || {};
      const content = message.content;

      if (Array.isArray(content)) {
        for (const part of content) {
          // 优先解析 { type: 'image_url', image_url: { url } } 结构
          if (part.type === 'image_url' && part.image_url && part.image_url.url) {
            const item = { url: part.image_url.url };
            this.enrichImageSize(item, requestedWidth, requestedHeight, requestedSize);
            images.push(item);
          } else if (part.type === 'text' && typeof part.text === 'string') {
            const urls = this.extractUrlsFromText(part.text);
            urls.forEach((u) => {
              const item = { url: u };
              this.enrichImageSize(item, requestedWidth, requestedHeight, requestedSize);
              images.push(item);
            });
          }
        }
      } else if (typeof content === 'string') {
        const urls = this.extractUrlsFromText(content);
        urls.forEach((u) => {
          const item = { url: u };
          this.enrichImageSize(item, requestedWidth, requestedHeight, requestedSize);
          images.push(item);
        });
      }
    }

    if (!images.length) {
      throw new Error('未从 AI 响应中解析到图片地址');
    }

    return images;
  }

  // 从文本中提取所有 URL
  extractUrlsFromText(text) {
    if (!text) return [];

    const urls = [];

    // 1) Markdown 图片语法: ![alt](URL)
    const markdownImgRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
    let match;
    while ((match = markdownImgRegex.exec(text)) !== null) {
      if (match[1]) urls.push(match[1]);
    }

    // 2) 明文 http/https 链接
    const httpRegex = /https?:\/\/[^\s"')]+/g;
    const httpMatches = text.match(httpRegex) || [];
    urls.push(...httpMatches);

    // 3) data:image/...;base64,... 形式（即使不在 markdown 中）
    const dataImgRegex = /data:image\/[a-zA-Z0-9.+-]+;base64,[0-9a-zA-Z+/=]+/g;
    const dataMatches = text.match(dataImgRegex) || [];
    urls.push(...dataMatches);

    // 去重
    return Array.from(new Set(urls));
  }

  // 生成用于日志的安全请求体：去掉 / 精简 base64 图片内容
  sanitizePayloadForLog(payload) {
    try {
      const clone = JSON.parse(JSON.stringify(payload));
      this._sanitizeObjectInPlace(clone);
      return clone;
    } catch (e) {
      // 如果克隆失败，就直接返回原始对象（不抛错影响正常逻辑）
      return payload;
    }
  }

  _sanitizeObjectInPlace(obj) {
    if (!obj || typeof obj !== 'object') return;

    if (Array.isArray(obj)) {
      obj.forEach((item) => this._sanitizeObjectInPlace(item));
      return;
    }

    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === 'string') {
        obj[key] = this._sanitizeStringForLog(val);
      } else if (val && typeof val === 'object') {
        this._sanitizeObjectInPlace(val);
      }
    }
  }

  _sanitizeStringForLog(str) {
    if (typeof str !== 'string') return str;

    // 截断 data:image/...;base64, 很长的图片数据，避免日志过大
    if (str.startsWith('data:image') && str.includes('base64,')) {
      const prefix = str.substring(0, str.indexOf('base64,') + 'base64,'.length);
      return `${prefix}[base64_omitted]`;
    }

    return str;
  }

  // 根据 URL 或请求尺寸补充宽高信息
  enrichImageSize(item, requestedWidth, requestedHeight, requestedSize) {
    const sizeInfo = this.extractImageSize(item);
    if (sizeInfo) {
      item.width = sizeInfo.width;
      item.height = sizeInfo.height;
      item.size = `${sizeInfo.width}x${sizeInfo.height}`;
    } else if (requestedWidth && requestedHeight) {
      item.width = requestedWidth;
      item.height = requestedHeight;
      item.size = requestedSize || `${requestedWidth}x${requestedHeight}`;
    }
  }

  // 获取可用模型（优先从环境变量 IMAGE_MODELS 读取）
  async getAvailableModels() {
    const envModels = process.env.IMAGE_MODELS;

    if (envModels) {
      try {
        const parsed = JSON.parse(envModels);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((m) => ({
            id: m.id,
            name: m.name || m.id,
            description: m.description || '',
            icon: m.icon || '✨'
          }));
        }
      } catch (error) {
        console.error('IMAGE_MODELS 环境变量解析失败:', error.message);
      }
    }

    // 回退到内置模型配置，保证服务可用
    const modelData = {
      'gemini-2.5-flash-image': { name: 'Gemini 2.5 Flash Image', description: '默认生图模型（chat.completions）', icon: '🪐' },
      'nano-banana': { name: 'Nano Banana', description: '标准模式，生成速度快，适合日常使用', icon: '🍌' },
      'nano-banana-hd': { name: 'Nano Banana HD', description: '高清模式，增强画质细节', icon: '✨' },
      'nano-banana-2': { name: 'Nano Banana 2.0', description: '最新一代大模型，极致画质 (支持比例选择)', icon: '🚀' },
      'nano-banana-2-2k': { name: 'Nano Banana 2.0 (2K)', description: '2K 模式，超清分辨率绘图', icon: '🔷' },
      'nano-banana-2-4k': { name: 'Nano Banana 2.0 (4K)', description: '4K 模式，极致细节视觉盛宴', icon: '💠' }
    };

    return Object.keys(modelData).map((key) => ({ id: key, ...modelData[key] }));
  }

  formatError(error) {
    if (error.response) { 
      const { status, data } = error.response; 
      if (status === 401) return 'AI服务认证失败，请检查API密钥'; 
      if (status === 429) return 'AI服务请求频率过高'; 
      return data.error?.message || `请求失败 (${status})`; 
    } 
    return error.message || '未知错误';
  }
}

module.exports = new AIService();
