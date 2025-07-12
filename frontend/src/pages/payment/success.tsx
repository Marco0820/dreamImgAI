'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import PaymentResultPage from './result';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const PaymentSuccessPage = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    useEffect(() => {
        // Invalidate user query to refetch credits balance
        queryClient.invalidateQueries({ queryKey: ['user-status'] });

        const timer = setTimeout(() => {
            router.push('/generate');
        }, 3000); // 3-second delay before redirecting

        return () => clearTimeout(timer); // Cleanup timer on unmount
    }, [router, queryClient]);

    return <PaymentResultPage success={true} />;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
});

export default PaymentSuccessPage; 