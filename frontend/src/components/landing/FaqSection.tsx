'use client';
import { useState } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';

const FaqSection = () => {
    const { t } = useTranslation('common');
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        {
            question: t('faq1_question'),
            answer: t('faq1_answer'),
        },
        {
            question: t('faq2_question'),
            answer: t('faq2_answer'),
        },
        {
            question: t('faq3_question'),
            answer: t('faq3_answer'),
        },
        {
            question: t('faq4_question'),
            answer: t('faq4_answer'),
        },
        {
            question: t('faq5_question'),
            answer: t('faq5_answer'),
        },
        {
            question: t('faq6_question'),
            answer: t('faq6_answer'),
        },
    ];

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="py-20">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold">{t('faq_title')}</h2>
                    <p className="text-lg text-gray-400 mt-2">{t('faq_subtitle')}</p>
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