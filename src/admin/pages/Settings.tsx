import React, { useState, useEffect } from 'react';
import { Save, Lock, Eye, EyeOff, CheckCircle, XCircle, Github, Loader2, Trash2, MessageSquare, Plus } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useAuth } from '../context/AuthContext';
import {
  loadGitHubConfig,
  saveGitHubConfig,
  clearGitHubConfig,
  validateGitHubConfig,
  type GitHubConfig,
} from '../../services/githubService';
import {
  getWeChatAccounts,
  addWeChatAccount,
  deleteWeChatAccount,
  type WeChatAccount,
} from '../../services/wechatService';

interface BlogSettings {
  title: string;
  subtitle: string;
  author: string;
  description: string;
}

export const Settings: React.FC = () => {
  const { isDark } = useDarkMode();
  const { changePassword } = useAuth();

  const [settings, setSettings] = useState<BlogSettings>({
    title: 'OpenClaw 龙虾养成计划',
    subtitle: '记录 OpenClaw AI Agent 的折腾历程',
    author: 'OpenClaw 折腾人',
    description: '记录 OpenClaw AI Agent 的折腾历程、技巧心得与踩坑实录。',
  });

  // ── GitHub 发布配置 ──────────────────────────────────
  const [ghConfig, setGhConfig] = useState<GitHubConfig>(() => {
    return loadGitHubConfig() ?? {
      token: '',
      owner: 'AIgo-web',
      repo: 'openclaw-cultivation-blog',
      branch: 'main',
    };
  });
  const [showToken, setShowToken] = useState(false);
  const [ghValidating, setGhValidating] = useState(false);
  const [ghResult, setGhResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleGhSave = async () => {
    if (!ghConfig.token.trim()) {
      setGhResult({ success: false, message: '请填写 GitHub Token' });
      return;
    }
    setGhValidating(true);
    setGhResult(null);
    const result = await validateGitHubConfig(ghConfig);
    if (result.valid) {
      saveGitHubConfig(ghConfig);
      setGhResult({ success: true, message: result.message + '，配置已保存' });
    } else {
      setGhResult({ success: false, message: result.message });
    }
    setGhValidating(false);
  };

  const handleGhClear = () => {
    clearGitHubConfig();
    setGhConfig({ token: '', owner: 'AIgo-web', repo: 'openclaw-cultivation-blog', branch: 'main' });
    setGhResult(null);
  };

  // 页面加载时检查已保存配置的有效性（静默）
  useEffect(() => {
    const saved = loadGitHubConfig();
    if (saved?.token) {
      setGhConfig(saved);
    }
  }, []);

  // 密码修改状态
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdResult, setPwdResult] = useState<{ success: boolean; message: string } | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  // 微信公众号状态
  const [wechatAccounts, setWechatAccounts] = useState<WeChatAccount[]>([]);
  const [showWechatForm, setShowWechatForm] = useState(false);
  const [wechatForm, setWechatForm] = useState({ name: '', appid: '', appsecret: '' });
  const [wechatLoading, setWechatLoading] = useState(false);
  const [wechatResult, setWechatResult] = useState<{ success: boolean; message: string } | null>(null);

  // 加载微信公众号账号
  useEffect(() => {
    loadWechatAccounts();
  }, []);

  const loadWechatAccounts = async () => {
    const accounts = await getWeChatAccounts();
    setWechatAccounts(accounts);
  };

  const handleAddWechatAccount = async () => {
    if (!wechatForm.name || !wechatForm.appid || !wechatForm.appsecret) {
      setWechatResult({ success: false, message: '请填写完整的公众号信息' });
      return;
    }
    setWechatLoading(true);
    setWechatResult(null);
    const result = await addWeChatAccount(wechatForm.name, wechatForm.appid, wechatForm.appsecret);
    setWechatLoading(false);
    if (result.success) {
      setWechatResult({ success: true, message: `「${wechatForm.name}」添加成功` });
      setWechatForm({ name: '', appid: '', appsecret: '' });
      setShowWechatForm(false);
      loadWechatAccounts();
    } else {
      setWechatResult({ success: false, message: result.error || '添加失败' });
    }
  };

  const handleDeleteWechatAccount = async (name: string) => {
    if (!confirm(`确定要删除公众号「${name}」吗？`)) return;
    const result = await deleteWeChatAccount(name);
    if (result.success) {
      loadWechatAccounts();
    }
  };

  const handleSave = () => {
    alert('设置已保存（演示模式，数据未持久化）');
  };

  const handleChangePassword = async () => {
    setPwdResult(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdResult({ success: false, message: '请填写所有密码字段' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdResult({ success: false, message: '两次输入的新密码不一致' });
      return;
    }
    if (newPassword === currentPassword) {
      setPwdResult({ success: false, message: '新密码不能与当前密码相同' });
      return;
    }

    setPwdLoading(true);
    // 模拟短暂延迟
    await new Promise(resolve => setTimeout(resolve, 400));

    const result = changePassword(currentPassword, newPassword);
    setPwdResult(result);
    setPwdLoading(false);

    if (result.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const inputClass = `
    w-full px-4 py-2.5 rounded-lg border
    ${isDark
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
    } focus:outline-none focus:ring-2 focus:ring-lobster-500
  `;

  const passwordInputWrap = 'relative';
  const eyeBtn = `absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
          设置
        </h1>
        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          配置博客基本信息
        </p>
      </div>

      <div className="space-y-6">
        {/* 基本信息 */}
        <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-white'} border border-gray-200 dark:border-gray-800`}>
          <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            基本信息
          </h2>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                博客标题
              </label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) => setSettings({...settings, title: e.target.value})}
                className={inputClass}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                副标题
              </label>
              <input
                type="text"
                value={settings.subtitle}
                onChange={(e) => setSettings({...settings, subtitle: e.target.value})}
                className={inputClass}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                作者
              </label>
              <input
                type="text"
                value={settings.author}
                onChange={(e) => setSettings({...settings, author: e.target.value})}
                className={inputClass}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                描述
              </label>
              <textarea
                value={settings.description}
                onChange={(e) => setSettings({...settings, description: e.target.value})}
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* 保存基本信息按钮 */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-lobster-500 hover:bg-lobster-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            保存设置
          </button>
        </div>

        {/* GitHub 自动发布配置 */}
        <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-white'} border border-gray-200 dark:border-gray-800`}>
          <div className="flex items-center gap-2 mb-2">
            <Github className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              GitHub 自动发布
            </h2>
          </div>
          <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            配置后，在文章编辑器中可一键将文章推送到 GitHub，自动触发部署，约 1 分钟内全网生效。
          </p>

          <div className="space-y-4 max-w-lg">
            {/* Token */}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                GitHub Personal Access Token
              </label>
              <p className={`text-xs mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                前往 GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens，
                新建一个 Token，勾选 <strong>Contents: Read and write</strong> 权限。
              </p>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={ghConfig.token}
                  onChange={(e) => setGhConfig(c => ({ ...c, token: e.target.value }))}
                  placeholder="github_pat_xxx..."
                  className={`w-full px-4 py-2.5 pr-10 rounded-lg border font-mono text-sm
                    ${isDark
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } focus:outline-none focus:ring-2 focus:ring-lobster-500`}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Owner / Repo / Branch */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Owner（用户名）
                </label>
                <input
                  type="text"
                  value={ghConfig.owner}
                  onChange={(e) => setGhConfig(c => ({ ...c, owner: e.target.value }))}
                  placeholder="AIgo-web"
                  className={`w-full px-3 py-2 rounded-lg border text-sm
                    ${isDark
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } focus:outline-none focus:ring-2 focus:ring-lobster-500`}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  仓库名
                </label>
                <input
                  type="text"
                  value={ghConfig.repo}
                  onChange={(e) => setGhConfig(c => ({ ...c, repo: e.target.value }))}
                  placeholder="openclaw-cultivation-blog"
                  className={`w-full px-3 py-2 rounded-lg border text-sm
                    ${isDark
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } focus:outline-none focus:ring-2 focus:ring-lobster-500`}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  分支
                </label>
                <input
                  type="text"
                  value={ghConfig.branch}
                  onChange={(e) => setGhConfig(c => ({ ...c, branch: e.target.value }))}
                  placeholder="main"
                  className={`w-full px-3 py-2 rounded-lg border text-sm
                    ${isDark
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } focus:outline-none focus:ring-2 focus:ring-lobster-500`}
                />
              </div>
            </div>

            {/* 验证结果 */}
            {ghResult && (
              <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                ghResult.success
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
              }`}>
                {ghResult.success
                  ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  : <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                }
                {ghResult.message}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={handleGhSave}
                disabled={ghValidating}
                className="flex items-center gap-2 px-5 py-2.5 bg-lobster-500 hover:bg-lobster-600 disabled:bg-lobster-400 text-white rounded-lg font-medium transition-colors text-sm"
              >
                {ghValidating
                  ? <><Loader2 className="w-4 h-4 animate-spin" />验证中...</>
                  : <><CheckCircle className="w-4 h-4" />验证并保存</>
                }
              </button>
              {loadGitHubConfig()?.token && (
                <button
                  onClick={handleGhClear}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm border transition-colors
                    ${isDark
                      ? 'border-gray-700 text-gray-400 hover:bg-gray-800'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <Trash2 className="w-4 h-4" />
                  清除配置
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 微信公众号配置 */}
        <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-white'} border border-gray-200 dark:border-gray-800`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                微信公众号同步
              </h2>
            </div>
            <button
              onClick={() => setShowWechatForm(!showWechatForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加公众号
            </button>
          </div>
          <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            配置公众号后，在文章编辑器中可一键同步文章到公众号草稿箱。
          </p>

          {/* 添加表单 */}
          {showWechatForm && (
            <div className={`p-4 rounded-lg mb-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    公众号名称
                  </label>
                  <input
                    type="text"
                    value={wechatForm.name}
                    onChange={(e) => setWechatForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="例如：AI养成笔记"
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-green-500`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    AppID
                  </label>
                  <input
                    type="text"
                    value={wechatForm.appid}
                    onChange={(e) => setWechatForm(f => ({ ...f, appid: e.target.value }))}
                    placeholder="wx开头的公众号ID"
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-green-500`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    AppSecret
                  </label>
                  <input
                    type="password"
                    value={wechatForm.appsecret}
                    onChange={(e) => setWechatForm(f => ({ ...f, appsecret: e.target.value }))}
                    placeholder="公众号密钥"
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-green-500`}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddWechatAccount}
                  disabled={wechatLoading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {wechatLoading ? <><Loader2 className="w-4 h-4 animate-spin" />添加中...</> : <><CheckCircle className="w-4 h-4" />确认添加</>}
                </button>
                <button
                  onClick={() => { setShowWechatForm(false); setWechatForm({ name: '', appid: '', appsecret: '' }); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    isDark ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* 结果提示 */}
          {wechatResult && (
            <div className={`flex items-start gap-2 p-3 rounded-lg text-sm mb-4 ${
              wechatResult.success
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
            }`}>
              {wechatResult.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
              {wechatResult.message}
            </div>
          )}

          {/* 已配置的公众号列表 */}
          <div className="space-y-3">
            {wechatAccounts.length === 0 ? (
              <p className={`text-sm text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                暂无配置的公众号，点击上方「添加公众号」开始配置
              </p>
            ) : (
              wechatAccounts.map(acc => (
                <div
                  key={acc.name}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isDark ? 'bg-green-900/50' : 'bg-green-100'
                    }`}>
                      <MessageSquare className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{acc.name}</p>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>AppID: {acc.appid}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteWechatAccount(acc.name)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark ? 'text-gray-500 hover:text-red-400 hover:bg-red-900/20' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                    title="删除公众号"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 修改密码 */}
        <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-white'} border border-gray-200 dark:border-gray-800`}>
          <div className="flex items-center gap-2 mb-6">
            <Lock className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              修改密码
            </h2>
          </div>

          <div className="space-y-4 max-w-md">
            {/* 当前密码 */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                当前密码
              </label>
              <div className={passwordInputWrap}>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="输入当前密码"
                  className={`${inputClass} pr-10`}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowCurrent(v => !v)} className={eyeBtn}>
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 新密码 */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                新密码
              </label>
              <div className={passwordInputWrap}>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="至少 6 位"
                  className={`${inputClass} pr-10`}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowNew(v => !v)} className={eyeBtn}>
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* 密码强度指示 */}
              {newPassword.length > 0 && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3].map(level => (
                      <div
                        key={level}
                        className={`h-1 w-8 rounded-full transition-colors ${
                          newPassword.length >= level * 4
                            ? level === 1 ? 'bg-red-400' : level === 2 ? 'bg-yellow-400' : 'bg-green-400'
                            : isDark ? 'bg-gray-700' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs ${
                    newPassword.length < 4 ? 'text-red-400' :
                    newPassword.length < 8 ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {newPassword.length < 4 ? '弱' : newPassword.length < 8 ? '中' : '强'}
                  </span>
                </div>
              )}
            </div>

            {/* 确认新密码 */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                确认新密码
              </label>
              <div className={passwordInputWrap}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入新密码"
                  className={`${inputClass} pr-10 ${
                    confirmPassword.length > 0 && confirmPassword !== newPassword
                      ? 'border-red-400 focus:ring-red-400'
                      : ''
                  }`}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)} className={eyeBtn}>
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && confirmPassword !== newPassword && (
                <p className="text-xs text-red-400 mt-1">两次密码不一致</p>
              )}
            </div>

            {/* 结果提示 */}
            {pwdResult && (
              <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                pwdResult.success
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
              }`}>
                {pwdResult.success
                  ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  : <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                }
                {pwdResult.message}
              </div>
            )}

            {/* 提交按钮 */}
            <button
              onClick={handleChangePassword}
              disabled={pwdLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-lobster-500 hover:bg-lobster-600 disabled:bg-lobster-400 text-white rounded-lg font-medium transition-colors"
            >
              {pwdLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  修改中...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  确认修改密码
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

