import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import EducationPaths from "@/components/EducationPaths";
import SubjectAreas from "@/components/SubjectAreas";
import CTABanner from "@/components/CTABanner";
import DonationSection from "@/components/DonationSection";
import Footer from "@/components/Footer";
import { hashPassword } from "@/lib/auth";

export default function Page() {
  return (
    <>
      <Navbar />
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