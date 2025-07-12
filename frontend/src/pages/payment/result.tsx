import { NextPage } from 'next';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

const PaymentResultPage: NextPage<{ success: boolean }> = ({ success }) => {
    const { t } = useTranslation('common');

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-900 text-white text-center px-4">
            {success ? (
                <CheckCircle className="h-24 w-24 text-green-500" />
            ) : (
                <XCircle className="h-24 w-24 text-red-500" />
            )}
            <h1 className="mt-6 text-4xl font-bold">
                {success ? t('payment_success_title') : t('payment_cancelled_title')}
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-md">
                {success ? t('payment_success_desc') : t('payment_cancelled_desc')}
            </p>
            <Link href={success ? "/generate" : "/pricing"} className="mt-8">
                <button className={`px-6 py-3 text-white font-semibold rounded-md ${success ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-600 hover:bg-gray-700'}`}>
                    {success ? t('go_to_generation_page') : t('try_again_button')}
                </button>
            </Link>
        </div>
    );
};

export default PaymentResultPage; 