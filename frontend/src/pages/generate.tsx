import { type NextPage, GetStaticProps } from "next";
import SDXLGenerator from "@/components/SDXLGenerator";
import Layout from "@/components/Layout";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const GeneratePage: NextPage = () => {
    return (
        <Layout>
            <SDXLGenerator />
        </Layout>
    );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
});

export default GeneratePage; 