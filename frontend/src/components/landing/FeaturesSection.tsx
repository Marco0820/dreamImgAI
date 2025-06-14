import { FaGift, FaStar, FaLock, FaBolt, FaShieldAlt, FaPalette } from 'react-icons/fa';

const features = [
    {
        icon: <FaGift className="h-8 w-8 text-yellow-400" />,
        title: '零成本创作',
        description: '全球首个完全免费的AI图像生成器，无使用限制或注册要求。',
    },
    {
        icon: <FaStar className="h-8 w-8 text-yellow-400" />,
        title: '顶尖质量',
        description: '由FLUX.1-Dev模型驱动，提供具有卓越细节和艺术风格控制的照片级图像。',
    },
    {
        icon: <FaLock className="h-8 w-8 text-yellow-400" />,
        title: '高级文本理解',
        description: '卓越的文本到图像功能，能够准确解释复杂的提示和文本叠加功能。',
    },
    {
        icon: <FaBolt className="h-8 w-8 text-yellow-400" />,
        title: '闪电般的生成速度',
        description: '优化的推理流程，确保在不影响质量的情况下快速生成图像。',
    },
    {
        icon: <FaShieldAlt className="h-8 w-8 text-yellow-400" />,
        title: '增强的隐私保护',
        description: '零数据保留政策 - 您的提示和生成的图像绝不会存储在我们的服务器上。',
    },
    {
        icon: <FaPalette className="h-8 w-8 text-yellow-400" />,
        title: '多风格支持',
        description: '创作各种艺术风格的图像，从照片写实到动漫、油画到数字艺术。',
    },
];

const FeaturesSection = () => {
    return (
        <section id="features" className="py-20">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold">DreamImg AI 的主要特点</h2>
                    <p className="text-lg text-gray-400 mt-2">体验下一代人工智能图像生成 - 强大、免费且注重隐私。</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-gray-800 p-6 rounded-lg">
                            <div className="flex items-center mb-4">
                                {feature.icon}
                                <h3 className="ml-4 text-xl font-bold">{feature.title}</h3>
                            </div>
                            <p className="text-gray-400">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection; 