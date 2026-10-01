import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, MessageSquare, HelpCircle, Settings, LogOut, Trash2, Edit2, Check, X, Sparkles, LayoutDashboard, Info } from 'lucide-react';

export default function Sidebar({
  conversations,
  currentConvId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  isOpen,
  onClose
}) {
  const { user, logout } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const startEditing = (conv, e) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveEditing = (id, e) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside className={`fixed lg:static top-0 left-0 z-50 h-full w-72 bg-gray-100 text-gray-900 flex flex-col border-r border-gray-300 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Sidebar Header: Logo & New Chat */}
        <div className="p-4 border-b border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/images/abes_logo_icon.png"
                alt="ABES Logo"
                className="h-8 w-8 object-contain rounded-lg shrink-0 shadow-xs"
              />
              <div>
                <h1 className="font-headline font-bold text-gray-900 text-sm leading-tight">ABES University</h1>
                <p className="text-[11px] text-gray-700 font-label font-bold">Student Portal & AI</p>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="lg:hidden text-gray-700 hover:text-gray-900 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => { onNewChat(); if (isOpen) onClose(); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-red-800 text-white rounded-lg font-label font-bold text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>New Chat Session</span>
          </button>
        </div>

        {/* Conversation History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-2 py-1.5 text-[11px] font-label font-extrabold uppercase tracking-widest text-gray-700 flex items-center justify-between">
            <span>Recent Sessions</span>
            <span className="bg-gray-200 text-gray-900 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">{conversations.length}</span>
          </div>

          {conversations.length === 0 ? (
            <div className="text-center py-8 px-4 text-xs font-body text-gray-700 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-amber-600" />
              <p className="font-bold text-gray-900">No chat history yet.</p>
              <p className="text-[11px] text-gray-700">Start a new conversation to inquire!</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = conv.id === currentConvId;
              const isEditing = editingId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => { onSelectConversation(conv.id); if (isOpen) onClose(); }}
                  className={`group relative flex items-center justify-between px-3 py-2 rounded-lg text-xs font-label font-bold cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-white text-red-900 border border-gray-300 shadow-xs'
                      : 'hover:bg-white text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-red-800' : 'text-gray-600'}`} />

                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEditing(conv.id, e)}
                        className="w-full bg-white text-gray-900 px-2 py-0.5 rounded border border-gray-900 text-xs focus:outline-none"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="truncate">{conv.title}</span>
                    )}
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isEditing ? (
                      <button
                        onClick={(e) => saveEditing(conv.id, e)}
                        className="p-1 hover:text-black text-gray-700"
                        title="Save title"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={(e) => startEditing(conv, e)}
                          className="p-1 hover:text-black text-gray-700"
                          title="Rename chat"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteConversation(conv.id); }}
                          className="p-1 hover:text-red-700 text-gray-700"
                          title="Delete chat"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer Navigation */}
        <div className="p-3 border-t border-gray-300 space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-label font-bold text-gray-900 hover:bg-white transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-gray-900" />
            <span>Student Dashboard</span>
          </Link>

          <Link
            to="/about-abes"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-label font-bold text-gray-900 hover:bg-white transition-colors"
          >
            <Info className="w-4 h-4 text-gray-900" />
            <span>About ABES College</span>
          </Link>

          <Link
            to="/faqs"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-label font-bold text-gray-900 hover:bg-white transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-gray-900" />
            <span>FAQs Directory</span>
          </Link>

          <Link
            to="/settings"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-label font-bold text-gray-900 hover:bg-white transition-colors"
          >
            <Settings className="w-4 h-4 text-red-800" />
            <span>Settings</span>
          </Link>

          {/* Student Profile Summary */}
          {user && (
            <div className="pt-2 border-t border-gray-300 flex items-center justify-between px-3 py-2">
              <div className="min-w-0">
                <p className="text-xs font-label font-extrabold text-gray-900 truncate">{user.name}</p>
                <p className="text-[11px] text-red-800 font-mono font-bold truncate">{user.student_id}</p>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 text-gray-700 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
