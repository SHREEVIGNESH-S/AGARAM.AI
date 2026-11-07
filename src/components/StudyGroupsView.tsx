import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  ThumbsUp,
  MessageSquare,
  Share2,
  FileText,
  Clock,
  Sparkles,
  CheckCircle,
  Tag,
} from 'lucide-react';
import { StudyGroup, GroupQuestion, UploadedDocument } from '../types';

interface StudyGroupsViewProps {
  documents: UploadedDocument[];
  onUploadNotes: () => void;
}

export const StudyGroupsView: React.FC<StudyGroupsViewProps> = ({ documents }) => {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showAskModal, setShowAskModal] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState<string | null>(null);

  // New group form
  const [groupName, setGroupName] = useState('');
  const [groupSubject, setGroupSubject] = useState('Computer Science');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupMeeting, setGroupMeeting] = useState('');

  // New question form
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionContent, setQuestionContent] = useState('');
  const [questionTopic, setQuestionTopic] = useState('');
  const [questionTags, setQuestionTags] = useState('');

  // Answer form
  const [answerContent, setAnswerContent] = useState('');

  const loadGroups = () => {
    fetch('/api/groups')
      .then(r => r.json())
      .then((data: StudyGroup[]) => {
        setGroups(data);
        if (!selectedGroup && data.length > 0) {
          setSelectedGroup(data[0]);
        } else if (selectedGroup) {
          const fresh = data.find(g => g.id === selectedGroup.id);
          if (fresh) setSelectedGroup(fresh);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: groupName.trim(),
        subject: groupSubject,
        description: groupDescription.trim(),
        meetingTime: groupMeeting.trim(),
      }),
    });
    if (res.ok) {
      setGroupName('');
      setGroupDescription('');
      setGroupMeeting('');
      setShowCreateGroupModal(false);
      loadGroups();
    }
  };

  const handleToggleJoin = async (group: StudyGroup) => {
    const endpoint = group.isMember ? `/api/groups/${group.id}/leave` : `/api/groups/${group.id}/join`;
    await fetch(endpoint, { method: 'POST' });
    loadGroups();
  };

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !questionTitle.trim()) return;

    await fetch(`/api/groups/${selectedGroup.id}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: questionTitle.trim(),
        content: questionContent.trim(),
        topicName: questionTopic.trim() || 'General',
        tags: questionTags.split(',').map(t => t.trim()).filter(Boolean),
      }),
    });

    setQuestionTitle('');
    setQuestionContent('');
    setQuestionTopic('');
    setQuestionTags('');
    setShowAskModal(false);
    loadGroups();
  };

  const handlePostAnswer = async (questionId: string) => {
    if (!selectedGroup || !answerContent.trim()) return;

    await fetch(`/api/groups/${selectedGroup.id}/questions/${questionId}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: answerContent.trim() }),
    });

    setAnswerContent('');
    setShowAnswerModal(null);
    loadGroups();
  };

  const handleUpvoteAnswer = async (answerId: string) => {
    if (!selectedGroup) return;
    await fetch(`/api/groups/${selectedGroup.id}/answers/${answerId}/upvote`, {
      method: 'POST',
    });
    loadGroups();
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase text-[#FF681F] mb-1">
            <Users className="w-4 h-4" />
            <span>Collaborative Learning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Peer Study Groups
          </h1>
          <p className="text-[#9299A3] text-sm mt-1">
            Collaborate with peers, share learning notes, discuss questions, and upvote helpful explanations.
          </p>
        </div>

        <button
          onClick={() => setShowCreateGroupModal(true)}
          className="px-4 py-2.5 rounded-lg bg-[#FF681F] hover:bg-[#FF8247] text-white font-semibold text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-md shadow-[#FF681F]/30 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Study Group</span>
        </button>
      </div>

      {/* Main Grid: Left Group Selector & Right Forum Discussions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Group Cards (Col 4) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase text-[#9299A3] tracking-wider mb-2">
            Active Study Circles ({groups.length})
          </h3>

          {groups.map(group => {
            const isSelected = selectedGroup?.id === group.id;
            return (
              <div
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#1B222A] border-[#FF681F] shadow-lg'
                    : 'bg-[#151A20] border-[#292F36] hover:border-[#FF681F]/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#FF681F]/15 text-[#FF681F]">
                    {group.subject}
                  </span>
                  <span className="text-xs text-[#9299A3]">
                    {group.memberCount} members
                  </span>
                </div>

                <h4 className="text-base font-bold text-white mt-2">
                  {group.name}
                </h4>
                <p className="text-xs text-[#9299A3] mt-1 line-clamp-2">
                  {group.description}
                </p>

                <div className="mt-3 pt-3 border-t border-[#292F36] flex items-center justify-between text-xs">
                  <span className="text-[#9299A3]">
                    {group.questions.length} questions
                  </span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleToggleJoin(group);
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                      group.isMember
                        ? 'bg-[#27C281]/20 text-[#27C281]'
                        : 'bg-[#FF681F] text-white hover:bg-[#FF8247]'
                    }`}
                  >
                    {group.isMember ? '✓ Joined' : '+ Join Group'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Group Discussions & Shared Notes (Col 8) */}
        {selectedGroup && (
          <div className="lg:col-span-8 space-y-6">
            {/* Group Banner */}
            <div className="bg-[#151A20] border border-[#292F36] rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded bg-[#FF681F]/20 text-[#FF681F]">
                    {selectedGroup.subject}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
                    {selectedGroup.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#9299A3] mt-1">
                    {selectedGroup.description}
                  </p>
                  {selectedGroup.meetingTime && (
                    <div className="flex items-center space-x-1.5 text-xs text-[#27C281] mt-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{selectedGroup.meetingTime}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={() => setShowAskModal(true)}
                    className="px-4 py-2 rounded-lg bg-[#FF681F] hover:bg-[#FF8247] text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-md shadow-[#FF681F]/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Post Question</span>
                  </button>
                </div>
              </div>

              {/* Shared Learning Materials inside this Group */}
              <div className="mt-5 pt-4 border-t border-[#292F36]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-[#9299A3] flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#FF681F]" />
                    <span>Shared Materials in Group</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {documents.slice(0, 3).map(doc => (
                    <div
                      key={doc.id}
                      className="px-3 py-1.5 rounded-lg bg-[#101419] border border-[#292F36] text-xs text-[#F4F5F7] flex items-center space-x-2"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#FF681F]" />
                      <span className="font-medium">{doc.fileName}</span>
                      <span className="text-[10px] text-[#9299A3]">({doc.fileSizeFormatted})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase text-white tracking-wider">
                Group Questions & Answers ({selectedGroup.questions.length})
              </h3>

              {selectedGroup.questions.length === 0 ? (
                <div className="bg-[#151A20] border border-[#292F36] rounded-2xl p-8 text-center text-[#9299A3]">
                  <MessageSquare className="w-8 h-8 text-[#FF681F] mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-medium">No questions posted yet in this study circle.</p>
                  <p className="text-xs text-[#9299A3] mt-1">Be the first to post a question for your peers!</p>
                  <button
                    onClick={() => setShowAskModal(true)}
                    className="mt-4 px-4 py-2 bg-[#FF681F] text-white text-xs font-semibold rounded-lg"
                  >
                    Post First Question
                  </button>
                </div>
              ) : (
                selectedGroup.questions.map(q => (
                  <div
                    key={q.id}
                    className="bg-[#151A20] border border-[#292F36] rounded-2xl p-5 sm:p-6 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2 text-xs text-[#9299A3]">
                          <span className="font-semibold text-white">{q.authorName}</span>
                          <span>•</span>
                          <span>{q.createdAt}</span>
                          <span>•</span>
                          <span className="text-[#FF681F] font-medium">{q.topicName}</span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-white mt-1">
                          {q.title}
                        </h4>
                      </div>

                      <div className="flex items-center space-x-1">
                        {q.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono bg-[#101419] border border-[#292F36] text-[#9299A3] px-2 py-0.5 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-[#F4F5F7] leading-relaxed">
                      {q.content}
                    </p>

                    {/* Answers List */}
                    <div className="space-y-3 pt-3 border-t border-[#292F36]">
                      <div className="text-xs font-bold uppercase text-[#9299A3]">
                        {q.answers.length} Answers
                      </div>

                      {q.answers.map(ans => (
                        <div
                          key={ans.id}
                          className="bg-[#101419] border border-[#292F36] rounded-xl p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-xs">
                              <span className="font-bold text-white">{ans.authorName}</span>
                              <span className="text-[#9299A3]">• {ans.createdAt}</span>
                              {ans.isAccepted && (
                                <span className="flex items-center space-x-1 text-[10px] font-bold text-[#27C281] bg-[#27C281]/15 px-2 py-0.5 rounded">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Accepted Solution</span>
                                </span>
                              )}
                            </div>

                            {/* Upvote Button with Like Feature requested by user */}
                            <button
                              onClick={() => handleUpvoteAnswer(ans.id)}
                              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                                ans.hasUpvoted
                                  ? 'bg-[#FF681F]/20 border-[#FF681F] text-[#FF681F]'
                                  : 'bg-[#151A20] border-[#292F36] text-[#9299A3] hover:text-white'
                              }`}
                              title="Upvote helpful answer"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>{ans.upvotes}</span>
                            </button>
                          </div>

                          <p className="text-xs sm:text-sm text-[#F4F5F7] leading-relaxed">
                            {ans.content}
                          </p>
                        </div>
                      ))}

                      {/* Add Answer Form */}
                      {showAnswerModal === q.id ? (
                        <div className="mt-3 space-y-2">
                          <textarea
                            rows={3}
                            value={answerContent}
                            onChange={e => setAnswerContent(e.target.value)}
                            placeholder="Write your explanation or answer..."
                            className="w-full bg-[#101419] border border-[#292F36] rounded-lg p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF681F]"
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setShowAnswerModal(null)}
                              className="px-3 py-1.5 text-xs text-[#9299A3] hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handlePostAnswer(q.id)}
                              className="px-4 py-1.5 bg-[#FF681F] hover:bg-[#FF8247] text-white text-xs font-semibold rounded-lg"
                            >
                              Submit Answer (+30 XP)
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowAnswerModal(q.id)}
                          className="text-xs font-semibold text-[#FF681F] hover:underline"
                        >
                          + Write an answer
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#151A20] border border-[#292F36] rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-2">Create Study Group</h3>
            <p className="text-xs text-[#9299A3] mb-6">
              Launch a collaborative learning circle for your subject or cohort.
            </p>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  placeholder="e.g. C++ Memory & Systems Masters"
                  className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF681F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                  Subject
                </label>
                <select
                  value={groupSubject}
                  onChange={e => setGroupSubject(e.target.value)}
                  className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF681F]"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Physics">Physics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={groupDescription}
                  onChange={e => setGroupDescription(e.target.value)}
                  placeholder="Focus topics, objectives, and collaboration goals..."
                  className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#FF681F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                  Meeting Schedule (Optional)
                </label>
                <input
                  type="text"
                  value={groupMeeting}
                  onChange={e => setGroupMeeting(e.target.value)}
                  placeholder="e.g. Tuesdays & Thursdays at 6:00 PM"
                  className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF681F]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#292F36]">
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  className="px-4 py-2 text-sm text-[#9299A3] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#FF681F] hover:bg-[#FF8247] text-white font-semibold text-sm transition-colors shadow-md shadow-[#FF681F]/30"
                >
                  Create Group (+60 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Question Modal */}
      {showAskModal && selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#151A20] border border-[#292F36] rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-1">Post Question to {selectedGroup.name}</h3>
            <p className="text-xs text-[#9299A3] mb-6">
              Ask your peers for explanations, code reviews, or concept breakdowns.
            </p>

            <form onSubmit={handlePostQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                  Question Title *
                </label>
                <input
                  type="text"
                  required
                  value={questionTitle}
                  onChange={e => setQuestionTitle(e.target.value)}
                  placeholder="e.g. Difference between delete and delete[] in modern C++?"
                  className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF681F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                  Topic or Concept
                </label>
                <input
                  type="text"
                  value={questionTopic}
                  onChange={e => setQuestionTopic(e.target.value)}
                  placeholder="e.g. Pointers & Memory"
                  className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF681F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                  Details & Code Context
                </label>
                <textarea
                  rows={4}
                  required
                  value={questionContent}
                  onChange={e => setQuestionContent(e.target.value)}
                  placeholder="Explain what you are trying to understand and what you have attempted..."
                  className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#FF681F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#FF681F] mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={questionTags}
                  onChange={e => setQuestionTags(e.target.value)}
                  placeholder="e.g. pointers, heap, memory-leaks"
                  className="w-full bg-[#101419] border border-[#292F36] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF681F]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#292F36]">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="px-4 py-2 text-sm text-[#9299A3] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#FF681F] hover:bg-[#FF8247] text-white font-semibold text-sm transition-colors shadow-md shadow-[#FF681F]/30"
                >
                  Post Question (+20 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
