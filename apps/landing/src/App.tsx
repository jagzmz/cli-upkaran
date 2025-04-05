import React from 'react';
import { Layout } from './components/layout/Layout';
import { HeroSection } from './components/sections/HeroSection';
import { FeaturesSection } from './components/sections/FeaturesSection';
import { ArchitectureSection } from './components/sections/ArchitectureSection';
import { UseCasesSection } from './components/sections/UseCasesSection';
import { EcosystemSection } from './components/sections/EcosystemSection';
import { GettingStartedSection } from './components/sections/GettingStartedSection';

function App() {
  return (
    <Layout>
      <HeroSection />
      <FeaturesSection />
      <ArchitectureSection />
      <UseCasesSection />
      <EcosystemSection />
      <GettingStartedSection />
    </Layout>
  );
}

export default App;
