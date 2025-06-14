'use client';
import { useState } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';

const faqs = [
    {
        question: 'DreamImg AI 是什么以及它是如何工作的？',
        answer: 'DreamImg AI 是全球首个完全免费、无限制的 AI 图像生成器，由 FLUX.1-Dev 模型提供支持。它允许您无需任何注册或使用限制，即可从文本描述中创建高质量的图像。',
    },
    {
        question: 'DreamImg AI 真的可以免费使用吗？',
        answer: '是的，DreamImg AI 完全免费使用！我们致力于成为世界上最大、最强大的免费 AI 图像生成器。没有隐藏费用，无需信用卡，也没有使用限制。',
    },
    {
        question: '是什么让 DreamImg AI 与其他 AI 图像生成器不同？',
        answer: 'DreamImg AI 是唯一提供对强大的 FLUX.1-Dev 模型无限制免费访问的平台。我们提供卓越的图像质量、快速的生成速度和完全的隐私保护，所有这些都无需任何费用或注册要求。',
    },
    {
        question: '我需要创建帐户才能使用 DreamImg AI 吗？',
        answer: '不，您不需要创建帐户或注册。只需访问我们的网站，立即开始生成图像。我们相信让每个人都能无障碍地使用 AI。',
    },
    {
        question: '我可以用 DreamImg AI 创作什么类型的图像？',
        answer: '您可以创作各种各样的图像，包括照片级真实感场景、艺术插图、数字艺术、动漫风格图像等等。FLUX.1-Dev 模型擅长理解复杂的提示并生成多样的视觉风格。',
    },
    {
        question: 'DreamImg AI 如何保护我的隐私？',
        answer: '我们非常重视隐私。我们不会在我们的服务器上存储您的提示或生成的图像，也不需要任何个人信息。您的创作完全保密，并在生成后删除。',
    },
];

const FaqSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="py-20">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold">常见问题</h2>
                    <p className="text-lg text-gray-400 mt-2">在这里找到您问题的答案。</p>
                </div>
                <div className="max-w-3xl mx-auto">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border-b border-gray-700 py-4">
                            <button
                                className="w-full flex justify-between items-center text-left"
                                onClick={() => toggleFaq(index)}
                            >
                                <h3 className="text-xl font-bold">{faq.question}</h3>
                                {openIndex === index ? <FaMinus /> : <FaPlus />}
                            </button>
                            {openIndex === index && (
                                <div className="mt-4 text-gray-400">
                                    <p>{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FaqSection; 