import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Layers,
  FileQuestion,
  RefreshCw,
  Sliders,
  Type,
  ListOrdered,
  ToggleLeft,
  ToggleRight,
  ExternalLink } from "lucide-react";
import { Button, IconButton } from "../ui/Button.js";
import { Badge } from "../ui/Badge.js";
import { Card } from "../ui/Card.js";
import { Modal, ConfirmModal } from "../ui/Modal.js";
import { Input, Textarea } from "../ui/Input.js";
import { Select } from "../ui/Select.js";
import { EmptyState } from "../ui/EmptyState.js";
import { Skeleton } from "../ui/LoadingSpinner.js";
import { useToast } from "../../context/ToastContext.js";
import { applicantsService } from "../../api/services/applicants.service.js";

export interface FormQuestion {
  id: string;
  question: string;
  questionText?: string;
  fieldType: string;
  isRequired: boolean;
  options?: string[] | null;
  placeholder?: string | null;
  helpText?: string | null;
  category?: string | null;
  orderNumber?: number;
  orderIndex?: number;
  isActive?: boolean;
}

const FIELD_TYPES = [
  { value: "SHORT_TEXT", label: "Single-line Text (Short Text)" },
  { value: "LONG_TEXT", label: "Multi-line Text (Paragraph / Bio)" },
  { value: "NUMBER", label: "Numeric Value (Years, Count)" },
  { value: "EMAIL", label: "Email Address" },
  { value: "PHONE", label: "Phone / WhatsApp Number" },
  { value: "DROPDOWN", label: "Dropdown Select (Single Choice)" },
  { value: "RADIO", label: "Radio Buttons (Single Choice)" },
  { value: "CHECKBOX", label: "Checkboxes (Multiple Choice or Agreement)" },
  { value: "DATE", label: "Date Picker" },
  { value: "URL", label: "Web Link / Portfolio URL" },
  { value: "FILE_UPLOAD", label: "File Attachment / Cloud Drive URL" },
];

const CATEGORIES = [
  { value: "GENERAL", label: "General Information" },
  { value: "TECHNICAL", label: "Technical & Development Skills" },
  { value: "EXPERIENCE", label: "Professional Experience" },
  { value: "AVAILABILITY", label: "Availability & Work Preference" },
  { value: "VERIFICATION", label: "Identity & Verification" },
];

export const ApplicationFormBuilder: React.FC = () => {
  const { addToast } = useToast();
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<FormQuestion | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<FormQuestion | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    question: string;
    fieldType: string;
    isRequired: boolean;
    options: string[];
    newOptionText: string;
    placeholder: string;
    helpText: string;
    category: string;
    isActive: boolean;
  }>({
    question: "",
    fieldType: "SHORT_TEXT",
    isRequired: false,
    options: [],
    newOptionText: "",
    placeholder: "",
    helpText: "",
    category: "GENERAL",
    isActive: true });

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await applicantsService.getQuestions();
      const list = Array.isArray(res) ? res : (res as any)?.data || (res as any)?.items || [];
      // Normalize and sort by orderNumber / orderIndex
      const sorted = [...list].sort(
        (a, b) =>
          (a.orderNumber ?? a.orderIndex ?? 999) - (b.orderNumber ?? b.orderIndex ?? 999)
      );
      setQuestions(sorted);
    } catch (err: any) {
      addToast({
        title: "Error loading form builder",
        description: err.message || "Failed to load application questions",
        type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const openCreateModal = () => {
    setEditingQuestion(null);
    setFormData({
      question: "",
      fieldType: "SHORT_TEXT",
      isRequired: false,
      options: [],
      newOptionText: "",
      placeholder: "",
      helpText: "",
      category: "GENERAL",
      isActive: true });
    setIsEditModalOpen(true);
  };

  const openEditModal = (q: FormQuestion) => {
    setEditingQuestion(q);
    const parsedOptions: string[] = Array.isArray(q.options)
      ? q.options
      : typeof q.options === "string"
      ? (q.options as string).split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    setFormData({
      question: q.question || q.questionText || "",
      fieldType: q.fieldType || "SHORT_TEXT",
      isRequired: !!q.isRequired,
      options: parsedOptions,
      newOptionText: "",
      placeholder: q.placeholder || "",
      helpText: q.helpText || "",
      category: q.category || "GENERAL",
      isActive: q.isActive !== false });
    setIsEditModalOpen(true);
  };

  const handleAddOption = () => {
    if (!formData.newOptionText.trim()) return;
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, prev.newOptionText.trim()],
      newOptionText: "" }));
  };

  const handleRemoveOption = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, idx) => idx !== indexToRemove) }));
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim()) {
      addToast({
        title: "Validation Error",
        description: "Question prompt text is required",
        type: "error" });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        question: formData.question.trim(),
        fieldType: formData.fieldType,
        isRequired: formData.isRequired,
        options: formData.options.length > 0 ? formData.options : undefined,
        placeholder: formData.placeholder.trim() || undefined,
        helpText: formData.helpText.trim() || undefined,
        category: formData.category,
        isActive: formData.isActive };

      if (editingQuestion) {
        await applicantsService.updateQuestion(editingQuestion.id, payload);
        addToast({
          title: "Question Updated",
          description: "Application field modified successfully",
          type: "success" });
      } else {
        await applicantsService.createQuestion({
          ...payload,
          orderNumber: questions.length + 1 });
        addToast({
          title: "Question Created",
          description: "New application field added to public candidate form",
          type: "success" });
      }

      setIsEditModalOpen(false);
      await loadQuestions();
    } catch (err: any) {
      addToast({
        title: "Save Failed",
        description: err.message || "Failed to save application question",
        type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingQuestion) return;
    try {
      await applicantsService.deleteQuestion(deletingQuestion.id);
      addToast({
        title: "Question Removed",
        description: "Field has been deactivated or deleted from application form",
        type: "success" });
      setDeletingQuestion(null);
      await loadQuestions();
    } catch (err: any) {
      addToast({
        title: "Delete Failed",
        description: err.message || "Failed to remove question",
        type: "error" });
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const newQuestions = [...questions];
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[targetIndex];
    newQuestions[targetIndex] = temp;

    // Build reorder payload
    const questionOrders = newQuestions.map((q, idx) => ({
      id: q.id,
      orderNumber: idx + 1 }));

    setQuestions(newQuestions);

    try {
      await applicantsService.reorderQuestions(questionOrders);
      addToast({
        title: "Order Saved",
        description: "Application form sequence updated",
        type: "success" });
    } catch (err: any) {
      addToast({
        title: "Reorder Failed",
        description: err.message || "Failed to persist question ordering",
        type: "error" });
      await loadQuestions();
    }
  };

  const handleToggleActive = async (q: FormQuestion) => {
    try {
      const nextActive = q.isActive === false;
      await applicantsService.updateQuestion(q.id, {
        isActive: nextActive });
      setQuestions((prev) =>
        prev.map((item) => (item.id === q.id ? { ...item, isActive: nextActive } : item))
      );
      addToast({
        title: nextActive ? "Question Activated" : "Question Deactivated",
        description: nextActive
          ? "Field is now active on candidate application form"
          : "Field hidden from candidate application form",
        type: "info" });
    } catch (err: any) {
      addToast({
        title: "Update Failed",
        description: err.message || "Could not toggle question status",
        type: "error" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Builder Sub-header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 rounded-2xl border border-border/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-text flex items-center gap-2">
              <Sliders className="w-5 h-5 text-gold" />
              Dynamic Application Form Builder
            </h2>
            <Badge variant="gold" size="sm">
              Authoritative Schema
            </Badge>
          </div>
          <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
            Configure custom qualification questions, required portfolio links, and technical assessment fields for the public candidate application portal (<code>/apply</code>).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant={previewMode ? "primary" : "outline"}
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            icon={<Eye className="w-4 h-4" />}
          >
            {previewMode ? "Exit Live Preview" : "Live Form Preview"}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Question
          </Button>

          <IconButton
            icon={<RefreshCw className="w-4 h-4" />}
            aria-label="Refresh Questions"
            variant="ghost"
            size="sm"
            onClick={loadQuestions}
            title="Refresh Form Schema"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      ) : previewMode ? (
        /* Live Form Simulator */
        <Card orientation="vertical" className="p-6 sm:p-8 space-y-6 border-gold/40">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-gold font-semibold uppercase tracking-wider">
                Simulated Candidate View
              </span>
              <h3 className="text-xl font-bold text-text">Live Preview of /apply Custom Section</h3>
            </div>
            <a
              href="/apply"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-gold hover:underline font-medium"
            >
              Open Public /apply Portal <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-5 max-w-3xl">
            {questions
              .filter((q) => q.isActive !== false)
              .map((q, idx) => {
                const title = q.question || q.questionText || "Question";
                const type = (q.fieldType || "SHORT_TEXT").toUpperCase();
                const optionsList = Array.isArray(q.options)
                  ? q.options
                  : typeof q.options === "string"
                  ? (q.options as string).split(",").map((s) => s.trim()).filter(Boolean)
                  : [];

                return (
                  <div key={q.id} className="p-4 rounded-xl bg-surface-hover/50 border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-text flex items-center gap-1.5">
                        <span className="text-gold font-mono">Q{idx + 1}.</span> {title}
                        {q.isRequired && <span className="text-rose-500 font-bold">*</span>}
                      </label>
                      <Badge variant="outline" size="sm">
                        {q.category || "GENERAL"}
                      </Badge>
                    </div>

                    {q.helpText && (
                      <p className="text-[11px] text-text-muted flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-gold" /> {q.helpText}
                      </p>
                    )}

                    {type === "LONG_TEXT" ? (
                      <textarea
                        rows={3}
                        placeholder={q.placeholder || "Enter response here..."}
                        className="w-full px-3.5 py-2 text-xs bg-surface rounded-lg border border-border outline-none"
                        disabled
                      />
                    ) : type === "DROPDOWN" ? (
                      <select
                        className="w-full px-3.5 py-2 text-xs bg-surface rounded-lg border border-border outline-none text-text"
                        disabled
                      >
                        <option value="">Select option...</option>
                        {optionsList.map((opt, oIdx) => (
                          <option key={oIdx} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : type === "RADIO" ? (
                      <div className="space-y-1.5 pt-1">
                        {optionsList.map((opt, oIdx) => (
                          <label key={oIdx} className="flex items-center gap-2 text-xs text-text">
                            <input type="radio" disabled checked={oIdx === 0} />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : type === "CHECKBOX" ? (
                      <div className="space-y-1.5 pt-1">
                        {optionsList.length > 0 ? (
                          optionsList.map((opt, oIdx) => (
                            <label key={oIdx} className="flex items-center gap-2 text-xs text-text">
                              <input type="checkbox" disabled checked={oIdx === 0} />
                              <span>{opt}</span>
                            </label>
                          ))
                        ) : (
                          <label className="flex items-center gap-2 text-xs text-text">
                            <input type="checkbox" disabled checked />
                            <span>{q.placeholder || "I confirm / agree"}</span>
                          </label>
                        )}
                      </div>
                    ) : type === "NUMBER" ? (
                      <input
                        type="number"
                        placeholder={q.placeholder || "0"}
                        className="w-full px-3.5 py-2 text-xs bg-surface rounded-lg border border-border outline-none text-text"
                        disabled
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder={q.placeholder || "Your answer..."}
                        className="w-full px-3.5 py-2 text-xs bg-surface rounded-lg border border-border outline-none text-text"
                        disabled
                      />
                    )}
                  </div>
                );
              })}
          </div>
        </Card>
      ) : questions.length === 0 ? (
        <EmptyState
          icon={<FileQuestion className="w-10 h-10 text-gold" />}
          title="No Application Questions Configured"
          description="Create custom qualification and assessment fields to dynamically gather structured candidate profiles."
          action={{
            label: "Create First Question",
            onClick: openCreateModal }}
        />
      ) : (
        /* Questions Management List */
        <div className="space-y-3">
          {questions.map((q, index) => {
            const title = q.question || q.questionText || "Untitled Question";
            const fieldTypeObj = FIELD_TYPES.find((f) => f.value === q.fieldType);
            const isFirst = index === 0;
            const isLast = index === questions.length - 1;
            const isActive = q.isActive !== false;

            return (
              <div
                key={q.id}
                className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                  isActive
                    ? "bg-surface border-border/80 hover:border-gold/50 shadow-2xs"
                    : "bg-surface/50 border-dashed border-border/50 opacity-60"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex flex-col items-center justify-center min-w-[36px] h-9 rounded-lg bg-surface-hover border border-border font-mono text-xs font-bold text-gold">
                    #{index + 1}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-semibold text-text">{title}</h4>
                      {q.isRequired ? (
                        <Badge variant="rose" size="sm">
                          Required
                        </Badge>
                      ) : (
                        <Badge variant="outline" size="sm">
                          Optional
                        </Badge>
                      )}
                      <Badge variant="gold" size="sm">
                        {fieldTypeObj?.label.split("(")[0] || q.fieldType}
                      </Badge>
                      <Badge variant="neutral" size="sm">
                        {q.category || "GENERAL"}
                      </Badge>
                    </div>

                    {q.helpText && (
                      <p className="text-xs text-text-muted line-clamp-1">{q.helpText}</p>
                    )}

                    {Array.isArray(q.options) && q.options.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <span
                            key={oIdx}
                            className="inline-block text-[10px] px-2 py-0.5 rounded bg-surface-hover text-text-muted border border-border"
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end md:self-center">
                  <IconButton
                    icon={<ArrowUp className="w-3.5 h-3.5" />}
                    aria-label="Move Up"
                    variant="ghost"
                    size="sm"
                    disabled={isFirst}
                    onClick={() => handleMoveOrder(index, "up")}
                    title="Move Question Up"
                  />
                  <IconButton
                    icon={<ArrowDown className="w-3.5 h-3.5" />}
                    aria-label="Move Down"
                    variant="ghost"
                    size="sm"
                    disabled={isLast}
                    onClick={() => handleMoveOrder(index, "down")}
                    title="Move Question Down"
                  />

                  <IconButton
                    icon={
                      isActive ? (
                        <ToggleRight className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-text-muted" />
                      )
                    }
                    aria-label={isActive ? "Deactivate Question" : "Activate Question"}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(q)}
                    title={isActive ? "Deactivate" : "Activate"}
                  />

                  <IconButton
                    icon={<Edit2 className="w-3.5 h-3.5 text-gold" />}
                    aria-label="Edit Question"
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(q)}
                    title="Edit Field Configuration"
                  />

                  <IconButton
                    icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                    aria-label="Delete Question"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingQuestion(q)}
                    title="Delete Question"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Question Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={editingQuestion ? "Edit Application Field" : "Create Application Question"}
        size="md"
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Question Prompt / Field Label <span className="text-rose-500">*</span>
            </label>
            <Input
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="e.g. Years of hands-on experience with TypeScript and React"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">Field Type</label>
              <Select
                value={formData.fieldType}
                onChange={(e) => setFormData({ ...formData, fieldType: e.target.value })}
                options={FIELD_TYPES}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1">Category</label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                options={CATEGORIES}
              />
            </div>
          </div>

          {/* Options Manager for choice fields */}
          {["DROPDOWN", "RADIO", "CHECKBOX", "SELECT", "MULTI_SELECT"].includes(
            formData.fieldType
          ) && (
            <div className="space-y-2 p-3 bg-surface-hover/50 rounded-xl border border-border">
              <label className="block text-xs font-semibold text-text">
                Selection Options (Dropdown / Radio / Checkbox)
              </label>

              <div className="flex items-center gap-2">
                <Input
                  value={formData.newOptionText}
                  onChange={(e) => setFormData({ ...formData, newOptionText: e.target.value })}
                  placeholder="e.g. Senior (5+ years)"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
                  Add
                </Button>
              </div>

              {formData.options.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {formData.options.map((opt, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-surface text-text border border-border"
                    >
                      {opt}
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="text-rose-500 hover:text-rose-700 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-text mb-1">Placeholder Text</label>
            <Input
              value={formData.placeholder}
              onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
              placeholder="e.g. Type your response..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">Help / Subtext</label>
            <Textarea
              rows={2}
              value={formData.helpText}
              onChange={(e) => setFormData({ ...formData, helpText: e.target.value })}
              placeholder="Guidance displayed beneath the input prompt"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-text cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isRequired}
                onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                className="w-4 h-4 rounded text-gold focus:ring-gold border-border"
              />
              <span>Mandatory / Required Field</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-text cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded text-gold focus:ring-gold border-border"
              />
              <span>Active on Public Form</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
              {editingQuestion ? "Save Changes" : "Create Field"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingQuestion}
        onClose={() => setDeletingQuestion(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Application Question"
        message={`Are you sure you want to remove the question "${
          deletingQuestion?.question || deletingQuestion?.questionText
        }"? It will no longer be shown on the public candidate form.`}
        confirmText="Remove Question"
        variant="danger"
      />
    </div>
  );
};
