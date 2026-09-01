import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Code2,
  Cpu,
  Brain,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
  Layers,
  FileText,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { apiClient } from "../../api/client.js";
import { companyConfig } from "../../data/companyConfig.js";

const availableRoles = [
  "Full-Stack TypeScript Engineer",
  "Frontend Architecture Specialist (React / Tailwind)",
  "Backend & PostgreSQL Systems Engineer",
  "AI / LLM Integration Engineer",
  "UI / UX Design Engineer",
  "QA & End-to-End Automation Specialist",
  "Technical Project Manager",
];

export const ApplyPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    roleApplied: availableRoles[0],
    experienceYears: 2,
    skills: "React, TypeScript, Tailwind CSS, Node.js, PostgreSQL",
    portfolioUrl: "",
    resumeText: "",
  });

  const [dynamicQuestions, setDynamicQuestions] = useState<any[]>([]);
  const [dynamicAnswers, setDynamicAnswers] = useState<Record<string, any>>({});
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoadingQuestions(true);
        const res = await apiClient<any[]>("/applicants/questions");
        const list = Array.isArray(res) ? res : (res as any)?.data || [];
        setDynamicQuestions(list.filter((q: any) => q.isActive !== false));
      } catch (err) {
        console.warn("Could not load dynamic questions, continuing with base form", err);
      } finally {
        setIsLoadingQuestions(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleDynamicAnswerChange = (questionId: string, value: any) => {
    setDynamicAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleCheckboxToggle = (questionId: string, option: string) => {
    setDynamicAnswers((prev) => {
      const currentList: string[] = Array.isArray(prev[questionId]) ? prev[questionId] : [];
      const exists = currentList.includes(option);
      const nextList = exists ? currentList.filter((item) => item !== option) : [...currentList, option];
      return {
        ...prev,
        [questionId]: nextList,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.roleApplied) {
      setErrorMessage("Please complete all required application fields.");
      return;
    }

    // Check required dynamic questions
    for (const q of dynamicQuestions) {
      const qTitle = q.question || q.questionText || "Question";
      const answerVal = dynamicAnswers[q.id];
      const isAnswerEmpty =
        answerVal === undefined ||
        answerVal === null ||
        (Array.isArray(answerVal) && answerVal.length === 0) ||
        (typeof answerVal === "string" && answerVal.trim() === "");

      if (q.isRequired && isAnswerEmpty) {
        setErrorMessage(`Please complete the required question: "${qTitle}"`);
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const skillsArray = formData.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const formattedAnswers = Object.entries(dynamicAnswers)
      .filter(([_, val]) => val !== undefined && val !== null && String(val).trim() !== "")
      .map(([questionId, val]) => ({
        questionId,
        answer: Array.isArray(val) ? JSON.stringify(val) : String(val),
      }));

    try {
      await apiClient("/applicants", {
        method: "POST",
        body: {
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          phoneNumber: formData.phoneNumber.trim() || undefined,
          roleApplied: formData.roleApplied,
          experienceYears: Number(formData.experienceYears) || 0,
          skills: skillsArray,
          portfolioUrl: formData.portfolioUrl.trim() || undefined,
          resumeText: formData.resumeText.trim() || undefined,
          answers: formattedAnswers.length > 0 ? formattedAnswers : undefined,
        },
      });

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(
        err.message || "Failed to submit application. Please check your details and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16 font-sans">
      {/* Header Banner */}
      <section className="pt-8 sm:pt-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-semibold uppercase tracking-wider font-mono">
          <span>Careers & Talent</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight max-w-3xl mx-auto">
          Build the future of enterprise software with{" "}
          <span className="text-[#B88E20]">ST-Solutions.</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed">
          We are always looking for passionate software engineers, designers, and systems architects dedicated to craftsmanship, high standards, and dependable engineering.
        </p>
      </section>

      {/* Engineering Culture Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-[#E2E5E0] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-950">Strict Craftsmanship</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We care deeply about clean architectures, predictable database models, type safety, and maintainable codebases.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E2E5E0] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#B88E20] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-950">Real Enterprise Impact</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              You will build systems used by real clinics, retailers, and high-growth organizations every single day.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E2E5E0] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-950">Autonomy & Learning</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct access to leadership, modern AI engineering pipelines, and continuous architectural growth.
            </p>
          </div>
        </div>
      </section>

      {/* Main Application Form Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#E2E5E0] shadow-md">
          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="text-2xl font-bold text-slate-950">
                  Application Submitted!
                </h3>
                <p className="text-sm text-slate-600">
                  Thank you, <strong className="text-slate-950">{formData.fullName}</strong>. Your profile has been registered in the ST-Solutions talent pool. Our engineering review team will contact you if your skills match open client initiatives.
                </p>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setFormData({
                      fullName: "",
                      email: "",
                      phoneNumber: "",
                      roleApplied: availableRoles[0],
                      experienceYears: 2,
                      skills: "",
                      portfolioUrl: "",
                      resumeText: "",
                    });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#F1F2EE] hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors border border-[#E2E5E0]"
                >
                  Submit Another Profile
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-[#E2E5E0] pb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
                  Member Application
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Fill in your credentials to apply for open engineering, design, and project roles.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center space-x-2 animate-fade-in font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. David Zhao"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-xs sm:text-sm focus:border-[#D4AF37] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="david@domain.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-xs sm:text-sm focus:border-[#D4AF37] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+92 325 7263417"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-xs sm:text-sm focus:border-[#D4AF37] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Years of Relevant Experience *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    required
                    value={formData.experienceYears}
                    onChange={(e) =>
                      setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-xs sm:text-sm focus:border-[#D4AF37] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Role Applied For *
                  </label>
                  <select
                    value={formData.roleApplied}
                    onChange={(e) => setFormData({ ...formData, roleApplied: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-xs sm:text-sm focus:border-[#D4AF37] outline-none"
                  >
                    {availableRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Portfolio / GitHub URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    placeholder="https://github.com/yourhandle"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-xs sm:text-sm focus:border-[#D4AF37] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Primary Technical Skills (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="React, TypeScript, Tailwind, Node.js, Prisma, PostgreSQL, Docker"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-xs sm:text-sm focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Brief Bio / Cover Note / Summary
                </label>
                <textarea
                  rows={4}
                  value={formData.resumeText}
                  onChange={(e) => setFormData({ ...formData, resumeText: e.target.value })}
                  placeholder="Share a brief introduction, your background with modern web/software engineering, and why you would like to contribute at ST-Solutions..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-xs sm:text-sm focus:border-[#D4AF37] outline-none resize-none"
                />
              </div>

              {/* Dynamic Application Questions */}
              {dynamicQuestions.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-[#E2E5E0]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-950">
                      Additional Position Details
                    </h3>
                    <span className="text-[11px] text-[#B88E20] font-medium font-mono">
                      Dynamic Form Builder
                    </span>
                  </div>

                  {dynamicQuestions.map((q) => {
                    const qTitle = q.question || q.questionText || "Question";
                    const value = dynamicAnswers[q.id] ?? "";
                    const type = (q.fieldType || "SHORT_TEXT").toUpperCase();
                    const optionsList: string[] = Array.isArray(q.options)
                      ? q.options
                      : typeof q.options === "string"
                      ? q.options.split(",").map((s: string) => s.trim()).filter(Boolean)
                      : [];

                    return (
                      <div key={q.id} className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">
                          {qTitle} {q.isRequired && <span className="text-rose-500">*</span>}
                        </label>
                        {q.helpText && (
                          <p className="text-[11px] text-slate-500">{q.helpText}</p>
                        )}

                        {type === "LONG_TEXT" ? (
                          <textarea
                            rows={3}
                            required={q.isRequired}
                            value={value}
                            onChange={(e) => handleDynamicAnswerChange(q.id, e.target.value)}
                            placeholder={q.placeholder || "Enter your response..."}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-xs sm:text-sm focus:border-[#D4AF37] outline-none resize-none"
                          />
                        ) : type === "DROPDOWN" || type === "SELECT" ? (
                          <select
                            required={q.isRequired}
                            value={value}
                            onChange={(e) => handleDynamicAnswerChange(q.id, e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-xs sm:text-sm focus:border-[#D4AF37] outline-none"
                          >
                            <option value="">Select an option...</option>
                            {optionsList.map((opt: string, idx: number) => (
                              <option key={idx} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : type === "RADIO" ? (
                          <div className="space-y-2 pt-1">
                            {optionsList.map((opt: string, idx: number) => (
                              <label key={idx} className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`question_${q.id}`}
                                  value={opt}
                                  checked={value === opt}
                                  required={q.isRequired && !value}
                                  onChange={(e) => handleDynamicAnswerChange(q.id, e.target.value)}
                                  className="w-4 h-4 text-[#D4AF37] focus:ring-[#D4AF37] border-gray-300"
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        ) : type === "CHECKBOX" || type === "MULTI_SELECT" ? (
                          <div className="space-y-2 pt-1">
                            {optionsList.length > 0 ? (
                              optionsList.map((opt: string, idx: number) => {
                                const selectedArr = Array.isArray(value) ? value : [];
                                const isChecked = selectedArr.includes(opt);
                                return (
                                  <label key={idx} className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      value={opt}
                                      checked={isChecked}
                                      onChange={() => handleCheckboxToggle(q.id, opt)}
                                      className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37] border-gray-300"
                                    />
                                    <span>{opt}</span>
                                  </label>
                                );
                              })
                            ) : (
                              <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!value}
                                  onChange={(e) => handleDynamicAnswerChange(q.id, e.target.checked ? "Yes" : "No")}
                                  className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37] border-gray-300"
                                />
                                <span>{q.placeholder || "I confirm / agree"}</span>
                              </label>
                            )}
                          </div>
                        ) : type === "NUMBER" ? (
                          <input
                            type="number"
                            required={q.isRequired}
                            value={value}
                            onChange={(e) => handleDynamicAnswerChange(q.id, e.target.value)}
                            placeholder={q.placeholder || "0"}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-xs sm:text-sm focus:border-[#D4AF37] outline-none"
                          />
                        ) : type === "DATE" ? (
                          <input
                            type="date"
                            required={q.isRequired}
                            value={value}
                            onChange={(e) => handleDynamicAnswerChange(q.id, e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-xs sm:text-sm focus:border-[#D4AF37] outline-none"
                          />
                        ) : type === "EMAIL" ? (
                          <input
                            type="email"
                            required={q.isRequired}
                            value={value}
                            onChange={(e) => handleDynamicAnswerChange(q.id, e.target.value)}
                            placeholder={q.placeholder || "name@example.com"}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-xs sm:text-sm focus:border-[#D4AF37] outline-none"
                          />
                        ) : type === "PHONE" ? (
                          <input
                            type="tel"
                            required={q.isRequired}
                            value={value}
                            onChange={(e) => handleDynamicAnswerChange(q.id, e.target.value)}
                            placeholder={q.placeholder || "+1 (555) 000-0000"}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-xs sm:text-sm focus:border-[#D4AF37] outline-none"
                          />
                        ) : type === "URL" || type === "FILE_UPLOAD" ? (
                          <input
                            type="url"
                            required={q.isRequired}
                            value={value}
                            onChange={(e) => handleDynamicAnswerChange(q.id, e.target.value)}
                            placeholder={q.placeholder || (type === "FILE_UPLOAD" ? "https://drive.google.com/... or resume URL" : "https://...")}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-xs sm:text-sm focus:border-[#D4AF37] outline-none"
                          />
                        ) : (
                          <input
                            type="text"
                            required={q.isRequired}
                            value={value}
                            onChange={(e) => handleDynamicAnswerChange(q.id, e.target.value)}
                            placeholder={q.placeholder || "Your answer..."}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#E2E5E0] bg-white text-slate-950 text-xs sm:text-sm focus:border-[#D4AF37] outline-none"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-[#111827] text-white font-bold text-xs sm:text-sm shadow-md hover:bg-[#1F2937] active:scale-[0.99] transition-all disabled:opacity-50 border border-[#111827]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
