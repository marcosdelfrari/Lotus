import { LotusAnalyticsShowcase } from "@/app/components/lotus/analytics-showcase";
import { LotusBenefits } from "@/app/components/lotus/benefits";
import { LotusFinalCta } from "@/app/components/lotus/final-cta";
import { LotusFooter } from "@/app/components/lotus/footer";
import { LotusHero } from "@/app/components/lotus/hero";
import { LotusHowItWorks } from "@/app/components/lotus/how-it-works";
import { LotusManifesto } from "@/app/components/lotus/manifesto";
import { LotusMotionRoot } from "@/app/components/lotus/motion";
import { LotusOperation } from "@/app/components/lotus/operation";

export function LotusLandingPage() {
  return (
    <LotusMotionRoot>
      <div className="min-h-screen bg-background text-foreground">
        <main>
          <LotusHero />
          <LotusManifesto />
          <LotusBenefits />
          <LotusAnalyticsShowcase />
          <LotusOperation />
          <LotusHowItWorks />
          <LotusFinalCta />
        </main>
        <LotusFooter />
      </div>
    </LotusMotionRoot>
  );
}
