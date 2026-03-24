import React, { useState } from 'react';
import { Save, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useAuth } from '../context/AuthContext';

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

  // 密码修改状态
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdResult, setPwdResult] = useState<{ success: boolean; message: string } | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

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

