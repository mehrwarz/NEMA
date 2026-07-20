import Hero from "@/components/Hero";
import EducationPaths from "@/components/EducationPaths";
import SubjectAreas from "@/components/SubjectAreas";
import CTABanner from "@/components/CTABanner";
import DonationSection from "@/components/DonationSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";


export default async function Page() {
  return (
    <>
      <Header/>
      <main>
        <Hero />
        <EducationPaths />
        <SubjectAreas />
        <CTABanner />
        <DonationSection />
      </main>
      <Footer />
    </>
  );
}