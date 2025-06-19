import { type NextPage, GetStaticProps } from "next";
import HeroSection from "@/components/landing/HeroSection";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import FeaturesSection from '../components/landing/FeaturesSection';
import FaqSection from '../components/landing/FaqSection';
import SDXLGenerator from "@/components/SDXLGenerator";

const HomePage: NextPage = () => {
  return (
    <>
      <div className="transform -translate-y-2.5">
        <HeroSection />
      </div>
      <div className="-mt-12">
        <SDXLGenerator />
      </div>
      <FeaturesSection />
      <FaqSection />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || 'en', ['common', 'home'])),
  },
});

export default HomePage; 