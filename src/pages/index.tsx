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
      description="Fast, Rails-compatible web framework for Ruby with fiber-based concurrency. Build high-performance APIs and real-time applications with familiar syntax."
    >
      <div className="homepage">
        <Hero />
        <Features />
        <Benchmarks />
        <CodeExamples />
        <UseCases />
        <Timeline />
        <CTA />
      </div>
    </Layout>
  );
}
