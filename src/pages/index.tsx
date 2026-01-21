import React from "react"
import type {ReactNode} from "react"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Hero from "@site/src/components/Home/Hero";
import Features from "@site/src/components/Home/Features";
import Benchmarks from "@site/src/components/Home/Benchmarks";
import CodeExamples from "@site/src/components/Home/CodeExamples";
import UseCases from "@site/src/components/Home/UseCases";
import Timeline from "@site/src/components/Home/Timeline";
import CTA from "@site/src/components/Home/CTA";

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext()

  return (
    <Layout
      title={`${siteConfig.title} - ${siteConfig.tagline}`}
      description="Build high-concurrency APIs, WebSockets, and background jobs in a single process. The Rails-compatible framework for modern, real-time architectures."
    >
      <div className="homepage">
        <Hero />
        <Features />
        <CodeExamples />
        <Benchmarks />
        <UseCases />
        <Timeline />
        <CTA />
      </div>
    </Layout>
  );
}
