import HeroSection from "@/components/home/HeroSection";
import AiCapabilities from "@/components/home/AiCapabilities";
import HotWorks from "@/components/home/HotWorks";
import CreationFlow from "@/components/home/CreationFlow";
import DataWall from "@/components/home/DataWall";
import FinalCta from "@/components/home/FinalCta";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AiCapabilities />
      <HotWorks />
      <CreationFlow />
      <DataWall />
      <FinalCta />
    </>
  );
}
