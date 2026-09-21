import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Projects from "@/components/sections/Projects";
import TechStack from "@/components/sections/TechStack";
import Stats from "@/components/sections/Stats";
import Contact from "@/components/sections/Contact";
import BeadCurtain from "@/components/ui/BeadCurtain";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <About />
      <Projects />
      <TechStack />
      <Stats />
      <Contact />
      <BeadCurtain />
    </div>
  );
}
