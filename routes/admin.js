const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const mailService = require('../services/mailService');
const configService = require('../services/configService');

// ==========================================
// VIP 通道：后台管理 (旗舰UI版)
// ==========================================
router.get('/panel', (req, res) => {
    res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;");
    
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nano Admin | 智能中控台</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['"Plus Jakarta Sans"', 'sans-serif'] },
                    colors: {
                        dark: { 900: '#030712', 800: '#111827', 700: '#1f2937' },
                        primary: { 500: '#6366f1', 600: '#4f46e5' }
                    },
                    animation: { 'blob': 'blob 7s infinite' },
                    keyframes: {
                        blob: {
                            '0%': { transform: 'translate(0px, 0px) scale(1)' },
                            '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                            '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                            '100%': { transform: 'translate(0px, 0px) scale(1)' },
                        }
                    }
                }
            }
        }
    </script>
    <style>
        body { background-color: #030712; color: #f3f4f6; }
        .glass-panel {
            background: rgba(17, 24, 39, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .glass-sidebar {
            background: rgba(3, 7, 18, 0.9);
            backdrop-filter: blur(20px);
            border-right: 1px solid rgba(255, 255, 255, 0.05);
        }
        .input-dark {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            transition: all 0.3s ease;
        }
        .input-dark:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
            outline: none;
        }
        /* 滚动条美化 */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #4b5563; }
        
        .nav-item.active {
            background: linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, transparent 100%);
            border-left: 3px solid #6366f1;
            color: #818cf8;
        }
        .fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body class="h-screen overflow-hidden text-sm selection:bg-indigo-500 selection:text-white">

    <!-- 动态背景光晕 -->
    <div class="fixed inset-0 pointer-events-none z-0">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
        <div class="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div class="absolute -bottom-8 left-1/3 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
    </div>

    <!-- 登录界面 -->
    <div id="loginSection" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="w-full max-w-md glass-panel rounded-2xl shadow-2xl p-8 relative z-10 fade-in">
            <div class="text-center mb-8">
                <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
                    <i class="fas fa-cube text-2xl text-white"></i>
                </div>
                <h1 class="text-2xl font-bold text-white tracking-tight">Nano Admin</h1>
                <p class="text-gray-400 text-xs mt-2 uppercase tracking-widest">超级管理控制台</p>
            </div>
            
            <div class="space-y-5">
                <div>
                    <label class="block text-xs font-medium text-gray-400 mb-1.5 ml-1">管理员账号</label>
                    <div class="relative">
                        <i class="fas fa-envelope absolute left-4 top-3.5 text-gray-500"></i>
                        <input type="email" id="email" value="${process.env.ADMIN_EMAIL || ''}" class="w-full input-dark rounded-xl py-3 pl-10 pr-4">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-400 mb-1.5 ml-1">密码</label>
                    <div class="relative">
                        <i class="fas fa-lock absolute left-4 top-3.5 text-gray-500"></i>
                        <input type="password" id="pwd" class="w-full input-dark rounded-xl py-3 pl-10 pr-4">
                    </div>
                </div>
                <button onclick="doLogin()" class="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95">
                    安全登录
                </button>
            </div>
        </div>
    </div>

    <!-- 主界面 -->
    <div id="mainSection" class="hidden relative z-10 w-full h-full flex">
        
        <!-- 侧边栏 -->
        <aside class="w-72 glass-sidebar flex flex-col h-full flex-shrink-0 transition-all duration-300">
            <div class="h-20 flex items-center px-8 border-b border-white/5">
                <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/40">
                    <i class="fas fa-bolt text-white text-sm"></i>
                </div>
                <div>
                    <h1 class="font-bold text-lg text-white leading-none">Nano</h1>
                    <span class="text-[10px] text-gray-400 tracking-wider">CONSOLE</span>
                </div>
            </div>

            <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
                <div class="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 mb-2 mt-4">数据管理</div>
                
                <button onclick="switchTab('users')" id="btn-users" class="nav-item w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
                    <span class="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors"><i class="fas fa-users"></i></span>
                    <span class="font-medium">用户管理</span>
                </button>

                <button onclick="switchTab('inspirations')" id="btn-inspirations" class="nav-item w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
                    <span class="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors"><i class="fas fa-images"></i></span>
                    <span class="font-medium">灵感图库</span>
                </button>

                <div class="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 mb-2 mt-6">运营工具</div>

                <button onclick="switchTab('notices')" id="btn-notices" class="nav-item w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
                    <span class="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-orange-500/20 group-hover:text-orange-400 transition-colors"><i class="fas fa-bullhorn"></i></span>
                    <span class="font-medium">系统公告</span>
                </button>

                <button onclick="switchTab('settings')" id="btn-settings" class="nav-item w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
                    <span class="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors"><i class="fas fa-cog"></i></span>
                    <span class="font-medium">系统设置</span>
                </button>

                <div class="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 mb-2 mt-6">批量功能</div>

                <button onclick="switchTab('batch-config')" id="btn-batch-config" class="nav-item w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
                    <span class="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors"><i class="fas fa-cogs"></i></span>
                    <span class="font-medium">批量配置</span>
                </button>

                <button onclick="switchTab('batch-monitor')" id="btn-batch-monitor" class="nav-item w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
                    <span class="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-teal-500/20 group-hover:text-teal-400 transition-colors"><i class="fas fa-tasks"></i></span>
                    <span class="font-medium">任务监控</span>
                </button>
            </nav>

            <div class="p-4 border-t border-white/5">
                <button onclick="location.reload()" class="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-xs font-bold">
                    <i class="fas fa-sign-out-alt"></i> 退出系统
                </button>
            </div>
        </aside>

        <!-- 内容区域 -->
        <main class="flex-1 flex flex-col min-w-0 bg-transparent relative overflow-hidden">
            <!-- 顶部栏 -->
            <header class="h-20 flex items-center justify-between px-8 border-b border-white/5 glass-panel z-20">
                <div class="flex flex-col">
                    <h2 id="pageTitle" class="text-xl font-bold text-white">仪表盘</h2>
                    <p class="text-xs text-gray-400 mt-0.5">欢迎回来，管理员</p>
                </div>
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                        <span class="relative flex h-2 w-2">
                          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span class="text-xs text-green-400 font-medium">System Online</span>
                    </div>
                    <div class="w-10 h-10 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center border border-white/10 shadow-lg">
                        <i class="fas fa-user-shield text-gray-300"></i>
                    </div>
                </div>
            </header>

            <!-- 核心内容区 -->
            <div class="flex-1 overflow-y-auto p-8 scrollbar-thin">
                
                <!-- 1. 用户管理 -->
                <div id="users" class="section active fade-in space-y-6">
                    <div class="glass-panel rounded-2xl overflow-hidden shadow-2xl">
                        <div class="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <h3 class="font-bold text-white flex items-center gap-2"><i class="fas fa-table text-indigo-400"></i> 用户列表</h3>
                            <button onclick="loadUsers()" class="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors shadow-lg shadow-indigo-500/20"><i class="fas fa-sync-alt mr-1"></i> 刷新数据</button>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left" id="userTable">
                                <thead class="bg-gray-900/50 text-gray-400 uppercase text-xs font-semibold">
                                    <tr>
                                        <th class="px-6 py-4">用户 ID</th>
                                        <th class="px-6 py-4">账户信息</th>
                                        <th class="px-6 py-4">剩余积分</th>
                                        <th class="px-6 py-4 text-right">资产管理</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-white/5 text-gray-300 text-sm"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- 2. 灵感管理 -->
                <div id="inspirations" class="section hidden fade-in space-y-8">
                    <!-- 发布卡片 -->
                    <div class="glass-panel rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
                        <div class="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-purple-600/20 transition-all"></div>
                        
                        <div class="relative z-10">
                            <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <span class="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400"><i class="fas fa-magic"></i></span>
                                发布新灵感
                            </h3>
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div class="space-y-2">
                                    <label class="text-xs font-bold text-gray-400 ml-1">图片链接 (URL)</label>
                                    <input id="insUrl" placeholder="https://..." class="w-full input-dark rounded-xl px-4 py-3">
                                </div>
                                <div class="space-y-2">
                                    <label class="text-xs font-bold text-gray-400 ml-1">提示词 (Prompt)</label>
                                    <textarea id="insPrompt" rows="1" placeholder="画面描述..." class="w-full input-dark rounded-xl px-4 py-3 h-[48px] resize-none"></textarea>
                                </div>
                            </div>
                            <div class="mt-6 flex justify-end">
                                <button onclick="addInspiration()" class="px-8 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-900/30 flex items-center gap-2 transition-all">
                                    <i class="fas fa-cloud-upload-alt"></i> 立即发布
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 列表 -->
                    <div>
                        <div class="flex justify-between items-end mb-4 px-1">
                            <h3 class="text-lg font-bold text-white flex items-center gap-2"><i class="fas fa-layer-group text-gray-500"></i> 已发布内容</h3>
                            <button onclick="loadInspirations()" class="text-xs text-gray-400 hover:text-white"><i class="fas fa-sync-alt"></i> 刷新</button>
                        </div>
                        <div id="insList" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"></div>
                    </div>
                </div>

                <!-- 3. 系统公告 -->
                <div id="notices" class="section hidden fade-in space-y-8">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <!-- 左侧发布 -->
                        <div class="lg:col-span-1 glass-panel rounded-2xl p-6 shadow-xl h-fit">
                            <h3 class="font-bold text-white mb-6 flex items-center gap-2">
                                <i class="fas fa-pen-nib text-orange-500"></i> 撰写公告
                            </h3>
                            <textarea id="noticeContent" placeholder="在此输入公告内容..." class="w-full input-dark rounded-xl p-4 h-48 resize-none mb-4 text-sm"></textarea>
                            <div class="flex items-center justify-between mb-6">
                                <label class="flex items-center gap-2 cursor-pointer group">
                                    <div class="relative">
                                        <input type="checkbox" id="isImportant" class="peer sr-only">
                                        <div class="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                                    </div>
                                    <span class="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">高亮通知</span>
                                </label>
                            </div>
                            <button onclick="addNotice()" class="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-900/20 transition-all">
                                发布公告
                            </button>
                        </div>

                        <!-- 右侧列表 -->
                        <div class="lg:col-span-2 glass-panel rounded-2xl overflow-hidden shadow-xl flex flex-col h-[600px]">
                            <div class="px-6 py-4 border-b border-white/5 bg-white/5 flex justify-between items-center flex-shrink-0">
                                <h3 class="font-bold text-white">历史公告</h3>
                                <button onclick="loadNotices()" class="text-xs text-gray-400 hover:text-white"><i class="fas fa-sync-alt"></i></button>
                            </div>
                            <div class="overflow-y-auto flex-1 p-0">
                                <table class="w-full text-left" id="noticeTable">
                                    <tbody class="divide-y divide-white/5 text-gray-300 text-sm"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 4. 系统设置 -->
                <div id="settings" class="section hidden fade-in space-y-8">
                    <!-- Mail Settings -->
                    <div class="glass-panel rounded-2xl p-8 shadow-2xl">
                        <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <span class="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-400"><i class="fas fa-envelope"></i></span>
                            邮件配置
                        </h3>
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div class="space-y-2">
                                <label class="text-xs font-bold text-gray-400 ml-1">SMTP 服务器</label>
                                <input id="mailHost" placeholder="smtp.example.com" class="w-full input-dark rounded-xl px-4 py-3">
                            </div>
                            <div class="space-y-2">
                                <label class="text-xs font-bold text-gray-400 ml-1">SMTP 端口</label>
                                <input id="mailPort" type="number" placeholder="465" class="w-full input-dark rounded-xl px-4 py-3">
                            </div>
                            <div class="space-y-2">
                                <label class="text-xs font-bold text-gray-400 ml-1">发件邮箱</label>
                                <input id="mailUser" placeholder="noreply@example.com" class="w-full input-dark rounded-xl px-4 py-3">
                            </div>
                            <div class="space-y-2">
                                <label class="text-xs font-bold text-gray-400 ml-1">邮箱授权码</label>
                                <input id="mailPass" type="password" placeholder="授权码" class="w-full input-dark rounded-xl px-4 py-3">
                            </div>
                            <div class="space-y-2">
                                <label class="text-xs font-bold text-gray-400 ml-1">发件人显示</label>
                                <input id="mailFrom" placeholder="Nano Banana <noreply@example.com>" class="w-full input-dark rounded-xl px-4 py-3">
                            </div>
                            <div class="space-y-2">
                                <label class="text-xs font-bold text-gray-400 ml-1">品牌名称</label>
                                <input id="mailBrandName" placeholder="Nano Banana" class="w-full input-dark rounded-xl px-4 py-3">
                            </div>
                        </div>
                        <div class="mt-6 flex justify-end">
                            <button onclick="updateMailSettings()" class="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg transition-all">
                                <i class="fas fa-save mr-2"></i> 保存邮件配置
                            </button>
                        </div>
                    </div>

                    <!-- AI Settings -->
                    <div class="glass-panel rounded-2xl p-8 shadow-2xl">
                        <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <span class="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400"><i class="fas fa-brain"></i></span>
                            AI 接入与模型管理
                        </h3>
                        <div class="grid grid-cols-1 gap-6">
                            <div class="space-y-2">
                                <label class="text-xs font-bold text-gray-400 ml-1">API 基础地址</label>
                                <input id="aiApiBaseUrl" placeholder="https://api.example.com" class="w-full input-dark rounded-xl px-4 py-3">
                            </div>
                            <div class="space-y-2">
                                <label class="text-xs font-bold text-gray-400 ml-1">API 密钥</label>
                                <input id="aiApiKey" type="password" placeholder="sk-..." class="w-full input-dark rounded-xl px-4 py-3">
                            </div>
                            <div class="space-y-2">
                                <label class="text-xs font-bold text-gray-400 ml-1">API 并发数 (1-50)</label>
                                <input id="aiApiConcurrency" type="number" min="1" max="50" placeholder="5" class="w-full input-dark rounded-xl px-4 py-3">
                                <p class="text-xs text-gray-500 mt-1">控制同时向第三方API发送的请求数量</p>
                            </div>
                            <div class="space-y-2">
                                <label class="text-xs font-bold text-gray-400 ml-1">模型管理</label>
                                <p class="text-xs text-gray-500 mt-1">使用开关控制前台可用的模型，修改后 60 秒内前台模型列表会自动刷新。</p>
                                <div id="modelManagerContainer" class="mt-2 space-y-2">
                                    <div class="text-xs text-gray-500">正在加载模型列表...</div>
                                </div>
                            </div>
                        </div>
                        <div class="mt-6 flex justify-end">
                            <button onclick="updateAISettings()" class="px-8 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold shadow-lg transition-all">
                                <i class="fas fa-save mr-2"></i> 保存 AI 接入配置
                            </button>
                        </div>
                    </div>

                    <!-- System Settings -->
                    <div class="glass-panel rounded-2xl p-8 shadow-2xl">
                        <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <span class="w-8 h-8 rounded bg-green-500/20 flex items-center justify-center text-green-400"><i class="fas fa-server"></i></span>
                            系统配置
                        </h3>
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div class="space-y-2">
                                <label class="text-xs font-bold text-gray-400 ml-1">站点名称</label>
                                <input id="systemSiteName" placeholder="Nano Banana" class="w-full input-dark rounded-xl px-4 py-3">
                            </div>
                            <div class="space-y-2">
                                <label class="text-xs font-bold text-gray-400 ml-1">前端地址</label>
                                <input id="systemFrontendUrl" placeholder="https://example.com" class="w-full input-dark rounded-xl px-4 py-3">
                            </div>
                            <div class="space-y-2">
                                <label class="text-xs font-bold text-gray-400 ml-1">批量并发数 (1-10)</label>
                                <input id="systemBatchConcurrency" type="number" min="1" max="10" placeholder="3" class="w-full input-dark rounded-xl px-4 py-3">
                            </div>
                        </div>
                        <div class="mt-6 flex justify-end">
                            <button onclick="updateSystemSettings()" class="px-8 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-bold shadow-lg transition-all">
                                <i class="fas fa-save mr-2"></i> 保存系统配置
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 5. 批量配置 -->
                <div id="batch-config" class="section hidden fade-in space-y-8">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- 并发数配置 -->
                        <div class="glass-panel rounded-2xl p-8 shadow-2xl">
                            <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <i class="fas fa-tachometer-alt text-cyan-500"></i> 并发数配置
                            </h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="text-xs font-bold text-gray-400 ml-1">全局并发数 (1-10)</label>
                                    <input id="concurrencyInput" type="number" min="1" max="10" value="3" class="w-full input-dark rounded-xl px-4 py-3 mt-2">
                                    <p class="text-xs text-gray-500 mt-2">控制同时处理的图片生成任务数量</p>
                                </div>
                                <button onclick="updateConcurrency()" class="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-lg transition-all">
                                    <i class="fas fa-save mr-2"></i> 保存配置
                                </button>
                            </div>
                        </div>

                        <!-- 预设提示词管理 -->
                        <div class="glass-panel rounded-2xl p-8 shadow-2xl">
                            <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <i class="fas fa-magic text-purple-500"></i> 添加预设提示词
                            </h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="text-xs font-bold text-gray-400 ml-1">标题</label>
                                    <input id="presetTitle" placeholder="例如：高清增强" class="w-full input-dark rounded-xl px-4 py-3 mt-2">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-gray-400 ml-1">内容</label>
                                    <textarea id="presetContent" rows="3" placeholder="提示词内容..." class="w-full input-dark rounded-xl px-4 py-3 mt-2 resize-none"></textarea>
                                </div>
                                <button onclick="addPreset()" class="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg transition-all">
                                    <i class="fas fa-plus mr-2"></i> 添加预设
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 预设列表 -->
                    <div class="glass-panel rounded-2xl overflow-hidden shadow-xl">
                        <div class="px-6 py-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                            <h3 class="font-bold text-white">预设提示词列表</h3>
                            <button onclick="loadPresets()" class="text-xs text-gray-400 hover:text-white"><i class="fas fa-sync-alt"></i></button>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left" id="presetTable">
                                <thead class="bg-gray-900/50 text-gray-400 uppercase text-xs font-semibold">
                                    <tr>
                                        <th class="px-6 py-4">ID</th>
                                        <th class="px-6 py-4">标题</th>
                                        <th class="px-6 py-4">内容</th>
                                        <th class="px-6 py-4">分类</th>
                                        <th class="px-6 py-4 text-right">操作</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-white/5 text-gray-300 text-sm"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- 5. 任务监控 -->
                <div id="batch-monitor" class="section hidden fade-in space-y-8">
                    <!-- 统计卡片 -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div class="glass-panel rounded-xl p-6">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs text-gray-400">总队列数</span>
                                <i class="fas fa-layer-group text-blue-500"></i>
                            </div>
                            <div id="stat-total" class="text-2xl font-bold text-white">0</div>
                        </div>
                        <div class="glass-panel rounded-xl p-6">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs text-gray-400">处理中</span>
                                <i class="fas fa-spinner text-yellow-500"></i>
                            </div>
                            <div id="stat-processing" class="text-2xl font-bold text-yellow-500">0</div>
                        </div>
                        <div class="glass-panel rounded-xl p-6">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs text-gray-400">已完成</span>
                                <i class="fas fa-check-circle text-green-500"></i>
                            </div>
                            <div id="stat-completed" class="text-2xl font-bold text-green-500">0</div>
                        </div>
                        <div class="glass-panel rounded-xl p-6">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs text-gray-400">总图片数</span>
                                <i class="fas fa-images text-purple-500"></i>
                            </div>
                            <div id="stat-images" class="text-2xl font-bold text-purple-500">0</div>
                        </div>
                    </div>

                    <!-- 队列列表 -->
                    <div class="glass-panel rounded-2xl overflow-hidden shadow-xl">
                        <div class="px-6 py-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                            <h3 class="font-bold text-white">批量任务队列</h3>
                            <button onclick="loadBatchQueues()" class="text-xs text-gray-400 hover:text-white"><i class="fas fa-sync-alt"></i></button>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left" id="batchQueueTable">
                                <thead class="bg-gray-900/50 text-gray-400 uppercase text-xs font-semibold">
                                    <tr>
                                        <th class="px-6 py-4">队列ID</th>
                                        <th class="px-6 py-4">用户</th>
                                        <th class="px-6 py-4">批次名称</th>
                                        <th class="px-6 py-4">进度</th>
                                        <th class="px-6 py-4">状态</th>
                                        <th class="px-6 py-4">创建时间</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-white/5 text-gray-300 text-sm"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    </div>

    <!-- JS 逻辑部分 (MySQL适配版) -->
    <script>
        let TOKEN = '';

        async function doLogin() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('pwd').value;
            const btn = event.target;
            const originalText = btn.innerText;
            
            btn.innerText = '验证中...';
            btn.disabled = true;

            try {
                const res = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email, password}) });
                const d = await res.json();
                if(d.success && d.data.user.role === 'admin') {
                    TOKEN = d.data.token;
                    
                    // 转场动画
                    const login = document.getElementById('loginSection');
                    login.style.opacity = '0';
                    login.style.transition = 'opacity 0.5s';
                    setTimeout(() => {
                        login.style.display='none';
                        document.getElementById('mainSection').classList.remove('hidden');
                        loadUsers();
                    }, 500);
                } else { 
                    alert('账号或密码错误'); 
                    btn.innerText = originalText;
                    btn.disabled = false;
                }
            } catch(e) { 
                alert('连接服务器失败'); 
                btn.innerText = originalText;
                btn.disabled = false;
            }
        }

        function switchTab(name) {
            document.querySelectorAll('.section').forEach(el => {
                el.classList.add('hidden');
                el.classList.remove('fade-in');
            });
            const target = document.getElementById(name);
            target.classList.remove('hidden');
            void target.offsetWidth; // trigger reflow
            target.classList.add('fade-in');

            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            document.getElementById('btn-' + name).classList.add('active');

            const titles = {
                'users': '用户管理',
                'inspirations': '灵感创意库',
                'notices': '系统公告中心',
                'settings': '系统设置',
                'batch-config': '批量图生图配置',
                'batch-monitor': '批量任务监控'
            };
            document.getElementById('pageTitle').innerText = titles[name];

            if(name === 'users') loadUsers();
            if(name === 'inspirations') loadInspirations();
            if(name === 'notices') loadNotices();
            if(name === 'settings') loadSettings();
            if(name === 'batch-config') { loadConcurrency(); loadPresets(); }
            if(name === 'batch-monitor') { loadBatchStats(); loadBatchQueues(); }
        }

        // --- 1. 用户逻辑 (MySQL) ---
        async function loadUsers() {
            const res = await fetch('/api/admin/users', { headers:{'Authorization':'Bearer '+TOKEN} });
            const d = await res.json();
            const tbody = document.querySelector('#userTable tbody');
            if(d.data.length === 0) { tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-gray-500">暂无用户</td></tr>'; return; }
            
            tbody.innerHTML = d.data.map(u => \`
                <tr class="hover:bg-white/5 transition-colors group">
                    <td class="px-6 py-4 font-mono text-gray-500 text-xs">\${u.id}</td>
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow">
                                \${u.username.substring(0,1).toUpperCase()}
                            </div>
                            <div>
                                <div class="font-bold text-white">\${u.username}</div>
                                <div class="text-xs text-gray-500">\${u.email}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                            \${u.drawing_points} pts
                        </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="changePoints(\${u.id})" class="text-gray-400 hover:text-white text-xs border border-gray-600 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-all hover:shadow">
                            <i class="fas fa-coins mr-1"></i> 管理
                        </button>
                    </td>
                </tr>
            \`).join('');
        }
        async function changePoints(id) {
            const p = prompt('请输入变动积分数 (正数充值，负数扣除):');
            if(p && !isNaN(p)) { await fetch('/api/admin/users/points', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+TOKEN}, body:JSON.stringify({userId:id, points:parseInt(p)}) }); loadUsers(); }
        }

        // --- 2. 灵感逻辑 (MySQL) ---
        async function loadInspirations() {
            const res = await fetch('/api/admin/inspirations', { headers:{'Authorization':'Bearer '+TOKEN} });
            const d = await res.json();
            const list = document.getElementById('insList');
            if(d.data.length === 0) list.innerHTML = '<div class="col-span-full text-center py-10 text-gray-500">暂无灵感数据</div>';
            else {
                list.innerHTML = d.data.map(i => \`
                    <div class="group relative glass-panel rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-300">
                        <div class="aspect-square relative overflow-hidden bg-gray-900">
                            <img src="\${i.url}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 backdrop-blur-sm">
                                <button onclick="delIns(\${i.id})" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all">
                                    <i class="fas fa-trash-alt mr-1"></i> 删除
                                </button>
                            </div>
                        </div>
                        <div class="p-3 border-t border-white/5 bg-white/5">
                            <p class="text-[10px] text-gray-400 mb-1">ID: \${i.id}</p>
                            <p class="text-xs text-gray-200 line-clamp-2 leading-relaxed" title="\${i.prompt}">\${i.prompt || '<span class="italic text-gray-600">No Prompt</span>'}</p>
                        </div>
                    </div>
                \`).join('');
            }
        }
        async function addInspiration() {
            const url = document.getElementById('insUrl').value.trim();
            const prompt = document.getElementById('insPrompt').value.trim();
            if(!url) return alert('图片链接不能为空');
            const res = await fetch('/api/admin/inspirations', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+TOKEN}, body:JSON.stringify({url, prompt}) });
            if(res.ok) { document.getElementById('insUrl').value=''; document.getElementById('insPrompt').value=''; loadInspirations(); }
        }
        async function delIns(id) { if(confirm('确定删除此灵感？')) { await fetch('/api/admin/inspirations/'+id, { method:'DELETE', headers:{'Authorization':'Bearer '+TOKEN} }); loadInspirations(); } }

        // --- 3. 公告逻辑 (MySQL) ---
        async function loadNotices() {
            const res = await fetch('/api/admin/announcements', { headers:{'Authorization':'Bearer '+TOKEN} });
            const d = await res.json();
            const tbody = document.querySelector('#noticeTable tbody');
            if(d.data.length === 0) { tbody.innerHTML = '<tr><td colspan="3" class="text-center py-10 text-gray-500">暂无公告</td></tr>'; return; }

            tbody.innerHTML = d.data.map(n => \`
                <tr class="hover:bg-white/5 transition-colors group">
                    <td class="px-6 py-4 align-top">
                        <div class="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed \${n.is_important?'text-orange-300 font-medium':''} ">\${n.is_important ? '<i class="fas fa-fire text-orange-500 mr-2"></i>' : ''}\${n.content}</div>
                    </td>
                    <td class="px-6 py-4 text-gray-500 text-xs whitespace-nowrap align-top font-mono">
                        \${new Date(n.created_at).toLocaleString()}
                    </td>
                    <td class="px-6 py-4 text-right align-top">
                        <button onclick="delNotice(\${n.id})" class="text-gray-600 hover:text-red-400 transition-colors w-8 h-8 rounded flex items-center justify-center ml-auto">
                            <i class="fas fa-times"></i>
                        </button>
                    </td>
                </tr>
            \`).join('');
        }
        async function addNotice() {
            const content = document.getElementById('noticeContent').value.trim();
            const isImportant = document.getElementById('isImportant').checked;
            if(!content) return alert('请输入内容');
            const res = await fetch('/api/admin/announcements', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+TOKEN}, body: JSON.stringify({ content, isImportant }) });
            if(res.ok) { document.getElementById('noticeContent').value=''; loadNotices(); }
        }
        async function delNotice(id) { if(confirm('删除此公告？')) { await fetch('/api/admin/announcements/'+id, { method:'DELETE', headers:{'Authorization':'Bearer '+TOKEN} }); loadNotices(); } }

        // --- 4. 系统设置逻辑 ---
        async function loadSettings() {
            try {
                const res = await fetch('/api/admin/settings', { headers:{'Authorization':'Bearer '+TOKEN} });
                const d = await res.json();
                if(d.success) {
                    const settings = d.data;

                    // Load Mail settings
                    if(settings.mail) {
                        document.getElementById('mailHost').value = settings.mail.host || '';
                        document.getElementById('mailPort').value = settings.mail.port || '';
                        document.getElementById('mailUser').value = settings.mail.user || '';
                        document.getElementById('mailPass').value = settings.mail.pass || '';
                        document.getElementById('mailFrom').value = settings.mail.from || '';
                        document.getElementById('mailBrandName').value = settings.mail.brand_name || '';
                    }

                    // Load AI settings
                    if(settings.ai) {
                        document.getElementById('aiApiBaseUrl').value = settings.ai.api_base_url || '';
                        document.getElementById('aiApiKey').value = settings.ai.api_key || '';
                    }

                    // Load API concurrency
                    try {
                        const concurrencyRes = await fetch('/api/admin/config/api-concurrency', { headers:{'Authorization':'Bearer '+TOKEN} });
                        const concurrencyData = await concurrencyRes.json();
                        if(concurrencyData.success) {
                            document.getElementById('aiApiConcurrency').value = concurrencyData.data.concurrency || '5';
                        }
                    } catch(e) {
                        console.error('加载API并发数失败:', e);
                    }

                    // Load System settings
                    if(settings.system) {
                        document.getElementById('systemSiteName').value = settings.system.site_name || '';
                        document.getElementById('systemFrontendUrl').value = settings.system.frontend_url || '';
                        document.getElementById('systemBatchConcurrency').value = settings.system.batch_concurrency || '3';
                    }

                    // Load model management list
                    try {
                        await loadModelManagement();
                    } catch(e) {
                        console.error('加载模型管理列表失败:', e);
                    }
                }
            } catch(e) {
                console.error('加载设置失败:', e);
                alert('加载设置失败: ' + e.message);
            }
        }

        async function updateMailSettings() {
            const btn = event.target;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> 保存中...';
            btn.disabled = true;

            try {
                const data = {
                    host: document.getElementById('mailHost').value.trim(),
                    port: parseInt(document.getElementById('mailPort').value),
                    user: document.getElementById('mailUser').value.trim(),
                    pass: document.getElementById('mailPass').value.trim(),
                    from: document.getElementById('mailFrom').value.trim(),
                    brand_name: document.getElementById('mailBrandName').value.trim()
                };

                const res = await fetch('/api/admin/settings/mail', {
                    method:'POST',
                    headers:{'Content-Type':'application/json','Authorization':'Bearer '+TOKEN},
                    body: JSON.stringify(data)
                });

                if(res.ok) {
                    alert('邮件配置已更新');
                } else {
                    const error = await res.json();
                    alert('更新失败: ' + (error.error || '未知错误'));
                }
            } catch(e) {
                alert('更新失败: ' + e.message);
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }

        async function updateAISettings() {
            const btn = event.target;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> 保存中...';
            btn.disabled = true;

            try {
                const data = {
                    api_base_url: document.getElementById('aiApiBaseUrl').value.trim(),
                    api_key: document.getElementById('aiApiKey').value.trim()
                };

                const res = await fetch('/api/admin/settings/ai', {
                    method:'POST',
                    headers:{'Content-Type':'application/json','Authorization':'Bearer '+TOKEN},
                    body: JSON.stringify(data)
                });

                if(res.ok) {
                    // Update API concurrency separately
                    const apiConcurrency = parseInt(document.getElementById('aiApiConcurrency').value);
                    if(apiConcurrency && apiConcurrency >= 1 && apiConcurrency <= 50) {
                        try {
                            const concurrencyRes = await fetch('/api/admin/config/api-concurrency', {
                                method:'POST',
                                headers:{'Content-Type':'application/json','Authorization':'Bearer '+TOKEN},
                                body: JSON.stringify({ concurrency: apiConcurrency })
                            });
                            if(concurrencyRes.ok) {
                                alert('AI 接入配置和API并发数已更新');
                            } else {
                                alert('AI 接入配置已更新，但API并发数更新失败');
                            }
                        } catch(e) {
                            alert('AI 接入配置已更新，但API并发数更新失败: ' + e.message);
                        }
                    } else {
                        alert('AI 接入配置已更新');
                    }
                } else {
                    const error = await res.json();
                    alert('更新失败: ' + (error.error || '未知错误'));
                }
            } catch(e) {
                alert('更新失败: ' + e.message);
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }

        async function loadModelManagement() {
            const container = document.getElementById('modelManagerContainer');
            if (!container) return;

            container.innerHTML = '<div class="text-xs text-gray-500">正在加载模型列表...</div>';

            try {
                const res = await fetch('/api/admin/models', { headers:{'Authorization':'Bearer '+TOKEN} });
                const d = await res.json();

                if (!d.success) {
                    throw new Error(d.error || '加载模型列表失败');
                }

                const models = Array.isArray(d.data) ? d.data : [];

                if (models.length === 0) {
                    container.innerHTML = '<div class="text-xs text-gray-500">暂无可管理的模型，请联系开发者初始化数据库。</div>';
                    return;
                }

                container.innerHTML = models.map(m => \`
                    <div class="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-xl">
                                <span>\${m.icon || '✨'}</span>
                            </div>
                            <div>
                                <div class="text-sm font-medium text-white">\${m.name || m.model_key}</div>
                                <div class="text-xs text-gray-400 mt-0.5">\${m.description || '暂无描述'}</div>
                                <div class="text-[10px] text-gray-500 mt-1">
                                    模型ID: <span class="font-mono">\${m.model_key}</span>
                                    · 积分消耗: <span class="font-semibold text-orange-400">\${m.credit_cost || m.creditCost || 1}</span>
                                </div>
                            </div>
                        </div>
                        <button onclick="toggleModelEnabled(\${m.id}, \${m.is_enabled === 1})"
                                class="relative inline-flex items-center h-6 w-11 rounded-full border transition-colors \${m.is_enabled === 1 ? 'bg-green-500/80 border-green-400' : 'bg-gray-700 border-gray-500'}">
                            <span class="sr-only">切换启用状态</span>
                            <span class="inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform \${m.is_enabled === 1 ? 'translate-x-5' : 'translate-x-0'}"></span>
                        </button>
                    </div>
                \`).join('');
            } catch(e) {
                console.error('加载模型管理列表失败:', e);
                container.innerHTML = '<div class="text-xs text-red-400">加载模型列表失败：' + e.message + '</div>';
            }
        }

        async function toggleModelEnabled(id, currentEnabled) {
            try {
                const res = await fetch('/api/admin/models/' + id + '/toggle', {
                    method:'POST',
                    headers:{'Content-Type':'application/json','Authorization':'Bearer '+TOKEN},
                    body: JSON.stringify({ is_enabled: !currentEnabled })
                });
                const d = await res.json();
                if(!res.ok || !d.success) {
                    alert('更新模型状态失败: ' + (d.error || '未知错误'));
                    return;
                }
                await loadModelManagement();
            } catch(e) {
                alert('更新模型状态失败: ' + e.message);
            }
        }

        async function updateSystemSettings() {
            const btn = event.target;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> 保存中...';
            btn.disabled = true;

            try {
                const concurrency = parseInt(document.getElementById('systemBatchConcurrency').value);
                if(concurrency && (concurrency < 1 || concurrency > 10)) {
                    alert('批量并发数必须在1-10之间');
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    return;
                }

                const data = {
                    site_name: document.getElementById('systemSiteName').value.trim(),
                    frontend_url: document.getElementById('systemFrontendUrl').value.trim(),
                    batch_concurrency: concurrency
                };

                const res = await fetch('/api/admin/settings/system', {
                    method:'POST',
                    headers:{'Content-Type':'application/json','Authorization':'Bearer '+TOKEN},
                    body: JSON.stringify(data)
                });

                if(res.ok) {
                    alert('系统配置已更新');
                } else {
                    const error = await res.json();
                    alert('更新失败: ' + (error.error || '未知错误'));
                }
            } catch(e) {
                alert('更新失败: ' + e.message);
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }

        // --- 5. 批量配置逻辑 ---
        async function loadConcurrency() {
            try {
                const res = await fetch('/api/admin/config/concurrency', { headers:{'Authorization':'Bearer '+TOKEN} });
                const d = await res.json();
                if(d.success) {
                    document.getElementById('concurrencyInput').value = d.data.concurrency;
                }
            } catch(e) { console.error('加载并发数失败:', e); }
        }

        async function updateConcurrency() {
            const concurrency = parseInt(document.getElementById('concurrencyInput').value);
            if(!concurrency || concurrency < 1 || concurrency > 10) {
                return alert('并发数必须在1-10之间');
            }
            try {
                const res = await fetch('/api/admin/config/concurrency', {
                    method:'POST',
                    headers:{'Content-Type':'application/json','Authorization':'Bearer '+TOKEN},
                    body: JSON.stringify({ concurrency })
                });
                if(res.ok) alert('并发数已更新');
                else alert('更新失败');
            } catch(e) { alert('更新失败: ' + e.message); }
        }

        async function loadPresets() {
            try {
                const res = await fetch('/api/admin/presets', { headers:{'Authorization':'Bearer '+TOKEN} });
                const d = await res.json();
                const tbody = document.querySelector('#presetTable tbody');
                if(d.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-10 text-gray-500">暂无预设</td></tr>';
                    return;
                }
                tbody.innerHTML = d.data.map(p => \`
                    <tr class="hover:bg-white/5 transition-colors">
                        <td class="px-6 py-4 font-mono text-xs text-gray-500">\${p.id}</td>
                        <td class="px-6 py-4 font-medium text-white">\${p.title}</td>
                        <td class="px-6 py-4 text-sm text-gray-300 max-w-md truncate">\${p.content}</td>
                        <td class="px-6 py-4 text-xs text-gray-400">\${p.category}</td>
                        <td class="px-6 py-4 text-right">
                            <button onclick="delPreset(\${p.id})" class="text-gray-400 hover:text-red-400 text-xs px-3 py-1.5 rounded-lg border border-gray-600 hover:border-red-400 transition-all">
                                <i class="fas fa-trash mr-1"></i> 删除
                            </button>
                        </td>
                    </tr>
                \`).join('');
            } catch(e) { console.error('加载预设失败:', e); }
        }

        async function addPreset() {
            const title = document.getElementById('presetTitle').value.trim();
            const content = document.getElementById('presetContent').value.trim();
            if(!title || !content) return alert('标题和内容不能为空');
            try {
                const res = await fetch('/api/admin/presets', {
                    method:'POST',
                    headers:{'Content-Type':'application/json','Authorization':'Bearer '+TOKEN},
                    body: JSON.stringify({ title, content, category: 'general', sortOrder: 0 })
                });
                if(res.ok) {
                    document.getElementById('presetTitle').value = '';
                    document.getElementById('presetContent').value = '';
                    loadPresets();
                } else {
                    alert('添加失败');
                }
            } catch(e) { alert('添加失败: ' + e.message); }
        }

        async function delPreset(id) {
            if(!confirm('确定删除此预设？')) return;
            try {
                await fetch('/api/admin/presets/'+id, { method:'DELETE', headers:{'Authorization':'Bearer '+TOKEN} });
                loadPresets();
            } catch(e) { alert('删除失败: ' + e.message); }
        }

        // --- 5. 批量监控逻辑 ---
        async function loadBatchStats() {
            try {
                const res = await fetch('/api/admin/batch/stats', { headers:{'Authorization':'Bearer '+TOKEN} });
                const d = await res.json();
                if(d.success) {
                    const stats = d.data;
                    document.getElementById('stat-total').innerText = stats.total_queues || 0;
                    document.getElementById('stat-processing').innerText = stats.processing_queues || 0;
                    document.getElementById('stat-completed').innerText = stats.completed_queues || 0;
                    document.getElementById('stat-images').innerText = stats.total_images || 0;
                }
            } catch(e) { console.error('加载统计失败:', e); }
        }

        async function loadBatchQueues() {
            try {
                const res = await fetch('/api/admin/batch/queues', { headers:{'Authorization':'Bearer '+TOKEN} });
                const d = await res.json();
                const tbody = document.querySelector('#batchQueueTable tbody');
                if(d.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-10 text-gray-500">暂无批量任务</td></tr>';
                    return;
                }
                tbody.innerHTML = d.data.map(q => {
                    const progress = q.total_images > 0 ? Math.round((q.completed_images / q.total_images) * 100) : 0;
                    const statusColors = {
                        'pending': 'text-gray-400',
                        'processing': 'text-yellow-400',
                        'completed': 'text-green-400',
                        'failed': 'text-red-400',
                        'cancelled': 'text-gray-500'
                    };
                    const statusText = {
                        'pending': '等待中',
                        'processing': '处理中',
                        'completed': '已完成',
                        'failed': '失败',
                        'cancelled': '已取消'
                    };
                    return \`
                        <tr class="hover:bg-white/5 transition-colors">
                            <td class="px-6 py-4 font-mono text-xs text-gray-500">\${q.id}</td>
                            <td class="px-6 py-4">
                                <div class="text-sm text-white">\${q.username}</div>
                                <div class="text-xs text-gray-500">\${q.email}</div>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-300">\${q.batch_name || '未命名'}</td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    <div class="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div class="h-full bg-blue-500 transition-all" style="width: \${progress}%"></div>
                                    </div>
                                    <span class="text-xs text-gray-400 font-mono">\${q.completed_images}/\${q.total_images}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="text-xs font-medium \${statusColors[q.status]}">\${statusText[q.status]}</span>
                            </td>
                            <td class="px-6 py-4 text-xs text-gray-500 font-mono">\${new Date(q.created_at).toLocaleString()}</td>
                        </tr>
                    \`;
                }).join('');
            } catch(e) { console.error('加载队列失败:', e); }
        }

    </script>
</body>
</html>
    `;
    res.send(html);
});

// ================= API 接口 (MySQL 稳定版) =================

const authenticateToken = (req, res, next) => {
    const t = req.headers['authorization']?.split(' ')[1];
    if(!t) return res.sendStatus(401);
    jwt.verify(t, process.env.JWT_SECRET, (err, user) => { if(err) return res.sendStatus(403); req.user = user; next(); });
};
const requireAdmin = (req, res, next) => { if(req.user?.role === 'admin') next(); else res.status(403).json({error:'Admin only'}); };

// User APIs
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
    try { const [rows] = await pool.execute('SELECT id, username, email, role, drawing_points FROM users ORDER BY id DESC'); res.json({success:true, data:rows}); } catch(e){res.status(500).json({});}
});
router.post('/users/points', authenticateToken, requireAdmin, async (req, res) => {
    let connection;
    try {
        const { userId, points, absolute = false } = req.body;

        connection = await pool.getConnection();

        if (absolute) {
            // Absolute update - set exact points value
            await connection.execute('UPDATE users SET drawing_points = ? WHERE id = ?', [points, userId]);
        } else {
            // Relative update - add points to existing value (default behavior)
            await connection.execute('UPDATE users SET drawing_points = drawing_points + ? WHERE id = ?', [points, userId]);
        }

        res.json({success: true});
    } catch(e) {
        console.error('Update user points error:', e);
        res.status(500).json({success: false, error: 'Failed to update user points'});
    } finally {
        if (connection) connection.release();
    }
});

// User status toggle endpoint - enable/disable user account
router.put('/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    let connection;
    try {
        const userId = req.params.id;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: 'isActive must be a boolean value'
            });
        }

        connection = await pool.getConnection();

        // Check if user exists
        const [users] = await connection.execute('SELECT id, username, email FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Update user status
        await connection.execute('UPDATE users SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, userId]);

        console.log(`User ${userId} status ${isActive ? 'enabled' : 'disabled'} by admin`);

        res.json({
            success: true,
            data: {
                userId: parseInt(userId),
                isActive,
                message: `User successfully ${isActive ? 'enabled' : 'disabled'}`
            }
        });

    } catch(e) {
        console.error('Update user status error:', e);
        res.status(500).json({
            success: false,
            error: 'Failed to update user status'
        });
    } finally {
        if (connection) connection.release();
    }
});

// User statistics endpoint - get usage trends
router.get('/users/stats', authenticateToken, requireAdmin, async (req, res) => {
    let connection;
    try {
        const { period = 'day', days = 30 } = req.query;

        connection = await pool.getConnection();

        let dateFilter = '';
        if (period === 'day') {
            dateFilter = `AND date >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)`;
        } else if (period === 'week') {
            dateFilter = `AND date >= DATE_SUB(CURDATE(), INTERVAL ${days * 7} DAY)`;
        } else if (period === 'month') {
            dateFilter = `AND date >= DATE_SUB(CURDATE(), INTERVAL ${days} MONTH)`;
        }

        // Get aggregated statistics
        const [stats] = await connection.execute(
            `SELECT
                date,
                SUM(points_consumed) as points_consumed,
                SUM(points_earned) as points_earned,
                SUM(images_created) as images_created,
                SUM(checkins) as checkins,
                COUNT(DISTINCT user_id) as active_users
             FROM usage_statistics
             WHERE 1=1 ${dateFilter}
             GROUP BY date
             ORDER BY date ASC`
        );

        // Get total statistics
        const [totals] = await connection.execute(
            `SELECT
                SUM(points_consumed) as total_points_consumed,
                SUM(points_earned) as total_points_earned,
                SUM(images_created) as total_images_created,
                SUM(checkins) as total_checkins,
                COUNT(DISTINCT user_id) as total_active_users,
                COUNT(*) as total_days
             FROM usage_statistics
             WHERE 1=1 ${dateFilter}`
        );

        res.json({
            success: true,
            data: {
                period,
                days: parseInt(days),
                stats,
                totals: totals[0]
            }
        });

    } catch(e) {
        console.error('Get user statistics error:', e);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve user statistics'
        });
    } finally {
        if (connection) connection.release();
    }
});

// Password reset endpoint - generate temporary password and email user
router.post('/users/:id/reset-password', authenticateToken, requireAdmin, async (req, res) => {
    let connection;
    try {
        const userId = req.params.id;

        connection = await pool.getConnection();

        // Check if user exists and get email
        const [users] = await connection.execute('SELECT id, username, email FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const user = users[0];

        // Generate temporary password (12 characters)
        const tempPassword = generateTempPassword();

        // Hash password with bcrypt (12 salt rounds)
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        // Start transaction
        await connection.beginTransaction();

        try {
            // Update user password
            await connection.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

            // Send email notification
            await mailService.sendPasswordResetEmail(user.email, user.username, tempPassword);

            // Commit transaction
            await connection.commit();

            console.log(`Password reset completed for user ${userId} by admin`);

            res.json({
                success: true,
                data: {
                    userId: parseInt(userId),
                    email: user.email,
                    message: 'Password reset successfully. User has been notified via email.'
                }
            });

        } catch (error) {
            // Rollback transaction on error
            await connection.rollback();
            throw error;
        }

    } catch(e) {
        console.error('Password reset error:', e);
        res.status(500).json({
            success: false,
            error: 'Failed to reset password: ' + e.message
        });
    } finally {
        if (connection) connection.release();
    }
});

// Helper function to generate temporary password
function generateTempPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Inspiration APIs
router.get('/inspirations', authenticateToken, requireAdmin, async (req, res) => {
    try { const [rows] = await pool.execute('SELECT * FROM inspirations ORDER BY id DESC'); res.json({success:true, data:rows}); } catch(e){res.status(500).json({});}
});
router.post('/inspirations', authenticateToken, requireAdmin, async (req, res) => {
    try { await pool.execute('INSERT INTO inspirations (url, prompt) VALUES (?, ?)', [req.body.url, req.body.prompt]); res.json({success:true}); } catch(e){res.status(500).json({});}
});
router.delete('/inspirations/:id', authenticateToken, requireAdmin, async (req, res) => {
    try { await pool.execute('DELETE FROM inspirations WHERE id = ?', [req.params.id]); res.json({success:true}); } catch(e){res.status(500).json({});}
});

// Announcement APIs
router.get('/announcements', authenticateToken, requireAdmin, async (req, res) => {
    try { const [rows] = await pool.execute('SELECT * FROM announcements ORDER BY id DESC'); res.json({success:true, data:rows}); } catch(e){res.status(500).json({});}
});
router.post('/announcements', authenticateToken, requireAdmin, async (req, res) => {
    try { 
        const isImp = req.body.isImportant ? 1 : 0;
        await pool.execute('INSERT INTO announcements (content, is_important) VALUES (?, ?)', [req.body.content, isImp]); 
        res.json({success:true}); 
    } catch(e){res.status(500).json({});}
});
router.delete('/announcements/:id', authenticateToken, requireAdmin, async (req, res) => {
    try { await pool.execute('DELETE FROM announcements WHERE id = ?', [req.params.id]); res.json({success:true}); } catch(e){res.status(500).json({});}
});

// ================= 批量图生图管理 APIs =================

// 预设提示词管理
router.get('/presets', authenticateToken, requireAdmin, async (req, res) => {
    try { const [rows] = await pool.execute('SELECT * FROM preset_prompts ORDER BY sort_order ASC, id ASC'); res.json({success:true, data:rows}); } catch(e){res.status(500).json({});}
});

router.post('/presets', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { title, content, category, sortOrder } = req.body;
        await pool.execute('INSERT INTO preset_prompts (title, content, category, sort_order) VALUES (?, ?, ?, ?)',
            [title, content, category || 'general', sortOrder || 0]);
        res.json({success:true});
    } catch(e){res.status(500).json({error: e.message});}
});

router.put('/presets/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { title, content, category, sortOrder, isActive } = req.body;
        await pool.execute('UPDATE preset_prompts SET title = ?, content = ?, category = ?, sort_order = ?, is_active = ? WHERE id = ?',
            [title, content, category, sortOrder, isActive ? 1 : 0, req.params.id]);
        res.json({success:true});
    } catch(e){res.status(500).json({error: e.message});}
});

router.delete('/presets/:id', authenticateToken, requireAdmin, async (req, res) => {
    try { await pool.execute('DELETE FROM preset_prompts WHERE id = ?', [req.params.id]); res.json({success:true}); } catch(e){res.status(500).json({});}
});

// 系统配置管理（并发数）
router.get('/config/concurrency', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT config_value FROM system_config WHERE config_key = ?', ['batch_concurrency']);
        const concurrency = rows.length > 0 ? parseInt(rows[0].config_value) : 3;
        res.json({success:true, data: { concurrency }});
    } catch(e){res.status(500).json({error: e.message});}
});

router.post('/config/concurrency', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { concurrency } = req.body;
        if (!concurrency || concurrency < 1 || concurrency > 10) {
            return res.status(400).json({error: '并发数必须在1-10之间'});
        }
        await pool.execute('UPDATE system_config SET config_value = ? WHERE config_key = ?',
            [concurrency.toString(), 'batch_concurrency']);

        // 更新队列服务的并发数
        const queueService = require('../services/queueService');
        await queueService.updateConcurrency(concurrency);

        res.json({success:true});
    } catch(e){res.status(500).json({error: e.message});}
});

// API提供商并发数配置
router.get('/config/api-concurrency', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT config_value FROM system_config WHERE config_key = ?', ['api_concurrency']);
        const concurrency = rows.length > 0 ? parseInt(rows[0].config_value) : 5;
        res.json({success:true, data: { concurrency }});
    } catch(e){res.status(500).json({error: e.message});}
});

router.post('/config/api-concurrency', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { concurrency } = req.body;
        if (!concurrency || concurrency < 1 || concurrency > 50) {
            return res.status(400).json({error: 'API并发数必须在1-50之间'});
        }
        await pool.execute('INSERT INTO system_config (config_key, config_value, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE config_value = ?',
            ['api_concurrency', concurrency.toString(), 'API提供商并发请求数限制', concurrency.toString()]);

        res.json({success:true, message: 'API并发数已更新'});
    } catch(e){res.status(500).json({error: e.message});}
});

// 批量任务监控
router.get('/batch/queues', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT bq.*, u.username, u.email
            FROM batch_queues bq
            JOIN users u ON bq.user_id = u.id
            ORDER BY bq.created_at DESC
            LIMIT 50
        `);
        res.json({success:true, data:rows});
    } catch(e){res.status(500).json({error: e.message});}
});

router.get('/batch/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [stats] = await pool.execute(`
            SELECT
                COUNT(*) as total_queues,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_queues,
                SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_queues,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_queues,
                SUM(total_images) as total_images,
                SUM(completed_images) as completed_images,
                SUM(failed_images) as failed_images
            FROM batch_queues
        `);
        res.json({success:true, data: stats[0]});
    } catch(e){res.status(500).json({error: e.message});}
});

// ================= Runtime System Settings Management =================

// Get all system settings grouped by category
router.get('/settings', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT config_key, config_value, description FROM system_config');

        // Group settings by category
        const settings = {
            mail: {},
            ai: {},
            system: {}
        };

        rows.forEach(row => {
            const key = row.config_key;
            const value = row.config_value;

            // Mail settings
            if (key.startsWith('mail_')) {
                settings.mail[key.replace('mail_', '')] = value;
            }
            // AI settings
            else if (key.startsWith('ai_')) {
                settings.ai[key.replace('ai_', '')] = value;
            }
            // System settings
            else if (key.startsWith('system_')) {
                settings.system[key.replace('system_', '')] = value;
            }
            // Batch settings (keep for backward compatibility)
            else if (key === 'batch_concurrency') {
                settings.system.batch_concurrency = value;
            }
        });

        res.json({success: true, data: settings});
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});

// AI 模型管理：获取所有模型（包含启用/禁用状态）
router.get('/models', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT id, model_key, name, description, icon, is_enabled, credit_cost FROM model_management ORDER BY id ASC'
        );

        res.json({ success: true, data: rows });
    } catch (e) {
        console.error('Get models error:', e);
        res.status(500).json({ success: false, error: 'Failed to load models' });
    }
});

// AI 模型管理：切换模型启用/禁用状态
router.post('/models/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const modelId = req.params.id;
        let { is_enabled } = req.body;

        if (typeof is_enabled === 'string') {
            is_enabled = is_enabled === 'true' || is_enabled === '1';
        }

        if (typeof is_enabled !== 'boolean') {
            return res.status(400).json({ success: false, error: 'is_enabled must be a boolean value' });
        }

        const [result] = await pool.execute(
            'UPDATE model_management SET is_enabled = ? WHERE id = ?',
            [is_enabled ? 1 : 0, modelId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Model not found' });
        }

        // 清理模型缓存，确保 60 秒内前台模型列表更新
        try {
            configService.clearCache('enabled_models');
        } catch (clearErr) {
            console.error('Failed to clear enabled_models cache:', clearErr);
        }

        res.json({
            success: true,
            data: {
                id: parseInt(modelId, 10),
                is_enabled
            }
        });
    } catch (e) {
        console.error('Toggle model status error:', e);
        res.status(500).json({ success: false, error: 'Failed to update model status' });
    }
});

// Update mail settings
router.post('/settings/mail', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { host, port, user, pass, from, brand_name } = req.body;

        const updates = [];
        if (host !== undefined) updates.push(['mail_host', host, 'SMTP server address']);
        if (port !== undefined) updates.push(['mail_port', port.toString(), 'SMTP port']);
        if (user !== undefined) updates.push(['mail_user', user, 'Sender email address']);
        if (pass !== undefined) updates.push(['mail_pass', pass, 'Email authorization code']);
        if (from !== undefined) updates.push(['mail_from', from, 'Sender display name and email']);
        if (brand_name !== undefined) updates.push(['mail_brand_name', brand_name, 'Email brand name']);

        for (const [key, value, desc] of updates) {
            await pool.execute(
                'INSERT INTO system_config (config_key, config_value, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE config_value = ?, description = ?',
                [key, value, desc, value, desc]
            );
        }

        res.json({success: true, message: 'Mail settings updated successfully'});
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});

// Update AI settings
router.post('/settings/ai', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { api_base_url, api_key, models } = req.body;

        const updates = [];
        if (api_base_url !== undefined) updates.push(['ai_api_base_url', api_base_url, 'AI API base URL']);
        if (api_key !== undefined) updates.push(['ai_api_key', api_key, 'AI API key']);
        if (models !== undefined) {
            const modelsJson = typeof models === 'string' ? models : JSON.stringify(models);
            updates.push(['ai_models', modelsJson, 'Available image generation models (JSON array)']);
        }

        for (const [key, value, desc] of updates) {
            await pool.execute(
                'INSERT INTO system_config (config_key, config_value, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE config_value = ?, description = ?',
                [key, value, desc, value, desc]
            );
        }

        res.json({success: true, message: 'AI settings updated successfully'});
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});

// Update system settings
router.post('/settings/system', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { site_name, frontend_url, batch_concurrency } = req.body;

        const updates = [];
        if (site_name !== undefined) updates.push(['system_site_name', site_name, 'Site name']);
        if (frontend_url !== undefined) updates.push(['system_frontend_url', frontend_url, 'Frontend URL for CORS']);
        if (batch_concurrency !== undefined) {
            const concurrency = parseInt(batch_concurrency);
            if (concurrency < 1 || concurrency > 10) {
                return res.status(400).json({error: 'Batch concurrency must be between 1 and 10'});
            }
            updates.push(['batch_concurrency', concurrency.toString(), 'Batch image generation concurrency']);

            // Update queue service concurrency
            const queueService = require('../services/queueService');
            await queueService.updateConcurrency(concurrency);
        }

        for (const [key, value, desc] of updates) {
            await pool.execute(
                'INSERT INTO system_config (config_key, config_value, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE config_value = ?, description = ?',
                [key, value, desc, value, desc]
            );
        }

        res.json({success: true, message: 'System settings updated successfully'});
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});

// Get specific setting value
router.get('/settings/:key', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT config_value FROM system_config WHERE config_key = ?', [req.params.key]);

        if (rows.length === 0) {
            return res.status(404).json({error: 'Setting not found'});
        }

        res.json({success: true, data: { value: rows[0].config_value }});
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});

module.exports = router;
