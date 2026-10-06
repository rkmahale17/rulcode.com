"use client";

import Link from "next/link";
import { Github, Heart, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { FooterYear } from "./FooterYear";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">RulCode</h3>
            <p className="text-sm text-muted-foreground">
              Open-source platform to learn, visualize, and master algorithms.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="w-4 h-4 text-red-500" />
              <span>100% Developer Centric</span>
            </div>
          </div>

          {/* Practice & Learn */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Practice & Learn</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/guides/time-complexity" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Learn
                </Link>
              </li>
              <li>
                <Link href="/dsa/problems" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Problems
                </Link>
              </li>
              <li>
                <Link href="/dsa/visual-library" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Visual Library
                </Link>
              </li>
              <li>
                <Link 
                  href="/dsa/core" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={(e) => {
                    if (typeof window !== 'undefined' && (window as any).gtagSendEvent) {
                      e.preventDefault();
                      (window as any).gtagSendEvent('/dsa/core');
                    }
                  }}
                >
                  Roadmaps
                </Link>
              </li>
              <li>
                <Link href="/dsa/blind-75" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Blind 75
                </Link>
              </li>
              <li>
                <Link href="/dsa/rulcode-150" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Rulcode 150
                </Link>
              </li>
              <li>
                <Link href="/database" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  SQL
                </Link>
              </li>
              <li>
                <Link 
                  href="/guides" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={(e) => {
                    if (typeof window !== 'undefined' && (window as any).gtagSendEvent) {
                      e.preventDefault();
                      (window as any).gtagSendEvent('/guides');
                    }
                  }}
                >
                  Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Community</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/rkmahale17/rulcode.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  <Github className="w-3 h-3" />
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/rkmahale17/rulcode.com/issues/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Report Issue
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/rkmahale17/rulcode.com#-contribute"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contribute
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/content-rights" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Content Rights
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-center sm:items-start gap-2">
              <p className="text-sm text-muted-foreground text-center sm:text-left">
                © <FooterYear /> RulCode. Open source.
              </p>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 text-xs text-muted-foreground">
                <a
                  href="https://neetcode.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  With Neetcode videos
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="hidden sm:inline">•</span>
                <a
                  href="https://jsonmaster.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  Recommended: JSONMaster.com
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://github.com/rkmahale17/rulcode.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  Star on GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
