import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import Layout from '../components/Layout';
import WarmupChart from '../components/WarmupChart';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const MonitorPage = () => {
  const { t } = useTranslation('common');
  const { data: session, status } = useSession();
  const router = useRouter();

  // 如果需要管理员权限，可以在这里添加检查
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    // 可选：只允许登录用户查看监控页面
    // if (!session) {
    //   router.push('/login');
    //   return;
    // }
  }, [session, status, router]);

  return (
    <>
      <Head>
        <title>{t('monitor_title', '系统监控')} - DreamImg AI</title>
        <meta name="description" content={t('monitor_description', '查看系统性能和温升监控数据')} />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gray-900 py-8">
          <div className="container mx-auto px-4">
            {/* 页面标题 */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t('system_monitor', '系统监控台')}
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                {t('monitor_subtitle', '实时监控AI图像生成系统的性能指标和温升数据')}
              </p>
            </div>

            {/* 状态概览卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {t('system_status', '系统状态')}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-green-400 font-medium">
                        {t('online', '在线')}
                      </span>
                    </div>
                  </div>
                  <div className="text-3xl">🟢</div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {t('active_users', '活跃用户')}
                    </h3>
                    <div className="text-2xl font-bold text-blue-400">
                      {Math.floor(Math.random() * 50) + 10}
                    </div>
                  </div>
                  <div className="text-3xl">👥</div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {t('daily_generations', '今日生成')}
                    </h3>
                    <div className="text-2xl font-bold text-purple-400">
                      {Math.floor(Math.random() * 500) + 100}
                    </div>
                  </div>
                  <div className="text-3xl">🎨</div>
                </div>
              </div>
            </div>

            {/* 主要监控图表 */}
            <WarmupChart className="mb-8" />

            {/* 额外的系统信息 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 服务健康状态 */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {t('service_health', '服务健康状态')}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">{t('api_server', 'API服务器')}</span>
                    <span className="px-2 py-1 bg-green-600 text-green-100 rounded text-sm">
                      {t('healthy', '健康')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">{t('database', '数据库')}</span>
                    <span className="px-2 py-1 bg-green-600 text-green-100 rounded text-sm">
                      {t('healthy', '健康')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">{t('ai_service', 'AI服务')}</span>
                    <span className="px-2 py-1 bg-green-600 text-green-100 rounded text-sm">
                      {t('healthy', '健康')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">{t('cache_system', '缓存系统')}</span>
                    <span className="px-2 py-1 bg-yellow-600 text-yellow-100 rounded text-sm">
                      {t('warning', '警告')}
                    </span>
                  </div>
                </div>
              </div>

              {/* 最近的活动日志 */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {t('recent_activity', '最近活动')}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>{t('system_restart', '系统重启完成')}</span>
                    <span className="text-gray-500">2分钟前</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>{t('cache_cleared', '缓存已清理')}</span>
                    <span className="text-gray-500">15分钟前</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>{t('new_user_registered', '新用户注册')}</span>
                    <span className="text-gray-500">23分钟前</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>{t('batch_generation_completed', '批量生成完成')}</span>
                    <span className="text-gray-500">45分钟前</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>{t('daily_backup_success', '每日备份成功')}</span>
                    <span className="text-gray-500">2小时前</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 快速操作 */}
            <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                {t('quick_actions', '快速操作')}
              </h3>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                  {t('refresh_data', '刷新数据')}
                </button>
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors">
                  {t('export_report', '导出报告')}
                </button>
                <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors">
                  {t('clear_cache', '清理缓存')}
                </button>
                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors">
                  {t('emergency_stop', '紧急停止')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

export default MonitorPage;
