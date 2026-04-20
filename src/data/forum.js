import { saveAndSync } from './fireSync';

const STORAGE_KEY = 'ksei_forum';

// --- Read ---
export const getTopics = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
export const saveTopics = (data) => saveAndSync(STORAGE_KEY, data);
export const getTopicById = (id) => getTopics().find(t => t.id === id);

// --- Create Topic ---
export const createTopic = (userId, userName, title, content, category) => {
  const topics = getTopics();
  const topic = {
    id: `topic-${Date.now()}`,
    userId, userName, title, content, category,
    replies: [],
    createdAt: new Date().toISOString(),
  };
  topics.unshift(topic);
  saveTopics(topics);
  return topic;
};

// --- Reply ---
export const addReply = (topicId, userId, userName, content) => {
  const topics = getTopics();
  const topic = topics.find(t => t.id === topicId);
  if (!topic) return null;
  const reply = {
    id: `reply-${Date.now()}`,
    userId, userName, content,
    createdAt: new Date().toISOString(),
  };
  topic.replies.push(reply);
  saveTopics(topics);
  return reply;
};

// --- Delete Topic (admin only) ---
export const deleteTopic = (topicId) => {
  const filtered = getTopics().filter(t => t.id !== topicId);
  saveTopics(filtered);
};

// --- Initialize (hanya lokal, TIDAK push ke cloud) ---
export const initializeForum = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
};
