import { useState } from 'react';
import { useSelector } from 'react-redux';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { RootState } from '../store';
import { FaCheck } from 'react-icons/fa';
import api from '../lib/api'; 
import { Switch } from '@headlessui/react';
import { GetStaticProps } from 'next';

const PricingPage = () => {
    const { token } = useSelector((state: RootState) => state.auth);
    const { t } = useTranslation('common');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

    const plans = {
        monthly: [
            {
                name: "高级版",
                price: "10",
                priceId: "price_1PflApDEQaroOh6oVp8EUPp9", // Replace with your actual monthly premium price ID
                features: ["无限图像生成", "快速生成（5倍速度）", "无广告", "无水印"]
            },
            {
                name: "Ultimate",
                price: "20",
                priceId: "price_1PflBqDEQaroOh6onNC4fSAt", // Replace with your actual monthly ultimate price ID
                isPopular: true,
                features: ["无限图像生成", "最快生成", "无广告", "无水印", "高级优化功能", "私有生成", "✨ 高清图像生成", "提前体验新功能"]
            }
        ],
        yearly: [
            {
                name: "高级版",
                price: "8", // Example yearly price
                priceId: "price_YEARLY_PREMIUM_ID", // Replace with your actual yearly premium price ID
                features: ["无限图像生成", "快速生成（5倍速度）", "无广告", "无水印"]
            },
            {
                name: "Ultimate",
                price: "16", // Example yearly price
                priceId: "price_YEARLY_ULTIMATE_ID", // Replace with your actual yearly ultimate price ID
                isPopular: true,
                features: ["无限图像生成", "最快生成", "无广告", "无水印", "高级优化功能", "私有生成", "✨ 高清图像生成", "提前体验新功能"]
            }
        ]
    };
    
    const enterprisePlan = {
        name: "Enterprise",
        price: "自定义",
        features: ["完全隐私", "自定义模型", "自定义集成", "专门支持", "API访问", "大批量"]
    };

    const handleSelectPlan = async (priceId: string) => {
        if (!token) {
            setError('请先登录以选择套餐。');
            return;
        }
        if (!priceId || priceId.includes("REPLACE")) {
            setError('此套餐计划即将推出，敬请期待。');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/subscriptions/create-checkout-session', { priceId });
            const { url } = response.data;
            window.location.href = url;
        } catch (err: any) {
            setError(err.response?.data?.detail || '创建支付会话失败。');
            setIsLoading(false);
        }
    };
    
    const currentPlans = plans[billingCycle];

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 bg-[#040d21] text-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">选择您的套餐</h1>
                    <p className="mt-3 text-xl text-gray-300 sm:mt-5">通过更快的生成和商业用途获得 DreamImg AI 的最佳体验</p>
                </div>

                <div className="mt-10 flex justify-center items-center space-x-4">
                    <span>每月</span>
                    <Switch
                        checked={billingCycle === 'yearly'}
                        onChange={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                        className={`${
                            billingCycle === 'yearly' ? 'bg-yellow-500' : 'bg-gray-700'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                    >
                        <span
                            className={`${
                                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                    </Switch>
                    <span>每年</span>
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-yellow-200 text-yellow-800">
                        节省 20%
                    </span>
                </div>
                
                {error && <p className="text-red-400 text-center mt-6">{error}</p>}

                <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-8">
                    {currentPlans.map(plan => (
                        <div key={plan.name} className={`rounded-2xl p-8 flex flex-col ${plan.isPopular ? 'border-2 border-yellow-500 bg-gray-800' : 'bg-gray-800/50 border border-gray-700'}`}>
                            {plan.isPopular && <div className="absolute top-0 -translate-y-1/2 right-1/2 translate-x-1/2 px-3 py-1 text-sm text-black bg-yellow-400 rounded-full font-semibold">最受欢迎</div>}
                            <h3 className="text-2xl font-semibold leading-8">{plan.name}</h3>
                            <div className="mt-6 flex items-baseline gap-x-1">
                                <span className="text-5xl font-bold tracking-tight">${plan.price}</span>
                                <span className="text-sm font-semibold leading-6 text-gray-400">/月</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-400">按年计费</p>
                            <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-300 flex-grow">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex gap-x-3">
                                        <FaCheck className="h-6 w-5 flex-none text-yellow-400" aria-hidden="true" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={() => handleSelectPlan(plan.priceId)} className={`mt-8 block rounded-md py-3 px-3 text-center text-sm font-semibold leading-6 ${plan.isPopular ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                                升级到 {plan.name}
                            </button>
                        </div>
                    ))}
                    
                    {/* Enterprise Plan */}
                    <div className="rounded-2xl bg-gray-800/50 border border-gray-700 p-8 flex flex-col">
                        <h3 className="text-2xl font-semibold leading-8">Enterprise</h3>
                        <p className="mt-4 text-5xl font-bold tracking-tight text-white">{enterprisePlan.price}</p>
                        <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-300 flex-grow">
                            {enterprisePlan.features.map(feature => (
                                <li key={feature} className="flex gap-x-3">
                                    <FaCheck className="h-6 w-5 flex-none text-yellow-400" aria-hidden="true" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <button disabled className="mt-8 block rounded-md py-3 px-3 text-center text-sm font-semibold leading-6 bg-gray-700 text-white opacity-50 cursor-not-allowed">
                            即将推出
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
      props: {
        ...(await serverSideTranslations(locale ?? 'en', ['common'])),
      },
    };
};

export default PricingPage; 