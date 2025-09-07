import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useTranslation } from 'react-i18next';

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface WarmupData {
  timestamp: number;
  generationTime: number;
  queueLength: number;
  successRate: number;
  temperature: number; // 模拟的"温升"值
}

interface WarmupChartProps {
  className?: string;
}

const WarmupChart: React.FC<WarmupChartProps> = ({ className = '' }) => {
  const { t } = useTranslation('common');
  const [warmupData, setWarmupData] = useState<WarmupData[]>([]);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');
  const [isLoading, setIsLoading] = useState(true);

  // 生成模拟数据的函数
  const generateMockData = (range: string): WarmupData[] => {
    const now = Date.now();
    let points = 20;
    let interval = 3 * 60 * 1000; // 3分钟

    switch (range) {
      case '6h':
        points = 36;
        interval = 10 * 60 * 1000; // 10分钟
        break;
      case '24h':
        points = 24;
        interval = 60 * 60 * 1000; // 1小时
        break;
      case '7d':
        points = 7;
        interval = 24 * 60 * 60 * 1000; // 1天
        break;
    }

    const data: WarmupData[] = [];
    
    for (let i = points - 1; i >= 0; i--) {
      const timestamp = now - (i * interval);
      
      // 模拟系统热身过程：开始时性能较差，逐渐提升，然后稳定
      const normalizedTime = (points - 1 - i) / (points - 1);
      const warmupFactor = Math.min(1, normalizedTime * 2); // 前50%时间进行热身
      
      // 基础生成时间随着热身降低
      const baseTime = 25 - (warmupFactor * 10) + (Math.random() * 5);
      
      // 队列长度在系统冷启动时较高
      const baseQueue = Math.max(0, (1 - warmupFactor) * 10 + (Math.random() * 3));
      
      // 成功率随着系统热身提升
      const baseSuccess = Math.min(100, 70 + (warmupFactor * 25) + (Math.random() * 10));
      
      // 温度模拟：开始低，随着使用量增加，然后稳定
      const baseTemp = 30 + (warmupFactor * 40) + (Math.sin(normalizedTime * Math.PI * 2) * 5);

      data.push({
        timestamp,
        generationTime: Math.round(baseTime * 100) / 100,
        queueLength: Math.round(baseQueue),
        successRate: Math.round(baseSuccess * 100) / 100,
        temperature: Math.round(baseTemp * 100) / 100
      });
    }

    return data;
  };

  useEffect(() => {
    setIsLoading(true);
    // 模拟API调用延迟
    const timer = setTimeout(() => {
      const data = generateMockData(timeRange);
      setWarmupData(data);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [timeRange]);

  // 图表配置
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time' as const,
        time: {
          displayFormats: {
            hour: 'HH:mm',
            day: 'MM/dd'
          }
        },
        title: {
          display: true,
          text: t('time')
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: t('value')
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: t('warmup_chart_title', '系统温升监控图表')
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    }
  };

  // 温度数据
  const temperatureData = {
    labels: warmupData.map(d => new Date(d.timestamp)),
    datasets: [
      {
        label: t('temperature', '温度') + ' (°C)',
        data: warmupData.map(d => d.temperature),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3
      }
    ]
  };

  // 性能数据
  const performanceData = {
    labels: warmupData.map(d => new Date(d.timestamp)),
    datasets: [
      {
        label: t('generation_time', '生成时间') + ' (s)',
        data: warmupData.map(d => d.generationTime),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3
      },
      {
        label: t('queue_length', '队列长度'),
        data: warmupData.map(d => d.queueLength),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3
      },
      {
        label: t('success_rate', '成功率') + ' (%)',
        data: warmupData.map(d => d.successRate),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.3
      }
    ]
  };

  if (isLoading) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-white">
          {t('warmup_monitoring', '系统温升监控')}
        </h2>
        
        <div className="flex gap-2 flex-wrap">
          {/* 时间范围选择 */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600"
          >
            <option value="1h">{t('1_hour', '1小时')}</option>
            <option value="6h">{t('6_hours', '6小时')}</option>
            <option value="24h">{t('24_hours', '24小时')}</option>
            <option value="7d">{t('7_days', '7天')}</option>
          </select>

          {/* 图表类型选择 */}
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as any)}
            className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600"
          >
            <option value="line">{t('line_chart', '折线图')}</option>
            <option value="bar">{t('bar_chart', '柱状图')}</option>
          </select>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 p-3 rounded">
          <div className="text-red-400 text-sm">{t('avg_temperature', '平均温度')}</div>
          <div className="text-white text-lg font-bold">
            {warmupData.length > 0 
              ? Math.round(warmupData.reduce((acc, d) => acc + d.temperature, 0) / warmupData.length)
              : 0}°C
          </div>
        </div>
        
        <div className="bg-gray-700 p-3 rounded">
          <div className="text-blue-400 text-sm">{t('avg_gen_time', '平均生成时间')}</div>
          <div className="text-white text-lg font-bold">
            {warmupData.length > 0 
              ? Math.round(warmupData.reduce((acc, d) => acc + d.generationTime, 0) / warmupData.length * 100) / 100
              : 0}s
          </div>
        </div>
        
        <div className="bg-gray-700 p-3 rounded">
          <div className="text-green-400 text-sm">{t('avg_queue', '平均队列')}</div>
          <div className="text-white text-lg font-bold">
            {warmupData.length > 0 
              ? Math.round(warmupData.reduce((acc, d) => acc + d.queueLength, 0) / warmupData.length)
              : 0}
          </div>
        </div>
        
        <div className="bg-gray-700 p-3 rounded">
          <div className="text-yellow-400 text-sm">{t('avg_success', '平均成功率')}</div>
          <div className="text-white text-lg font-bold">
            {warmupData.length > 0 
              ? Math.round(warmupData.reduce((acc, d) => acc + d.successRate, 0) / warmupData.length)
              : 0}%
          </div>
        </div>
      </div>

      {/* 温度图表 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">
          {t('temperature_trend', '温度趋势')}
        </h3>
        <div className="h-64">
          {chartType === 'line' ? (
            <Line data={temperatureData} options={chartOptions} />
          ) : (
            <Bar data={temperatureData} options={chartOptions} />
          )}
        </div>
      </div>

      {/* 性能图表 */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">
          {t('performance_metrics', '性能指标')}
        </h3>
        <div className="h-64">
          {chartType === 'line' ? (
            <Line data={performanceData} options={chartOptions} />
          ) : (
            <Bar data={performanceData} options={chartOptions} />
          )}
        </div>
      </div>

      {/* 实时状态指示器 */}
      <div className="mt-6 flex justify-center">
        <div className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-full">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">
            {t('system_online', '系统在线')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WarmupChart;
