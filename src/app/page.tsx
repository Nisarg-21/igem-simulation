import Band from "@/components/Band";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BuildIntro from "@/components/BuildIntro";
import StoryFrame from "@/components/StoryFrame";
import Glossary from "@/components/Glossary";

export default function Home() {
  return (
    <main>
      <Band />
      <Navbar />
      <Hero />
      <Band />
      <BuildIntro />
      <StoryFrame />
      <Glossary />
    </main>
  );
}
