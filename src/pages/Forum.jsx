import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Link } from 'react-router-dom';

const categories = [
  { key: 'semua', label: 'Semua' },
  { key: 'umum', label: '💬 Umum' },
  { key: 'diskusi', label: '📖 Diskusi' },
  { key: 'tanya', label: '❓ Tanya Jawab' },
  { key: 'sharing', label: '💡 Sharing' },
];

const Forum = () => {
  const { user, isAdmin } = useAuth();
  const data = useData();
  const topics = data.forum;
  const [filter, setFilter] = useState('semua');
  const [openTopic, setOpenTopic] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('umum');
  const [replyText, setReplyText] = useState('');

  const filtered = filter === 'semua' ? topics : topics.filter(t => t.category === filter);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    await data.createTopic(user.id, user.name, newTitle.trim(), newContent.trim(), newCategory);
    setNewTitle(''); setNewContent(''); setShowNew(false);
  };

  const handleReply = async (topicId) => {
    if (!replyText.trim()) return;
    await data.addReply(topicId, user.id, user.name, replyText.trim());
    setReplyText('');
  };

  const handleDelete = async (topicId) => {
    if (!window.confirm('Hapus topik ini?')) return;
    await data.deleteTopic(topicId);
    setOpenTopic(null);
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'baru saja';
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} hari lalu`;
    return new Date(date).toLocaleDateString('id-ID');
  };

  const getCatColor = (cat) => {
    const map = { umum: 'bg-gray-100 text-gray-600', diskusi: 'bg-blue-50 text-blue-600', tanya: 'bg-purple-50 text-purple-600', sharing: 'bg-green-50 text-green-600' };
    return map[cat] || 'bg-gray-100 text-gray-600';
  };

  const getCatLabel = (cat) => {
    const map = { umum: '💬 Umum', diskusi: '📖 Diskusi', tanya: '❓ Tanya Jawab', sharing: '💡 Sharing' };
    return map[cat] || cat;
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-hijau pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">💬 Forum <span className="text-kuning">Diskusi</span></h1>
          <p className="text-white/50 text-sm">Ruang diskusi antar anggota KSEI RIIEF</p>
        </div>
      </section>

      <section className="py-8 bg-gray-50 min-h-[60vh]">
        <div className="max-w-4xl mx-auto px-4">

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
            <div className="flex flex-wrap gap-1.5">
              {categories.map(c => (
                <button key={c.key} onClick={() => setFilter(c.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === c.key ? 'bg-hijau text-white' : 'bg-white text-gray-500 border border-gray-100 hover:border-hijau/30'}`}>
                  {c.label}
                </button>
              ))}
            </div>
            {user ? (
              <button onClick={() => setShowNew(!showNew)}
                className="px-4 py-2 bg-hijau text-white rounded-lg text-sm font-semibold hover:bg-hijau-tua transition-colors">
                + Topik Baru
              </button>
            ) : (
              <Link to="/login" className="px-4 py-2 bg-hijau text-white rounded-lg text-sm font-semibold hover:bg-hijau-tua transition-colors">
                Login untuk berdiskusi
              </Link>
            )}
          </div>

          {/* New topic form */}
          {showNew && user && (
            <form onSubmit={handleCreate} className="bg-white rounded-xl p-5 border border-gray-100 mb-5 space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">📝 Buat Topik Baru</h3>
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Judul topik..."
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-hijau/20 focus:border-hijau" required />
              <textarea rows={3} value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Tulis isi diskusi..."
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-hijau/20 focus:border-hijau resize-none" required />
              <div className="flex items-center gap-3">
                <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-hijau/20">
                  <option value="umum">💬 Umum</option>
                  <option value="diskusi">📖 Diskusi</option>
                  <option value="tanya">❓ Tanya Jawab</option>
                  <option value="sharing">💡 Sharing</option>
                </select>
                <button type="submit" className="px-4 py-2 bg-hijau text-white rounded-lg text-sm font-semibold hover:bg-hijau-tua">Posting</button>
                <button type="button" onClick={() => setShowNew(false)} className="px-4 py-2 text-gray-500 text-sm">Batal</button>
              </div>
            </form>
          )}

          {/* Topic list */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center text-gray-400 text-sm border border-gray-100">Belum ada topik diskusi</div>
          ) : (
            <div className="space-y-2">
              {filtered.map(topic => (
                <div key={topic.id}>
                  <div onClick={() => setOpenTopic(openTopic === topic.id ? null : topic.id)}
                    className={`bg-white rounded-xl p-4 border cursor-pointer transition-all hover:shadow-sm ${
                      openTopic === topic.id ? 'border-hijau/30 shadow-sm' : 'border-gray-100'
                    }`}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-hijau/10 text-hijau flex items-center justify-center font-bold text-sm shrink-0">
                        {topic.userName?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getCatColor(topic.category)}`}>
                            {getCatLabel(topic.category)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mt-1">{topic.title}</h3>
                        <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{topic.content}</p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                          <span>{topic.userName}</span>
                          <span>•</span>
                          <span>{timeAgo(topic.createdAt)}</span>
                          <span>•</span>
                          <span>💬 {topic.replies.length} balasan</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded topic */}
                  {openTopic === topic.id && (
                    <div className="bg-white rounded-b-xl border-x border-b border-gray-100 -mt-1 px-4 pb-4">
                      <div className="pl-13 pt-3 border-t border-gray-50">
                        <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed mb-4">{topic.content}</p>

                        {isAdmin && (
                          <button onClick={() => handleDelete(topic.id)} className="text-xs text-red-500 hover:text-red-700 mb-4">🗑️ Hapus topik</button>
                        )}

                        {/* Replies */}
                        {topic.replies.length > 0 && (
                          <div className="space-y-2 mb-4">
                            <div className="text-xs font-semibold text-gray-400 uppercase">Balasan ({topic.replies.length})</div>
                            {topic.replies.map(r => (
                              <div key={r.id} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50">
                                <div className="w-7 h-7 rounded-lg bg-hijau/10 text-hijau flex items-center justify-center text-[10px] font-bold shrink-0">{r.userName?.[0]}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-900">{r.userName}</span>
                                    <span className="text-[10px] text-gray-400">{timeAgo(r.createdAt)}</span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap">{r.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply form */}
                        {user ? (
                          <div className="flex items-start gap-2">
                            <div className="w-7 h-7 rounded-lg bg-hijau text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">{user.name?.[0]}</div>
                            <div className="flex-1">
                              <textarea rows={2} value={replyText} onChange={e => setReplyText(e.target.value)}
                                placeholder="Tulis balasan..." className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-hijau/20 resize-none" />
                              <button onClick={() => handleReply(topic.id)} disabled={!replyText.trim()}
                                className="mt-1 px-3 py-1.5 bg-hijau text-white rounded-lg text-xs font-semibold hover:bg-hijau-tua disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                Balas
                              </button>
                            </div>
                          </div>
                        ) : (
                          <Link to="/login" className="text-hijau text-sm font-semibold hover:underline">Login untuk membalas</Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Forum;
