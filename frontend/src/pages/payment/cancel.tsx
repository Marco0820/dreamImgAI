import PaymentResultPage from './result';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const PaymentCancelPage = () => {
    return <PaymentResultPage success={false} />;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
});


export default PaymentCancelPage; 