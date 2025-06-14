import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import FaqSection from '../components/landing/FaqSection';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { type NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <FaqSection />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common'])),
  },
});

export default Home; 