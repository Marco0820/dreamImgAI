'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check } from 'lucide-react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

const PricingPage = () => {
  const { t } = useTranslation('common');
  const [isYearly, setIsYearly] = useState(true);

  const pricingPlans = {
    monthly: [
      { name: t('plan_premium_name'), price: t('plan_premium_price_monthly'), period: t('plan_premium_period_monthly'), features: [t('plan_premium_feature1'), t('plan_premium_feature2'), t('plan_premium_feature3'), t('plan_premium_feature4')], buttonText: t('plan_premium_button'), isPopular: false, isCustom: false },
      { name: t('plan_ultimate_name'), price: t('plan_ultimate_price_monthly'), period: t('plan_ultimate_period_monthly'), features: [t('plan_ultimate_feature1'), t('plan_ultimate_feature2'), t('plan_ultimate_feature3'), t('plan_ultimate_feature4'), t('plan_ultimate_feature5'), t('plan_ultimate_feature6'), t('plan_ultimate_feature7'), t('plan_ultimate_feature8')], buttonText: t('plan_ultimate_button'), isPopular: true, isCustom: false },
      { name: t('plan_enterprise_name'), price: t('plan_enterprise_price'), period: t('plan_enterprise_period'), features: [t('plan_enterprise_feature1'), t('plan_enterprise_feature2'), t('plan_enterprise_feature3'), t('plan_enterprise_feature4'), t('plan_enterprise_feature5'), t('plan_enterprise_feature6')], buttonText: t('plan_enterprise_button'), isPopular: false, isCustom: true },
    ],
    yearly: [
      { name: t('plan_premium_name'), price: t('plan_premium_price_yearly'), period: t('plan_premium_period_yearly'), features: [t('plan_premium_feature1'), t('plan_premium_feature2'), t('plan_premium_feature3'), t('plan_premium_feature4')], buttonText: t('plan_premium_button'), isPopular: false, isCustom: false },
      { name: t('plan_ultimate_name'), price: t('plan_ultimate_price_yearly'), period: t('plan_ultimate_period_yearly'), features: [t('plan_ultimate_feature1'), t('plan_ultimate_feature2'), t('plan_ultimate_feature3'), t('plan_ultimate_feature4'), t('plan_ultimate_feature5'), t('plan_ultimate_feature6'), t('plan_ultimate_feature7'), t('plan_ultimate_feature8')], buttonText: t('plan_ultimate_button'), isPopular: true, isCustom: false },
      { name: t('plan_enterprise_name'), price: t('plan_enterprise_price'), period: t('plan_enterprise_period'), features: [t('plan_enterprise_feature1'), t('plan_enterprise_feature2'), t('plan_enterprise_feature3'), t('plan_enterprise_feature4'), t('plan_enterprise_feature5'), t('plan_enterprise_feature6')], buttonText: t('plan_enterprise_button'), isPopular: false, isCustom: true },
    ],
  };

  const faqItems = Array.from({ length: 10 }, (_, i) => ({
    question: t(`pricing_faq${i + 1}_q`),
    answer: t(`pricing_faq${i + 1}_a`),
  }));

  const plans = isYearly ? pricingPlans.yearly : pricingPlans.monthly;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold">{t('pricing_title')}</h1>
        <p className="mt-4 text-lg text-gray-400">{t('pricing_subtitle')}</p>
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center justify-center p-1 rounded-full bg-stone-800/60">
            <Button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                !isYearly ? 'bg-amber-400 text-stone-900' : 'bg-transparent text-white hover:bg-stone-700/50'
              }`}
            >
              {t('pricing_monthly')}
            </Button>
            <Button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                isYearly ? 'bg-amber-400 text-stone-900' : 'bg-transparent text-white hover:bg-stone-700/50'
              }`}
            >
              {t('pricing_yearly')} <span className="hidden md:inline">({t('pricing_yearly_save')})</span>
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        {plans.map((plan) => (
          <div key={plan.name} className={`rounded-2xl p-8 border ${plan.isPopular ? 'border-yellow-400' : 'border-gray-700'} bg-gray-800/50 flex flex-col`}>
            <div className="flex-grow">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold">{plan.name}</h3>
                {plan.isPopular && <span className="bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full">{t('pricing_popular')}</span>}
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-400">{plan.period}</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">{plan.isCustom ? '' : t('pricing_billed_annually')}</p>
              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button className={`w-full mt-8 ${plan.isPopular ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'bg-gray-600 hover:bg-gray-700'}`}>
              {plan.buttonText}
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center">{t('pricing_faq_title')}</h2>
        <p className="mt-4 text-lg text-gray-400 text-center">{t('pricing_faq_subtitle')}</p>
        <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto mt-8">
            {faqItems.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common', 'pricing'])),
  },
});

export default PricingPage;