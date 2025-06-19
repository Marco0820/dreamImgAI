import { FaGift, FaStar, FaLock, FaBolt, FaShieldAlt, FaPalette } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';

const FeaturesSection = () => {
    const { t } = useTranslation('common');

    const features = [
        {
            icon: <FaGift className="h-8 w-8 text-yellow-400" />,
            title: t('feature_creation_title'),
            description: t('feature_creation_desc'),
        },
        {
            icon: <FaStar className="h-8 w-8 text-yellow-400" />,
            title: t('feature_quality_title'),
            description: t('feature_quality_desc'),
        },
        {
            icon: <FaLock className="h-8 w-8 text-yellow-400" />,
            title: t('feature_text_title'),
            description: t('feature_text_desc'),
        },
        {
            icon: <FaBolt className="h-8 w-8 text-yellow-400" />,
            title: t('feature_speed_title'),
            description: t('feature_speed_desc'),
        },
        {
            icon: <FaShieldAlt className="h-8 w-8 text-yellow-400" />,
            title: t('feature_privacy_title'),
            description: t('feature_privacy_desc'),
        },
        {
            icon: <FaPalette className="h-8 w-8 text-yellow-400" />,
            title: t('feature_style_title'),
            description: t('feature_style_desc'),
        },
    ];

    return (
        <section id="features" className="py-20">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold">{t('features_title')}</h2>
                    <p className="text-lg text-gray-400 mt-2">{t('features_subtitle')}</p>
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