/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Zap, 
  FileCheck, 
  BarChart3,
  ChevronRight,
  Loader2,
  Sparkles,
  Target,
  BookOpen,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { analyzeResume, AnalysisResult } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [view, setView] = useState<'home' | 'how-it-works' | 'ats-guide' | 'pricing'>('home');
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Junior');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setError("Note: PDF analysis is currently optimized for text-based documents. For best results, ensure your PDF is not a scanned image.");
      }
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        setResumeText(text);
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
    },
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !targetRole.trim()) {
      setError("Please provide both resume text and target job role.");
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await analyzeResume(resumeText, targetRole, experienceLevel);
      setResult(analysis);
      setView('home');
      
      // Scroll to results area
      setTimeout(() => {
        const resultsElement = document.getElementById('machine-results');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during analysis.');
      setResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setResumeText('');
    setResult(null);
    setError(null);
    setView('home');
  };

  const Gauge = ({ score }: { score: number }) => {
    const rotation = (score / 100) * 180 - 90;
    return (
      <div className="relative w-32 h-16 overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 border-[12px] border-purple-100 rounded-full"></div>
        <motion.div 
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ type: 'spring', stiffness: 50 }}
          className="absolute top-full left-1/2 w-1 h-14 bg-pink-500 origin-top -translate-x-1/2"
        >
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-pink-500 rounded-full"></div>
        </motion.div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-white to-transparent"></div>
      </div>
    );
  };

  const renderHome = () => {
    if (result) {
      return (
        <div className="flex flex-col lg:flex-row gap-8 items-stretch justify-center min-h-[600px]">
          {/* Left Control Panel */}
          <div className="w-full lg:w-64 bg-white rounded-3xl p-6 flex flex-col items-center border-r-4 border-b-4 border-purple-100 shadow-xl">
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-black text-2xl tracking-tighter mb-8 text-center leading-none">
              RESUME<br />GRADER
            </h2>
            
            <div className="mb-8 p-4 bg-purple-50 rounded-2xl border border-purple-100 w-full flex flex-col items-center">
              <Gauge score={result.overallScore} />
              <div className="mt-2 text-purple-900/40 text-[10px] font-mono uppercase tracking-widest">Intensity</div>
            </div>

            <div className="w-full space-y-4 mb-8">
              <div className="h-12 bg-purple-50 rounded-lg border border-purple-100 overflow-hidden relative">
                <motion.div 
                  animate={{ x: [-100, 100] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 flex items-center"
                >
                  <svg width="200" height="40" viewBox="0 0 200 40" className="stroke-pink-500/30 fill-none">
                    <path d="M0 20 Q 25 0, 50 20 T 100 20 T 150 20 T 200 20" strokeWidth="1" />
                  </svg>
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-[1px] bg-purple-500/10"></div>
                </div>
              </div>
              <div className="h-12 bg-purple-50 rounded-lg border border-purple-100 flex items-center justify-center">
                <div className="w-4/5 h-[2px] bg-purple-200 relative">
                  <motion.div 
                    animate={{ left: ["0%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_8px_#ec4899]"
                  ></motion.div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-8">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={cn(
                  "w-4 h-4 rounded-full border-2 border-purple-100 shadow-inner",
                  i === 0 ? "bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]" : "bg-purple-100"
                )}></div>
              ))}
            </div>

            <button 
              onClick={reset}
              className="mt-auto w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-pink-500/20"
            >
              Reset
            </button>
          </div>

          {/* Main Display Area */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Results Screen */}
            <div id="machine-results" className="space-y-8">
              <div className="bg-white rounded-3xl p-8 border-8 border-purple-50 shadow-inner grid md:grid-cols-2 gap-8">
                <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100 flex flex-col items-center justify-center text-center">
                  <div className="text-purple-900/40 text-[10px] font-mono uppercase tracking-widest mb-4">Resume Checker</div>
                  <div className="relative w-32 h-32 mb-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-purple-200"
                        strokeDasharray="100, 100"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <motion.path
                        initial={{ strokeDasharray: "0, 100" }}
                        animate={{ strokeDasharray: `${result.overallScore}, 100` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="text-pink-500"
                        strokeWidth="2"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-purple-950 leading-none">{result.overallScore}/100</span>
                    </div>
                  </div>
                  <div className="text-purple-900/60 text-sm font-mono">
                    {result.grammarImprovements.mistakes.length + result.skillGapAnalysis.missingOrWeakSkills.length} Issues Detected
                  </div>
                </div>

                <div className="bg-pink-50 rounded-2xl p-6 border border-pink-100 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-pink-500 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-pink-900 font-bold text-sm">Improved Summary</span>
                  </div>
                  <p className="text-pink-800 text-xs font-medium leading-relaxed italic">
                    "{result.improvedSummary}"
                  </p>
                </div>
              </div>

              {/* Detailed Feedback Sections */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm">
                  <h3 className="font-bold text-purple-950 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    Grammar & Language
                  </h3>
                  <div className="space-y-4">
                    {result.grammarImprovements.corrections.map((item, i) => (
                      <div key={i} className="text-sm p-3 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-red-400 line-through mb-1">{item.original}</p>
                        <p className="text-emerald-600 font-medium">{item.improved}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm">
                  <h3 className="font-bold text-purple-950 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    ATS Optimization
                  </h3>
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-purple-400 uppercase tracking-widest">Missing Keywords</div>
                    <div className="flex flex-wrap gap-2">
                      {result.atsOptimization.missingKeywords.map((kw, i) => (
                        <span key={i} className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-[10px] font-bold">{kw}</span>
                      ))}
                    </div>
                    <div className="mt-4 text-xs font-bold text-purple-400 uppercase tracking-widest">Section Order</div>
                    <p className="text-sm text-purple-900/70">{result.atsOptimization.sectionOrderImprovements}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm">
                  <h3 className="font-bold text-purple-950 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-500" />
                    Section Feedback
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="font-bold text-purple-900">Experience:</span>
                      <p className="text-purple-900/70">{result.sectionFeedback.experience}</p>
                    </div>
                    <div>
                      <span className="font-bold text-purple-900">Skills:</span>
                      <p className="text-purple-900/70">{result.sectionFeedback.skills}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm">
                  <h3 className="font-bold text-purple-950 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-500" />
                    Skill Gap Analysis
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Weak or Missing</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {result.skillGapAnalysis.missingOrWeakSkills.map((skill, i) => (
                          <span key={i} className="px-2 py-1 bg-red-50 text-red-600 rounded text-[10px] font-bold">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Suggestions</span>
                      <ul className="mt-2 space-y-1">
                        {result.skillGapAnalysis.suggestions.map((s, i) => (
                          <li key={i} className="text-sm text-purple-900/70 flex items-start gap-2">
                            <span className="text-purple-400 mt-1">•</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm">
                  <h3 className="font-bold text-purple-950 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-pink-500" />
                    7-Day Action Plan
                  </h3>
                  <div className="space-y-3">
                    {result.sevenDayActionPlan.map((step, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <span className="font-bold text-pink-500 shrink-0">D{step.day}</span>
                        <p className="text-purple-900/70">{step.task}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-purple-950">
            The Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Resume Grader</span>
          </h1>
          <p className="text-xl text-purple-900/60 max-w-2xl mx-auto">
            Feed your resume into our machine and get a technical breakdown of its performance.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-xl shadow-purple-500/5 border border-purple-100 p-8"
        >
          {!resumeText ? (
            <div 
              {...getRootProps()} 
              className={cn(
                "border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer",
                isDragActive ? "border-pink-500 bg-pink-50" : "border-purple-200 hover:border-pink-400 hover:bg-purple-50/30"
              )}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-purple-950">Insert Resume Document</h3>
              <p className="text-purple-900/40 text-sm mb-6">Supports PDF, TXT (Max 5MB)</p>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-medium hover:opacity-90 transition-all shadow-lg shadow-pink-500/20">
                Select File
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-purple-400 uppercase tracking-widest">Target Job Role</label>
                  <input 
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full p-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-pink-500 outline-none text-sm bg-purple-50/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-purple-400 uppercase tracking-widest">Experience Level</label>
                  <select 
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full p-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-pink-500 outline-none text-sm bg-purple-50/30"
                  >
                    {['Student', 'Fresher', 'Junior', 'Mid', 'Senior'].map(lvl => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-pink-600" />
                  <div>
                    <p className="font-medium text-purple-950">Document Loaded</p>
                    <p className="text-xs text-purple-900/40">{resumeText.length} characters</p>
                  </div>
                </div>
                <button 
                  onClick={() => setResumeText('')}
                  className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                >
                  Eject
                </button>
              </div>
              
              <div className="relative">
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full h-64 p-4 rounded-xl border border-purple-200 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-sm font-mono resize-none bg-white text-purple-900/80"
                  placeholder="Paste your resume text here if file upload fails..."
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !resumeText.trim() || !targetRole.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing Data...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current" />
                    Start Grading
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600"
          >
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}
      </div>
    );
  };

  const renderHowItWorks = () => (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold tracking-tight text-purple-950">How it Works</h2>
        <p className="text-purple-900/60 text-lg">Three simple steps to a better resume.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { icon: Upload, title: "Upload", desc: "Upload your resume in PDF or TXT format, or simply paste the text." },
          { icon: Zap, title: "Analyze", desc: "Our AI engine scans your content for grammar, skills, and ATS compatibility." },
          { icon: FileCheck, title: "Improve", desc: "Get actionable feedback and specific suggestions to land more interviews." }
        ].map((step, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-purple-100 shadow-sm text-center">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <step.icon className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-purple-950">{step.title}</h3>
            <p className="text-purple-900/60 text-sm leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white text-center shadow-xl shadow-pink-500/20">
        <h3 className="text-2xl font-bold mb-4">Ready to start?</h3>
        <button 
          onClick={() => setView('home')}
          className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-all shadow-lg"
        >
          Upload Resume Now
        </button>
      </div>
    </div>
  );

  const renderATSGuide = () => (
    <div className="max-w-3xl mx-auto space-y-12">
      <div className="space-y-4">
        <h2 className="text-4xl font-bold tracking-tight text-purple-950">ATS Optimization Guide</h2>
        <p className="text-purple-900/60 text-lg">Applicant Tracking Systems (ATS) are used by 99% of Fortune 500 companies. Here is how to beat them.</p>
      </div>
      
      <div className="space-y-8">
        {[
          { title: "Use Standard Headings", desc: "Stick to simple headings like 'Experience', 'Education', and 'Skills'. Creative titles can confuse the parser." },
          { title: "Keywords are King", desc: "ATS looks for specific keywords from the job description. Ensure your resume mirrors the language of the role." },
          { title: "Avoid Complex Layouts", desc: "Multi-column layouts, tables, and graphics can break the parsing process. Stick to a clean, single-column format." },
          { title: "File Format Matters", desc: "While PDFs are generally safe, some older systems prefer .docx. Our analyzer works best with clean text." }
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm flex gap-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center shrink-0 font-bold">
              {i + 1}
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2 text-purple-950">{item.title}</h3>
              <p className="text-purple-900/60 text-sm leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPricing = () => (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold tracking-tight text-purple-950">Simple Pricing</h2>
        <p className="text-purple-900/60 text-lg">Choose the plan that fits your career goals.</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { name: "Free", price: "$0", features: ["3 Analysis per month", "Basic Grammar Check", "Skill Identification"], cta: "Current Plan", popular: false },
          { name: "Pro", price: "$9", features: ["Unlimited Analysis", "Full ATS Optimization", "Custom Cover Letters", "Priority Support"], cta: "Get Started", popular: true },
          { name: "Team", price: "$29", features: ["10 User Seats", "Bulk Uploads", "API Access", "Custom Branding"], cta: "Contact Sales", popular: false }
        ].map((plan, i) => (
          <div key={i} className={cn(
            "bg-white p-8 rounded-3xl border shadow-sm flex flex-col",
            plan.popular ? "border-purple-600 ring-4 ring-purple-50" : "border-purple-100"
          )}>
            {plan.popular && <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600 mb-2">Most Popular</span>}
            <h3 className="text-2xl font-bold mb-2 text-purple-950">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-purple-950">{plan.price}</span>
              <span className="text-purple-900/40 text-sm">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
              {plan.features.map((f, j) => (
                <li key={j} className="text-sm text-purple-900/60 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pink-500" />
                  {f}
                </li>
              ))}
            </ul>
            <button className={cn(
              "w-full py-3 rounded-xl font-bold transition-all",
              plan.popular ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-pink-500/20" : "bg-purple-50 text-purple-600 hover:bg-purple-100"
            )}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFE] text-[#1E0B2B] font-sans selection:bg-pink-500/10 overflow-x-hidden relative">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-200/30 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-200/30 blur-[120px] rounded-full"></div>
      </div>

      {/* Header */}
      <header className="border-b border-purple-100 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => { setView('home'); setResult(null); }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(219,39,119,0.5)] transition-all">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-purple-950">ResumeAI</span>
          </button>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-purple-950/40">
            <button 
              onClick={() => setView('how-it-works')}
              className={cn("hover:text-pink-600 transition-colors", view === 'how-it-works' && "text-pink-600")}
            >
              How it works
            </button>
            <button 
              onClick={() => setView('ats-guide')}
              className={cn("hover:text-pink-600 transition-colors", view === 'ats-guide' && "text-pink-600")}
            >
              ATS Guide
            </button>
            <button 
              onClick={() => setView('pricing')}
              className={cn("hover:text-pink-600 transition-colors", view === 'pricing' && "text-pink-600")}
            >
              Pricing
            </button>
          </nav>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-pink-500/20">
            Sign In
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {isAnalyzing && (
          <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
            <div className="bg-white p-8 rounded-3xl shadow-2xl border border-purple-100 flex flex-col items-center gap-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 blur-xl animate-pulse"></div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-purple-950">Analyzing Resume...</h3>
                <p className="text-purple-900/60 text-sm">Our AI machine is grading your document.</p>
              </div>
            </div>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={view + (result ? '-result' : '')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'home' && renderHome()}
            {view === 'how-it-works' && renderHowItWorks()}
            {view === 'ats-guide' && renderATSGuide()}
            {view === 'pricing' && renderPricing()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-100 py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tight text-purple-950">ResumeAI</span>
          </div>
          <p className="text-sm text-purple-900/40">© 2026 ResumeAI. Powered by Gemini Flash.</p>
          <div className="flex gap-6 text-sm font-medium text-purple-900/60">
            <button onClick={() => setView('home')} className="hover:text-pink-600 transition-colors">Home</button>
            <button onClick={() => setView('how-it-works')} className="hover:text-pink-600 transition-colors">About</button>
            <button className="hover:text-pink-600 transition-colors">Privacy</button>
            <button className="hover:text-pink-600 transition-colors">Terms</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
