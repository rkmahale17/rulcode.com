"use client";

import { PenTool, ArrowRight, Book } from "lucide-react";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePostHog } from "@posthog/react";
import { trackEvent } from "@/lib/analytics";
import { Caveat } from "next/font/google";

const caveat = Caveat({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-caveat",
    display: "swap",
});

const getWobblyRect = (x: number, y: number, w: number, h: number, seed = 0) => {
    const offset1 = ((seed * 3) % 4) - 2;
    const offset2 = ((seed * 7) % 5) - 2;
    const offset3 = ((seed * 11) % 4) - 2;
    const offset4 = ((seed * 13) % 5) - 2;
    
    const x1 = x + offset1;
    const y1 = y + offset2;
    const x2 = x + w + offset3;
    const y2 = y + offset4;
    const x3 = x + w + offset2;
    const y3 = y + h + offset1;
    const x4 = x + offset4;
    const y4 = y + h + offset3;

    return `M ${x1} ${y1} 
            C ${x + w/3} ${y - 1 + offset2}, ${x + 2*w/3} ${y + 1 + offset1}, ${x2} ${y2}
            C ${x + w + 1 + offset3} ${y + h/3}, ${x + w + offset4} ${y + 2*h/3 + offset4}, ${x3} ${y3}
            C ${x + 2*w/3} ${y + h + 1 + offset2}, ${x + w/3} ${y + h - 1 + offset3}, ${x4} ${y4}
            C ${x - 1 + offset1} ${y + 2*h/3}, ${x + offset2} ${y + h/3 + offset2}, ${x1} ${y1}
            M ${x1 - 1} ${y1 + 1}
            C ${x + w/3} ${y + offset2}, ${x + 2*w/3} ${y + offset2}, ${x2 + 1} ${y2 - 1}`;
};

const getWobblyCircle = (cx: number, cy: number, r: number, seed = 0) => {
    const o1 = ((seed * 3) % 4) - 2;
    const o2 = ((seed * 7) % 5) - 2;
    const o3 = ((seed * 11) % 4) - 2;
    const o4 = ((seed * 13) % 5) - 2;

    return `M ${cx} ${cy - r + o1} 
            C ${cx + r + o2} ${cy - r + o3}, ${cx + r + o4} ${cy + r + o1}, ${cx} ${cy + r + o2}
            C ${cx - r + o3} ${cy + r + o4}, ${cx - r + o1} ${cy - r + o2}, ${cx} ${cy - r + o1}
            C ${cx + r/2} ${cy - r + 1}, ${cx + r} ${cy - r/2}, ${cx + r - 1} ${cy + 1}`;
};

const getWobblyArrow = (x1: number, y1: number, x2: number, y2: number, controlOffset = 8) => {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx*dx + dy*dy);
    const px = -dy / (len || 1) * controlOffset;
    const py = dx / (len || 1) * controlOffset;
    const cx = mx + px;
    const cy = my + py;

    const angle = Math.atan2(y2 - cy, x2 - cx);
    const arrowLength = 12;
    const arrowAngle = Math.PI / 6;

    const ax1 = x2 - arrowLength * Math.cos(angle - arrowAngle);
    const ay1 = y2 - arrowLength * Math.sin(angle - arrowAngle);
    const ax2 = x2 - arrowLength * Math.cos(angle + arrowAngle);
    const ay2 = y2 - arrowLength * Math.sin(angle + arrowAngle);

    return `M ${x1} ${y1} C ${x1 + (cx-x1)/2} ${y1 + (cy-y1)/2}, ${cx} ${cy}, ${x2} ${y2}
            M ${x2} ${y2} C ${x2 - 1} ${y2 - 1}, ${ax1} ${ay1}, ${ax1} ${ay1}
            M ${x2} ${y2} C ${x2 - 1} ${y2 + 1}, ${ax2} ${ay2}, ${ax2} ${ay2}`;
};

export function ScratchpadSection() {
    const posthog = usePostHog();

    return (
        <section className="py-16 lg:py-24 bg-white dark:bg-black">
            <div className="w-full max-w-[1200px] mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    <div className="order-2 lg:order-1">
                        <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-8 text-gray-900 dark:text-white leading-[1.1]">
                            Stuck in thinking? Try our Thinkpad
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg mb-10 leading-relaxed">
                            Sometimes code isn&apos;t enough. Our built-in Thinkpad, powered by your favorite drawing tool <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">Excalidraw</strong>, lets you <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">draw, sketch</strong>, and <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">take notes</strong>{" "}alongside complex algorithms before you start typing. It&apos;s the perfect tool for when you need to visualize logic that&apos;s hard to hold in your head.
                        </p>
                        <div className="space-y-4 mb-10">
                            {[
                                "Infinite canvas for free-form sketching and drawing",
                                "Rich note-taking alongside your problem workspace",
                                "Perfect for dry-running tree and graph traversals",
                                "Save and reference your logic while you code"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 text-gray-700 dark:text-gray-300">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                        <PenTool className="w-3.5 h-3.5 text-primary" />
                                    </div>
                                    <span className="font-medium text-base md:text-lg tracking-tight">{item}</span>
                                </div>
                            ))}
                        </div>
                        <Button
                            size="lg"
                            className="rounded-lg py-6 text-base bg-zinc-950 dark:bg-white hover:bg-zinc-900 dark:hover:bg-zinc-100 text-white dark:text-black font-medium tracking-tight transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] shadow-xl flex items-center gap-2 group/btn w-full sm:w-fit px-8"
                            asChild
                        >
                            <Link
                                href="/problem/kadanes-algorithm?tab=thinkpad"
                                onClick={() => trackEvent(posthog, "home_cta_clicked", {
                                    cta_label: "Try Thinkpad",
                                    destination: "/problem/kadanes-algorithm?tab=thinkpad",
                                    section: "scratchpad_thinkpad"
                                })}
                            >
                                <Book className="w-5 h-5" />
                                Try Thinkpad
                                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                            </Link>
                        </Button>
                    </div>
                    <div className="order-1 lg:order-2 aspect-square bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-primary/5 flex flex-col overflow-hidden relative group" role="img" aria-label="Scratchpad drawing canvas preview showing a hand-drawn binary tree and Kadane's algorithm sketch.">
                        {/* Upper Tools Row overlay */}
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex gap-2">
                                <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 flex items-center justify-center shadow-sm">
                                    <div className="w-3.5 h-3.5 rounded-full bg-rose-500 opacity-80"></div>
                                </div>
                                <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 flex items-center justify-center shadow-sm">
                                    <div className="w-3.5 h-3.5 rounded-full bg-blue-500 opacity-80"></div>
                                </div>
                                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
                                    <PenTool className="w-4 h-4 text-primary" />
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-gray-100 dark:bg-zinc-900 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 border border-transparent dark:border-zinc-800">
                                Thinkpad Canvas
                            </div>
                        </div>

                        {/* Interactive Board/Sketch Drawing Container */}
                        <div className="flex-1 bg-gray-50 dark:bg-zinc-900/40 rounded-2xl relative overflow-hidden p-2 sm:p-4 border border-gray-100 dark:border-zinc-900/60 flex items-center justify-center">
                            <svg className="w-full h-full text-zinc-700 dark:text-zinc-300" viewBox="0 0 450 450" style={{ fontFamily: caveat.style.fontFamily }}>
                                {/* Title: Kadane's Algorithm */}
                                <g className="text-zinc-800 dark:text-zinc-100">
                                    <text x="30" y="42" fill="currentColor" className="text-2xl font-bold tracking-wide">Kadane&apos;s Algo: Max Subarray</text>
                                    <path d="M 28 50 Q 150 48 270 51" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-80" />
                                    <path d="M 35 54 Q 130 53 230 52" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="opacity-40" />
                                </g>

                                {/* Array representation */}
                                <g className="text-zinc-400 dark:text-zinc-600">
                                    <text x="15" y="98" fill="currentColor" className="text-base text-zinc-500 dark:text-zinc-400 font-bold font-sans">nums =</text>
                                    {/* Cells mapping */}
                                    {[
                                        { val: "-2", x: 65, seed: 1 },
                                        { val: "1", x: 103, seed: 2 },
                                        { val: "-3", x: 141, seed: 3 },
                                        { val: "4", x: 179, seed: 4, isMax: true },
                                        { val: "-1", x: 217, seed: 5, isMax: true },
                                        { val: "2", x: 255, seed: 6, isMax: true },
                                        { val: "1", x: 293, seed: 7, isMax: true },
                                        { val: "-5", x: 331, seed: 8 },
                                        { val: "4", x: 369, seed: 9 }
                                    ].map((cell, idx) => {
                                        const isHighlighted = cell.isMax;
                                        return (
                                            <g key={idx} className={isHighlighted ? "text-blue-600 dark:text-blue-400 font-bold" : "text-zinc-700 dark:text-zinc-300"}>
                                                <path 
                                                    d={getWobblyRect(cell.x, 75, 32, 32, cell.seed)} 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    strokeWidth={isHighlighted ? "2" : "1.5"} 
                                                    strokeLinecap="round"
                                                    className={isHighlighted ? "opacity-90" : "opacity-60"}
                                                />
                                                <text 
                                                    x={cell.x + 16} 
                                                    y={97} 
                                                    fill="currentColor"
                                                    textAnchor="middle" 
                                                    className="text-lg font-bold"
                                                >
                                                    {cell.val}
                                                </text>
                                                <text 
                                                    x={cell.x + 16} 
                                                    y={70} 
                                                    fill="currentColor"
                                                    textAnchor="middle" 
                                                    className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans"
                                                >
                                                    {idx}
                                                </text>
                                            </g>
                                        );
                                    })}
                                </g>

                                {/* Max Subarray Lasso Highlight */}
                                <g className="text-blue-500 dark:text-blue-400">
                                    {/* Encloses index 3 to 6: x=175 to x=329 */}
                                    <path 
                                        d="M 175 70 C 220 67, 280 67, 329 70 C 335 83, 335 98, 329 111 C 280 114, 220 114, 175 111 C 169 98, 169 83, 175 70 Z" 
                                        fill="rgba(59, 130, 246, 0.06)" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeDasharray="4 2" 
                                        strokeLinecap="round" 
                                    />
                                    <path 
                                        d={getWobblyArrow(250, 114, 250, 142, 6)} 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                    />
                                    <text 
                                        x="250" 
                                        y="162" 
                                        fill="currentColor"
                                        textAnchor="middle" 
                                        className="text-base font-bold tracking-wide"
                                    >
                                        max subarray sum = 6
                                    </text>
                                </g>

                                {/* Pointers */}
                                <g className="text-rose-500 dark:text-rose-400 font-bold">
                                    {/* Arrow pointing up at current index i = 6 (x=309) */}
                                    <path 
                                        d={getWobblyArrow(309, 156, 309, 114, -4)} 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2.2" 
                                        strokeLinecap="round" 
                                    />
                                    <text x="314" y="172" fill="currentColor" className="text-base">i</text>
                                    <text x="325" y="168" fill="currentColor" className="text-[10px] font-sans opacity-70">current</text>
                                </g>

                                <g className="text-blue-500 dark:text-blue-400 opacity-80">
                                    {/* Start pointer pointing to index 3 (x=195) from above */}
                                    <path 
                                        d={getWobblyArrow(195, 52, 195, 70, 2)} 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="1.5" 
                                        strokeLinecap="round" 
                                    />
                                    <text x="195" y="47" fill="currentColor" textAnchor="middle" className="text-xs font-bold">start</text>
                                </g>

                                {/* Left Side: State Tracking / Math Notes */}
                                <g className="text-zinc-800 dark:text-zinc-200">
                                    <text x="30" y="215" fill="currentColor" className="text-base font-bold text-zinc-500 dark:text-zinc-400 font-sans">Track State:</text>
                                    <path d="M 28 220 Q 75 219 110 221" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="opacity-40" />

                                    <text x="30" y="246" fill="currentColor" className="text-sm font-medium tracking-wide">
                                        localMax = max(nums[i], localMax + nums[i])
                                    </text>
                                    <text x="30" y="272" fill="currentColor" className="text-sm font-bold text-rose-500 dark:text-rose-400 tracking-wide">
                                        localMax = max(1, 5 + 1) = 6
                                    </text>
                                    <g className="text-blue-500 dark:text-blue-400 font-bold">
                                        <text x="30" y="298" fill="currentColor" className="text-sm tracking-wide">
                                            globalMax = max(6, 6) = 6
                                        </text>
                                        <path 
                                            d={getWobblyCircle(176, 294, 11, 10)} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            strokeLinecap="round"
                                        />
                                    </g>
                                </g>

                                {/* Right Side: Tree Traversal Sketch */}
                                <g className="text-zinc-600 dark:text-zinc-400">
                                    <text x="290" y="215" fill="currentColor" className="text-base font-bold text-zinc-500 dark:text-zinc-400 font-sans">Tree Traversal:</text>
                                    <path d="M 288 220 Q 345 219 380 221" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="opacity-40" />

                                    {/* Tree Nodes & Connections */}
                                    <path d="M 340 255 C 330 268, 322 280, 318 286" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="opacity-50" />
                                    <path d="M 360 255 C 370 268, 378 280, 382 286" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="opacity-50" />
                                    <path d="M 302 305 C 296 318, 290 330, 286 336" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="opacity-50" />
                                    <path d="M 318 305 C 324 318, 330 330, 334 336" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="opacity-50" />

                                    {/* Node Circles & Text */}
                                    {[
                                        { cx: 350, cy: 245, val: "10", seed: 11 },
                                        { cx: 310, cy: 295, val: "5", seed: 12 },
                                        { cx: 390, cy: 295, val: "15", seed: 13 },
                                        { cx: 280, cy: 345, val: "2", seed: 14 },
                                        { cx: 340, cy: 345, val: "7", seed: 15 }
                                    ].map((node, idx) => (
                                        <g key={idx} className="text-zinc-700 dark:text-zinc-300">
                                            <path 
                                                d={getWobblyCircle(node.cx, node.cy, 12, node.seed)} 
                                                fill="none" 
                                                stroke="currentColor" 
                                                strokeWidth="1.5" 
                                                strokeLinecap="round"
                                                className="opacity-70"
                                            />
                                            <text 
                                                x={node.cx} 
                                                y={node.cy + 4} 
                                                fill="currentColor"
                                                textAnchor="middle" 
                                                className="text-xs font-bold"
                                            >
                                                {node.val}
                                            </text>
                                        </g>
                                    ))}

                                    {/* Dotted DFS arrow */}
                                    <path 
                                        d="M 368 238 C 328 235, 278 280, 255 330" 
                                        fill="none" 
                                        stroke="#3b82f6" 
                                        strokeWidth="1.5" 
                                        strokeDasharray="3 3" 
                                        strokeLinecap="round"
                                        className="dark:stroke-blue-400 opacity-60" 
                                    />
                                    <path 
                                        d={getWobblyArrow(258, 320, 255, 332, 2)} 
                                        fill="none" 
                                        stroke="#3b82f6" 
                                        strokeWidth="1.5" 
                                        strokeLinecap="round"
                                        className="dark:stroke-blue-400 opacity-60" 
                                    />
                                    <text 
                                        x="248" 
                                        y="350" 
                                        fill="currentColor"
                                        textAnchor="middle" 
                                        transform="rotate(-15, 248, 350)"
                                        className="text-xs text-blue-500 dark:text-blue-400 font-bold opacity-80"
                                    >
                                        DFS!
                                    </text>
                                </g>

                                {/* Bottom Left Complexity Checklist */}
                                <g className="text-emerald-600 dark:text-emerald-400 font-bold">
                                    <text x="30" y="348" fill="currentColor" className="text-zinc-500 dark:text-zinc-400 text-sm font-sans">Time Complexity: O(N)</text>
                                    <text x="30" y="373" fill="currentColor" className="text-zinc-500 dark:text-zinc-400 text-sm font-sans">Space Complexity: O(1)</text>
                                    
                                    {/* Double checkmarks */}
                                    <path d="M 160 340 L 164 345 L 171 336 M 161 341 L 164 346 L 170 337" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M 165 365 L 169 370 L 176 361 M 166 366 L 169 371 L 175 362" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    
                                    {/* Sparkles / scribbles */}
                                    <path d="M 30 405 C 40 403, 50 407, 60 404 C 70 402, 80 400, 90 402" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="opacity-30" />
                                    <text x="30" y="422" fill="currentColor" className="text-xs text-zinc-400 dark:text-zinc-500 font-sans opacity-70">✏️ Active drawing buffer...</text>
                                </g>
                            </svg>

                            {/* Stylized pencil element that wiggles on hover */}
                            <div className="absolute right-[12%] bottom-[12%] opacity-80 pointer-events-none group-hover:translate-x-[-12px] group-hover:translate-y-[-12px] transition-transform duration-500 ease-out z-10">
                                <PenTool className="w-8 h-8 text-primary rotate-[135deg] drop-shadow-md filter" />
                                <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-primary animate-ping"></div>
                            </div>
                        </div>

                        {/* Background grid texture overlay */}
                        <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1.2px, transparent 1.2px)', backgroundSize: '24px 24px' }}></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
