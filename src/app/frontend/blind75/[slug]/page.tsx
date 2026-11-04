import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import ProblemDetailClient from '@/app/problem/[slug]/ProblemDetailClient';
import Script from 'next/script';
import { headers } from 'next/headers';
import { Suspense } from 'react';

interface ProblemPageProps {
  params: Promise<{ slug: string }>;
}

async function getAlgorithm(slug: string) {
  let client = supabase;
  try {
    const { createClient } = await import('@/utils/supabase/server');
    client = await createClient();
  } catch (e) {
    // Falls back to browser client during build / static parameter generation
  }

  const { data, error } = await client
    .from('algorithms')
    .select('*')
    .eq('id', slug) // Existing logic uses ID as slug
    .eq('problem_type', 'frontend')
    .maybeSingle();

  if (error || !data) return null;

  // Gate behind feature flag
  const isFrontendEnabled = true; // Feature launched
  let isAdmin = false;
  try {
    const { createClient } = await import('@/utils/supabase/server');
    const supabaseServer = await createClient();

    const { data: { user } } = await supabaseServer.auth.getUser();
    if (user) {
      const { data: profile } = await supabaseServer
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      if (profile?.role === 'admin') {
        isAdmin = true;
      }
    }
  } catch (e) {
    // Fallback for build time
  }

  if (!isFrontendEnabled && !isAdmin) {
    return null;
  }

  // Enforce published check on server side.
  // RLS might filter it, but we add an explicit check to be extremely robust.
  if (data.published === false) {
    let isAdmin = false;
    try {
      const { createClient } = await import('@/utils/supabase/server');
      const supabaseServer = await createClient();
      const { data: { user } } = await supabaseServer.auth.getUser();
      if (user) {
        const { data: profile } = await supabaseServer
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        if (profile?.role === 'admin') {
          isAdmin = true;
        }
      }
    } catch (e) {
      // Build time or failed session retrieval
    }

    if (!isAdmin) {
      return null;
    }
  }

  const metadata = data.metadata || {};
  const metadataObj = (typeof metadata === 'object' && metadata !== null ? metadata : {}) as Record<string, any>;
  
  return {
    ...data,
    ...metadataObj,
    metadata: data.metadata,
    slug: data.id, 
  };
}

export async function generateStaticParams() {
  let { data: algorithms, error } = await supabase
    .from('algorithms')
    .select('id')
    .eq('problem_type', 'frontend')
    .eq('published', true);

  if (error) {
    console.warn('Failed to query static parameters with published = true, falling back to selecting all:', error.message);
    const { data: fallbackAlgos } = await supabase
      .from('algorithms')
      .eq('problem_type', 'frontend')
      .select('id');
    algorithms = fallbackAlgos;
  }

  if (!algorithms) return [];

  return algorithms.map((algo) => ({
    slug: algo.id,
  }));
}

export async function generateMetadata({ params }: ProblemPageProps): Promise<Metadata> {
  const { slug } = await params;
  const algorithm = await getAlgorithm(slug);

  if (!algorithm) {
    return {
      title: 'Problem Not Found | Frontend - RulCode',
    };
  }

  const baseTitle = `${algorithm.name} Visualizer & Solution | Frontend - RulCode`;
  const cleanTitle = baseTitle.length > 60 ? `${algorithm.name} | Frontend - RulCode` : baseTitle;

  const baseDesc = algorithm.description || `Learn and visualize ${algorithm.name} with interactive examples and code solutions.`;
  const cleanDesc = baseDesc.length > 155 ? `${baseDesc.substring(0, 152)}...` : baseDesc;

  return {
    title: cleanTitle,
    description: cleanDesc,
    keywords: `${algorithm.category || ''}, algorithms, ${algorithm.name}, coding interview, visualization`,
    alternates: {
      canonical: `/frontend/blind75/${algorithm.id}`,
    },
    openGraph: {
      title: cleanTitle,
      description: cleanDesc,
      images: [algorithm.image || 'https://rulcode.com/og-image.png'],
      url: `/frontend/blind75/${algorithm.id}`,
    },
  };
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const { slug } = await params;
  const algorithm = await getAlgorithm(slug);

  if (!algorithm) {
    notFound();
  }

  const reqHeaders = await headers();
  const userAgent = reqHeaders.get('user-agent') || '';
  const isCrawler = /bot|google|baidu|bing|msn|duckduckbot|teoma|slurp|yandex/i.test(userAgent);

  // Generate dynamic BreadcrumbList Schema
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://rulcode.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Algorithms",
        "item": "https://rulcode.com/dsa/problems"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": algorithm.name,
        "item": `https://rulcode.com/frontend/blind75/${algorithm.id}`
      }
    ]
  };

  // Extract source code implementations for SoftwareSourceCode Schema
  const codeSnippets: any[] = [];
  if (Array.isArray(algorithm.implementations)) {
    algorithm.implementations.forEach((impl: any) => {
      const lang = impl?.lang || '';
      if (Array.isArray(impl?.code)) {
        impl.code.forEach((codeObj: any) => {
          if (codeObj?.code) {
            codeSnippets.push({
              "@context": "https://schema.org",
              "@type": "SoftwareSourceCode",
              "programmingLanguage": lang,
              "codeSampleType": codeObj.codeType || "Optimal Solution",
              "text": codeObj.code,
              "description": codeObj.explanationBefore || `${algorithm.name} implementation in ${lang}`
            });
          }
        });
      }
    });
  }

  // Generate dynamic TechArticle Schema
  const techArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": `${algorithm.name} Algorithm - Visualization & Solution`,
    "description": algorithm.description || `Learn and visualize ${algorithm.name} algorithm step-by-step with interactive visualizations.`,
    "image": algorithm.image || 'https://rulcode.com/og-image.png',
    "inLanguage": "en",
    "datePublished": algorithm.created_at || "2026-01-01T00:00:00Z",
    "dateModified": algorithm.updated_at || algorithm.created_at || "2026-01-01T00:00:00Z",
    "category": algorithm.category || "Data Structures & Algorithms",
    "author": {
      "@type": "Organization",
      "name": "Rulcode.com Team",
      "url": "https://rulcode.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Rulcode.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://rulcode.com/android-chrome-512x512.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://rulcode.com/frontend/blind75/${algorithm.id}`
    },
    "about": {
      "@type": "Thing",
      "name": algorithm.name,
      "description": algorithm.description
    },
    "proficiencyLevel": algorithm.difficulty || "Medium",
    "hasPart": codeSnippets.length > 0 ? codeSnippets : undefined
  };

  return (
    <>
      <Script
        id={`problem-breadcrumb-json-ld-${algorithm.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id={`problem-article-json-ld-${algorithm.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleJsonLd) }}
      />
      <Suspense fallback={<div>Loading problem details...</div>}>
        <ProblemDetailClient 
          initialAlgorithm={algorithm} 
          slug={slug} 
          isCrawler={isCrawler}
        />
      </Suspense>
    </>
  );
}
