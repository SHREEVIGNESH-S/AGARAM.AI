import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Upload,
  Download,
  Trash2,
  BookOpen,
  MessageSquareCode,
  CheckCircle,
  Copy,
  Printer,
  Plus,
} from 'lucide-react';
import { StudySummary, UploadedDocument, Subject } from '../types';

interface StudySummaryViewProps {
  subjects: Subject[];
  documents: UploadedDocument[];
  onUploadDocument: (doc: Partial<UploadedDocument>) => void;
  onDeleteDocument: (id: string) => void;
  onAskTutor: (topicTitle?: string) => void;
}

export const StudySummaryView: React.FC<StudySummaryViewProps> = ({
  subjects,
  documents,
  onUploadDocument,
  onDeleteDocument,
  onAskTutor,
}) => {
  const [summaries, setSummaries] = useState<StudySummary[]>([]);
  const [selectedSummary, setSelectedSummary] = useState<StudySummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generator inputs matching Page 13
  const [subject, setSubject] = useState(subjects[0]?.name || 'Computer Science');
  const [topic, setTopic] = useState('Pointers in C++');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [includeExamples, setIncludeExamples] = useState(true);
  const [includeKeyTerms, setIncludeKeyTerms] = useState(true);

  // Upload document modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadSubjectId, setUploadSubjectId] = useState('cs');
  const [uploadContent, setUploadContent] = useState('');

  const loadSummaries = () => {
    fetch('/api/summaries')
      .then(r => r.json())
      .then((data: StudySummary[]) => {
        setSummaries(data);
        if (!selectedSummary && data.length > 0) {
          setSelectedSummary(data[0]);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadSummaries();
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          difficulty,
          includeExamples,
          includeKeyTerms,
        }),
      });
      const data = await res.json();
      setSelectedSummary(data);
      loadSummaries();
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;

    onUploadDocument({
      fileName: uploadFileName.trim(),
      subjectId: uploadSubjectId,
      fileType: uploadFileName.endsWith('.docx') ? 'DOCX' : uploadFileName.endsWith('.txt') ? 'TXT' : 'PDF',
      extractedSnippet: uploadContent.trim() || 'Verified course syllabus & lecture notes chunked for AI Tutor context.',
      fileSizeFormatted: '1.2 MB',
    });

    setUploadFileName('');
    setUploadContent('');
    setShowUploadModal(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase text-[#FF681F] mb-1">
            <FileText className="w-4 h-4" />
            <span>High-Yield Synthesis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            AI Study Summary & Document Ingestion
          </h1>
          <p className="text-[#9299A3] text-sm mt-1">
            Generate concise topic references, upload your own textbooks/notes, and train the AI Tutor on your syllabus.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 rounded-lg bg-[#FF681F] hover:bg-[#FF8247] text-white font-semibold text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-md shadow-[#FF681F]/30 shrink-0 self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Learning Material</span>
        </button>
      </div>

      {/* Main Grid: Generator Controls + Summary Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Generator Form & Saved Summaries (Col 5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Summary Generator Card matching Page 13 */}
          <div className="bg-[#151A20] border border-[#292F36] rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Generate Study Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#FF681F] font-semibold uppercase mb-1">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF681F]"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#FF681F] font-semibold uppercase mb-1">
                  Topic or Concept *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. Pointers in C++"
                  className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF681F]"
                />
              </div>

              <div>
                <label className="block text-[#FF681F] font-semibold uppercase mb-1">
                  Desired Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF681F]"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="pt-2 flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeExamples}
                    onChange={e => setIncludeExamples(e.target.checked)}
                    className="accent-[#FF681F]"
                  />
                  <span className="text-white">Worked Examples</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeKeyTerms}
                    onChange={e => setIncludeKeyTerms(e.target.checked)}
                    className="accent-[#FF681F]"
                  />
                  <span className="text-white">Definitions & Pitfalls</span>
                </label>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-2.5 rounded-lg bg-[#FF681F] hover:bg-[#FF8247] text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center space-x-2 shadow-md shadow-[#FF681F]/25 disabled:opacity-50 mt-4"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Synthesizing...' : 'GENERATE SUMMARY (+40 XP)'}</span>
              </button>
            </div>
          </div>

          {/* Uploaded Learning Materials (Part 5 Ingestion Pipeline) */}
          <div className="bg-[#151A20] border border-[#292F36] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Uploaded Materials ({documents.length})
              </h3>
              <button
                onClick={() => setShowUploadModal(true)}
                className="text-xs text-[#FF681F] hover:underline font-semibold"
              >
                + Upload
              </button>
            </div>

            <div className="space-y-2.5">
              {documents.map(doc => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl bg-[#101419] border border-[#292F36] flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <FileText className="w-5 h-5 text-[#FF681F] shrink-0" />
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white truncate">{doc.fileName}</div>
                      <div className="text-[10px] text-[#9299A3]">
                        {doc.fileSizeFormatted} • {doc.chunkCount} vector chunks
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-1 text-[#9299A3] hover:text-[#EF6262] transition-colors"
                    title="Remove document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Generated Summary Display (Col 7) */}
        <div className="lg:col-span-7">
          {selectedSummary ? (
            <div className="bg-[#151A20] border border-[#292F36] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#292F36]">
                <div>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-[#FF681F]/20 text-[#FF681F]">
                    {selectedSummary.subject} • {selectedSummary.difficulty}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black uppercase text-white mt-1.5 tracking-wide">
                    {selectedSummary.topic}
                  </h2>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrint}
                    className="p-2 rounded-lg bg-[#101419] border border-[#292F36] text-[#9299A3] hover:text-white"
                    title="Print or Export as PDF"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onAskTutor(selectedSummary.topic)}
                    className="px-3.5 py-2 rounded-lg bg-[#FF681F] hover:bg-[#FF8247] text-white text-xs font-bold flex items-center space-x-1.5"
                  >
                    <MessageSquareCode className="w-3.5 h-3.5" />
                    <span>Ask AI Tutor</span>
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="text-sm text-[#F4F5F7] leading-relaxed whitespace-pre-line">
                {selectedSummary.content}
              </div>

              {/* Key Ideas */}
              {selectedSummary.keyIdeas && selectedSummary.keyIdeas.length > 0 && (
                <div className="bg-[#101419] p-4 rounded-xl border border-[#292F36] space-y-2">
                  <div className="text-xs font-bold uppercase text-[#27C281]">
                    Key Ideas & Mental Models
                  </div>
                  <ul className="text-xs text-[#F4F5F7] space-y-1 list-disc list-inside">
                    {selectedSummary.keyIdeas.map((idea, i) => (
                      <li key={i}>{idea}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Worked Example */}
              {selectedSummary.workedExample && (
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase text-[#FF681F]">
                    Worked Demonstration
                  </div>
                  <div className="bg-[#080A0D] p-4 rounded-xl font-mono text-xs text-[#FF8247] border border-[#292F36] overflow-x-auto">
                    <pre>{selectedSummary.workedExample}</pre>
                  </div>
                </div>
              )}

              {/* Common Mistakes */}
              {selectedSummary.commonMistakes && selectedSummary.commonMistakes.length > 0 && (
                <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/30 space-y-2">
                  <div className="text-xs font-bold uppercase text-red-400">
                    Common Pitfalls & Exam Traps
                  </div>
                  <ul className="text-xs text-[#F4F5F7] space-y-1 list-disc list-inside">
                    {selectedSummary.commonMistakes.map((pitfall, i) => (
                      <li key={i}>{pitfall}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#151A20] border border-[#292F36] rounded-2xl p-12 text-center text-[#9299A3]">
              <FileText className="w-12 h-12 text-[#FF681F] mx-auto mb-3 opacity-50" />
              <h3 className="text-base font-bold text-white">No Summary Selected</h3>
              <p className="text-xs text-[#9299A3] mt-1">
                Enter a topic on the left and click Generate to produce a high-yield reference.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#151A20] border border-[#292F36] rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-1">Upload Learning Materials</h3>
            <p className="text-xs text-[#9299A3] mb-6">
              PDF, DOCX, or TXT notes will be chunked and indexed so the AI Tutor references your syllabus directly.
            </p>

            <form onSubmit={handleDocumentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                  File Name *
                </label>
                <input
                  type="text"
                  required
                  value={uploadFileName}
                  onChange={e => setUploadFileName(e.target.value)}
                  placeholder="e.g. CS201_Memory_Lecture_Notes.pdf"
                  className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF681F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                  Associate With Subject
                </label>
                <select
                  value={uploadSubjectId}
                  onChange={e => setUploadSubjectId(e.target.value)}
                  className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF681F]"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                  Document Text / Notes Content
                </label>
                <textarea
                  rows={5}
                  value={uploadContent}
                  onChange={e => setUploadContent(e.target.value)}
                  placeholder="Paste lecture notes, textbook definitions, formula sheets, or syllabus points..."
                  className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#FF681F]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#292F36]">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-sm text-[#9299A3] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#FF681F] hover:bg-[#FF8247] text-white font-semibold text-sm transition-colors shadow-md shadow-[#FF681F]/30"
                >
                  Ingest & Vectorize (+30 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
