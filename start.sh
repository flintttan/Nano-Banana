#!/bin/bash

echo "🎨 启动 Nano Banana AI 工作台..."
echo ""

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 检查是否存在node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    npm install
fi

# 启动服务
echo "🚀 启动服务器..."
echo ""
echo "✨ 新界面特性:"
echo "   - Workspace工作台模式"
echo "   - 深色主题设计"
echo "   - 现代化交互体验"
echo ""
echo "📍 访问地址:"
echo "   - 工作台: http://localhost:3000/"
echo "   - 登录页: http://localhost:3000/login"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

npm start
