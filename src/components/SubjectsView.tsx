import React, { useState } from 'react';
import {
  Plus,
  Search,
  BookOpen,
  ArrowRight,
  Trash2,
  Filter,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { Subject } from '../types';

interface SubjectsViewProps {
  subjects: Subject[];
  onSelectSubject: (subjectId: string) => void;
  onCreateSubject: (data: Partial<Subject>) => void;
  onDeleteSubject: (subjectId: string) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  onSelectSubject,
  onCreateSubject,
  onDeleteSubject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [classOrCourse, setClassOrCourse] = useState('');
  const [description, setDescription] = useState('');
  const [learningGoals, setLearningGoals] = useState('');

  const filtered = subjects.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === 'all' || s.educationLevel === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateSubject({
      name: name.trim(),
      classOrCourse: classOrCourse.trim() || 'General Course',
      description: description.trim() || 'Personal learning curriculum track',
      learningGoals: learningGoals.split(',').map(g => g.trim()).filter(Boolean),
    });

    setName('');
    setClassOrCourse('');
    setDescription('');
    setLearningGoals('');
    setShowAddModal(false);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            My Subjects
          </h1>
          <p className="text-[#9299A3] text-sm mt-1">
            Manage your curriculum workspaces, syllabus, and learning goals.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-lg bg-[#FF681F] hover:bg-[#FF8247] text-white font-semibold text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-md shadow-[#FF681F]/30 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#9299A3] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search subjects or topics..."
            className="w-full bg-[#151A20] border border-[#292F36] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#9299A3] focus:outline-none focus:border-[#FF681F]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-[#9299A3]" />
          <select
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value)}
            className="bg-[#151A20] border border-[#292F36] text-xs text-[#9299A3] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#FF681F]"
          >
            <option value="all">All Levels</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="high_school">High School</option>
            <option value="school">School</option>
          </select>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(subject => (
          <div
            key={subject.id}
            className="bg-[#151A20] border border-[#292F36] rounded-2xl p-6 flex flex-col justify-between hover:border-[#FF681F]/50 transition-all hover:-translate-y-1 group"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF681F] bg-[#FF681F]/10 px-2 py-0.5 rounded">
                    {subject.classOrCourse}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-2 group-hover:text-[#FF681F] transition-colors">
                    {subject.name}
                  </h3>
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    if (confirm(`Delete ${subject.name}?`)) onDeleteSubject(subject.id);
                  }}
                  className="text-[#9299A3] hover:text-[#EF6262] p-1 transition-colors"
                  title="Delete subject"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#9299A3] mt-2 line-clamp-2">
                {subject.description}
              </p>

              {/* Progress bar */}
              <div className="mt-5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#9299A3]">Mastery</span>
                  <span className="font-bold text-white">{subject.masteryPercentage}%</span>
                </div>
                <div className="w-full bg-[#101419] h-2 rounded-full overflow-hidden border border-[#292F36]">
                  <div
                    className="bg-[#FF681F] h-full transition-all"
                    style={{ width: `${subject.masteryPercentage}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-[#9299A3]">
                <span>{subject.totalTopics} Topics</span>
                <span>Last studied {subject.lastStudiedFormatted}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#292F36] flex items-center justify-between">
              <span className="text-xs text-[#27C281] font-semibold flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+{subject.monthlyProgress}% this month</span>
              </span>

              <button
                onClick={() => onSelectSubject(subject.id)}
                className="px-4 py-1.5 rounded-lg bg-[#1B222A] hover:bg-[#FF681F] text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors group-hover:bg-[#FF681F]"
              >
                <span>OPEN</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#151A20] border border-[#292F36] rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-1">Create New Subject</h3>
            <p className="text-xs text-[#9299A3] mb-6">
              Organise your syllabus, chapters, and topics for adaptive AI guidance.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Data Structures & Algorithms"
                  className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF681F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                  Class / Course Code
                </label>
                <input
                  type="text"
                  value={classOrCourse}
                  onChange={e => setClassOrCourse(e.target.value)}
                  placeholder="e.g. CS-202 / Grade 12"
                  className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF681F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief overview of what you will master..."
                  className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#FF681F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                  Learning Goals (comma separated)
                </label>
                <input
                  type="text"
                  value={learningGoals}
                  onChange={e => setLearningGoals(e.target.value)}
                  placeholder="e.g. Binary Trees, Graph Traversal, Big-O"
                  className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF681F]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#292F36]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-[#9299A3] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#FF681F] hover:bg-[#FF8247] text-white font-semibold text-sm transition-colors shadow-md shadow-[#FF681F]/30"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
