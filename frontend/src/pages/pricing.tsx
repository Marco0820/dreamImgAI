import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { CheckIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';

const PricingPage: NextPage = () => {
  const { t } = useTranslation('common');
  const [isYearly, setIsYearly] = useState(true);
  const { data: session } = useSession();
  const [isPurchaseLoading, setIsPurchaseLoading] = useState<string | null>(null);
  const router = useRouter();

  const handlePurchase = async (priceId: string | null) => {
    if (!priceId) return;

    setIsPurchaseLoading(priceId);

    if (!session) {
      toast.info(t('login_required_to_purchase'));
      router.push('/login'); // Redirect to existing login page
      setIsPurchaseLoading(null);
      return;
    }

    try {
      const response = await axios.post('/api/creem/create-checkout-session', { priceId });
      const { checkout_url } = response.data;
      if (checkout_url) {
        window.location.href = checkout_url;
      } else {
        toast.error(t('error_creating_checkout'));
      }
    } catch (error) {
      console.error(error);
      const errorMessage = (error as any).response?.data?.detail || t('error_creating_checkout');
      toast.error(errorMessage);
    } finally {
      setIsPurchaseLoading(null);
    }
  };

  const tiers = [
    {
      name: 'pricing.premium.title',
      id: 'tier-premium',
      price: { monthly: '$12', yearly: '$10' },
      priceId: { monthly: 'prod_7YCG8QS6mq0BDo7r0HSxlY', yearly: 'prod_3SJPB99xXlLqnPcSGKAJ43' },
      priceSuffix: 'pricing.premium.period',
      description: {
        monthly: 'pricing.monthly_billing_note',
        yearly: 'pricing.yearly_billing_note',
      },
      features: [
        'pricing.premium.features.feature1',
        'pricing.premium.features.feature2',
        'pricing.premium.features.feature3',
        'pricing.premium.features.feature4',
      ],
      buttonText: 'pricing.premium.button',
      isMostPopular: false,
    },
    {
      name: 'pricing.ultimate.title',
      id: 'tier-ultimate',
      price: { monthly: '$25', yearly: '$20' },
      priceId: { monthly: 'prod_gIRFT5va12D75ntWw8NMv', yearly: 'prod_cUyhYlcv0bhCzyrI9siHi' },
      priceSuffix: 'pricing.ultimate.period',
      description: {
        monthly: 'pricing.monthly_billing_note',
        yearly: 'pricing.yearly_billing_note',
      },
      features: [
        'pricing.ultimate.features.feature1',
        'pricing.ultimate.features.feature2',
        'pricing.ultimate.features.feature3',
        'pricing.ultimate.features.feature4',
        'pricing.ultimate.features.feature5',
        'pricing.ultimate.features.feature6',
        'pricing.ultimate.features.feature7',
        'pricing.ultimate.features.feature8',
      ],
      buttonText: 'pricing.ultimate.button',
      isMostPopular: true,
    },
    {
      name: 'pricing.enterprise.title',
      id: 'tier-enterprise',
      price: { monthly: 'pricing.enterprise.price', yearly: 'pricing.enterprise.price' },
      priceId: { monthly: null, yearly: null },
      priceSuffix: '',
      description: { monthly: ' ', yearly: ' ' },
      features: [
        'pricing.enterprise.features.feature1',
        'pricing.enterprise.features.feature2',
        'pricing.enterprise.features.feature3',
        'pricing.enterprise.features.feature4',
        'pricing.enterprise.features.feature5',
        'pricing.enterprise.features.feature6',
      ],
      buttonText: 'pricing.enterprise.button',
      isMostPopular: false,
      isCustom: true,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-white">
      <Head>
        <title>{t('pricing.title')}</title>
      </Head>
      <main className="flex-grow py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">{t('pricing.title')}</h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">{t('pricing.subtitle')}</p>
          </div>

          <div className="mt-16 flex justify-center">
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">{t('pricing.monthly')}</span>
              <button
                type="button"
                className={clsx(
                  'relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
                  isYearly ? 'bg-amber-600' : 'bg-gray-700'
                )}
                role="switch"
                aria-checked={isYearly}
                onClick={() => setIsYearly(!isYearly)}
              >
                <span
                  aria-hidden="true"
                  className={clsx(
                    'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-gray-900 shadow ring-0 transition duration-200 ease-in-out',
                    isYearly ? 'translate-x-7' : 'translate-x-0'
                  )}
                />
              </button>
              <span className="text-gray-300">{t('pricing.yearly')}</span>
              <span className="ml-3 inline-flex items-center rounded-full bg-amber-600 px-3 py-1 text-sm font-medium text-white">
                {t('pricing.yearly_discount')}
              </span>
            </div>
          </div>

          <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 md:max-w-2xl md:grid-cols-2 lg:max-w-none lg:grid-cols-3">
            {tiers.map(tier => {
              const currentPriceId = isYearly ? tier.priceId.yearly : tier.priceId.monthly;
              return (
              <div
                key={tier.id}
                className={clsx(
                  'rounded-3xl p-8 ring-1 xl:p-10',
                  tier.isMostPopular ? 'ring-2 ring-yellow-400' : 'ring-gray-700',
                  tier.isCustom ? 'flex flex-col' : ''
                )}
              >
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className="text-lg font-semibold leading-8">{t(tier.name)}</h3>
                  {tier.isMostPopular && (
                    <p className="rounded-full bg-yellow-400/10 px-2.5 py-1 text-xs font-semibold leading-5 text-yellow-400">
                      {t('pricing.ultimate.badge')}
                    </p>
                  )}
                </div>
                <div className="flex-grow">
                  {tier.isCustom ? (
                    <div className="my-auto">
                      <p className="mt-6 flex items-baseline justify-center gap-x-2">
                        <span className="text-5xl font-bold tracking-tight">
                          {t(isYearly ? tier.price.yearly : tier.price.monthly)}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="mt-4 text-base leading-6 text-gray-300">
                        {t(isYearly ? tier.description.yearly : tier.description.monthly)}
                      </p>
                      <p className="mt-6 flex items-baseline gap-x-2">
                        <span className="text-5xl font-bold tracking-tight">
                          {isYearly ? tier.price.yearly : tier.price.monthly}
                        </span>
                        <span className="text-sm font-semibold leading-6 tracking-wide text-gray-300">
                          {t(tier.priceSuffix)}
                        </span>
                      </p>
                    </>
                  )}
                  <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-300 xl:mt-10">
                    {tier.features.map(feature => (
                      <li key={feature} className="flex gap-x-3">
                        <CheckIcon className="h-6 w-5 flex-none text-white" aria-hidden="true" />
                        {t(feature)}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => handlePurchase(currentPriceId)}
                  disabled={tier.isCustom || isPurchaseLoading === currentPriceId}
                  aria-describedby={tier.id}
                  className={clsx(
                    'mt-8 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold leading-6',
                    tier.isMostPopular
                      ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500 disabled:bg-yellow-300'
                      : 'bg-white/10 text-white hover:bg-white/20 disabled:bg-white/5',
                    tier.isCustom && 'cursor-not-allowed bg-gray-700',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                    tier.isMostPopular ? 'focus-visible:outline-yellow-400' : 'focus-visible:outline-white'
                  )}
                >
                  {tier.isCustom ? (
                      'Coming soon'
                    ) : isPurchaseLoading === currentPriceId ? (
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    ) : (
                      t(tier.buttonText)
                    )}
                </button>
              </div>
            );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default PricingPage;