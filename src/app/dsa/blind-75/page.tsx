import { Metadata } from 'next';
import { Suspense } from 'react';
import ProblemsClient from '../problems/ProblemsClient';
import { Brain } from 'lucide-react';
import { ListType } from '@/types/algorithm';

export const metadata: Metadata = {
  title: "Blind 75 LeetCode Problems - RulCode",
  description: "The definitive list of 75 essential problems designed to maximize your preparation in minimal time. Focus on the most frequent FAANG interview questions.",
  openGraph: {
    title: "Blind 75 Collection - RulCode",
    description: "Master 75 essential problems with interactive visualizations.",
    url: 'https://rulcode.com/dsa/blind-75',
  },
  alternates: {
    canonical: 'https://rulcode.com/dsa/blind-75',
  },
};

export default function Blind75Page() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Suspense fallback={<div className="p-8 animate-pulse">Loading Blind 75...</div>}>
        <ProblemsClient 
          listType={ListType.Blind75}
          title="Blind 75 Problems"
          description="The definitive list of 75 essential problems designed to maximize your preparation in minimal time. Focus on the most frequent FAANG interview questions to ensure you're ready for the highest-level technical assessments."
          progressTitle="Blind 75 Progress"
          icon="brain"
        />
      </Suspense>
    </div>
  );
}
