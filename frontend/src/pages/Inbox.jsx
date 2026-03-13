import React, { useState, useEffect, useRef, useContext } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import {
    MessageCircle, Send, ArrowLeft, Image, ThumbsUp, Heart,
    Laugh, Flame, Frown, Loader2, User, Search, Check, CheckCheck,
    Building2,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/config';

const API_BASE = import.meta.env.VITE_API_URL || '';

const REACTION_MAP = {
    thumbs_up: { icon: ThumbsUp, label: '👍' },
    heart: { icon: Heart, label: '❤️' },
    laugh: { icon: Laugh, label: '😄' },
    fire: { icon: Flame, label: '🔥' },
    sad: { icon: Frown, label: '😢' },
};

const getToken = () => localStorage.getItem('access');
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

export const Inbox = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [conversations, setConversations] = useState([]);
    const [selectedConvo, setSelectedConvo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState(location.state?.prefillMsg || '');
    const [loading, setLoading] = useState(true);
    const [msgLoading, setMsgLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const pollRef = useRef(null);

    // Auto-open conversation from URL param or state routing
    const targetUserId = searchParams.get('user') || location.state?.landlordId;

    useEffect(() => {
        fetchConversations();
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, []);

    useEffect(() => {
        // If target user is specified, start conversation
        if (targetUserId && user) {
            startConversation(parseInt(targetUserId));
        }
    }, [targetUserId, user]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Poll for new messages every 3s when viewing a conversation
    useEffect(() => {
        if (pollRef.current) clearInterval(pollRef.current);
        if (selectedConvo) {
            pollRef.current = setInterval(() => {
                fetchMessages(selectedConvo.id, true);
            }, 3000);
        }
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [selectedConvo]);

    const fetchConversations = async () => {
        try {
            const res = await api.get('/api/conversations/', { headers: authHeaders() });
            setConversations(res.data);
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
        } finally {
            setLoading(false);
        }
    };

    const startConversation = async (userId) => {
        try {
            const res = await api.post('/api/conversations/start/', { user_id: userId }, { headers: authHeaders() });
            setSelectedConvo(res.data);
            fetchMessages(res.data.id);
            fetchConversations();
        } catch (err) {
            console.error('Failed to start conversation:', err);
        }
    };

    const fetchMessages = async (convoId, silent = false) => {
        if (!silent) setMsgLoading(true);
        try {
            const res = await api.get(`/api/conversations/${convoId}/messages/`, { headers: authHeaders() });
            setMessages(res.data);
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        } finally {
            if (!silent) setMsgLoading(false);
        }
    };

    const handleSend = async () => {
        if (!newMsg.trim() || !selectedConvo) return;
        setSending(true);
        try {
            const formData = new FormData();
            formData.append('content', newMsg);
            await api.post(`/api/conversations/${selectedConvo.id}/send/`, formData, {
                headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
            });
            setNewMsg('');
            fetchMessages(selectedConvo.id);
            fetchConversations();
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setSending(false);
        }
    };

    const handleReact = async (messageId, reactionType) => {
        try {
            await api.post(`/api/messages/${messageId}/react/`, { reaction_type: reactionType }, { headers: authHeaders() });
            fetchMessages(selectedConvo.id, true);
        } catch (err) {
            console.error('Failed to react:', err);
        }
    };

    const getOtherUser = (convo) => {
        if (!user) return convo.user1;
        return convo.user1.id === user.user_id ? convo.user2 : convo.user1;
    };

    const formatTime = (ts) => {
        const d = new Date(ts);
        const now = new Date();
        const diff = now - d;
        if (diff < 60000) return 'now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
        if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    if (!user) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <MessageCircle size={48} color="var(--border-color)" />
                <p style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: '600' }}>Log in to view your messages</p>
                <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/login')}>
                    Log In
                </button>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: '900px', margin: '0 auto',
            height: 'calc(100vh - 120px)', display: 'flex',
            border: '1px solid var(--border-color)', borderRadius: '12px',
            overflow: 'hidden', background: 'var(--bg-primary)',
        }}>
            {/* Conversation List */}
            <div style={{
                width: selectedConvo ? '0' : '100%',
                minWidth: selectedConvo ? '0' : undefined,
                maxWidth: '320px',
                borderRight: '1px solid var(--border-color)',
                display: 'flex', flexDirection: 'column',
                transition: 'width 0.3s',
                overflow: 'hidden',
            }}
                className={selectedConvo ? 'hide-on-mobile' : ''}
            >
                {/* Header */}
                <div style={{
                    padding: '1rem', borderBottom: '1px solid var(--border-color)',
                    fontWeight: '700', fontSize: '1.1rem',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}>
                    <MessageCircle size={20} /> Messages
                </div>

                {/* List */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loading && (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <Loader2 size={24} className="spin" color="var(--text-muted)" />
                        </div>
                    )}
                    {!loading && conversations.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            No conversations yet. Visit a profile and click Message to start one.
                        </div>
                    )}
                    {conversations.map(convo => {
                        const other = getOtherUser(convo);
                        const isActive = selectedConvo?.id === convo.id;
                        return (
                            <div key={convo.id}
                                style={{
                                    padding: '0.75rem 1rem',
                                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                                    cursor: 'pointer',
                                    background: isActive ? 'var(--bg-secondary)' : 'transparent',
                                    borderBottom: '1px solid var(--border-color)',
                                    transition: 'background 0.15s',
                                }}
                                onClick={() => { setSelectedConvo(convo); fetchMessages(convo.id); }}
                            >
                                {/* Avatar */}
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #1a1a1a, #555)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontWeight: '700', fontSize: '0.8rem', flexShrink: 0,
                                }}>
                                    {(other.first_name || other.username || 'U')[0].toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>
                                            {other.first_name || other.username}
                                        </span>
                                        {convo.last_message && (
                                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                                {formatTime(convo.last_message.timestamp)}
                                            </span>
                                        )}
                                    </div>
                                    {convo.last_message && (
                                        <p style={{
                                            fontSize: '0.75rem', color: 'var(--text-muted)',
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                            margin: '0.15rem 0 0',
                                        }}>
                                            {convo.last_message.content}
                                        </p>
                                    )}
                                </div>
                                {convo.unread_count > 0 && (
                                    <div style={{
                                        background: '#1a1a1a', color: '#fff',
                                        borderRadius: '50%', minWidth: '20px', height: '20px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.6rem', fontWeight: '700', flexShrink: 0,
                                    }}>
                                        {convo.unread_count}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Message Thread */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                minWidth: 0,
            }}>
                {!selectedConvo ? (
                    <div style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexDirection: 'column', color: 'var(--text-muted)',
                    }}>
                        <MessageCircle size={48} strokeWidth={1} />
                        <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Select a conversation</p>
                    </div>
                ) : (
                    <>
                        {/* Thread Header */}
                        <div style={{
                            padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)',
                            display: 'flex', flexDirection: 'column',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button onClick={() => setSelectedConvo(null)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.25rem' }}>
                                    <ArrowLeft size={20} />
                                </button>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #1a1a1a, #555)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontWeight: '700', fontSize: '0.7rem',
                                }}>
                                    {(getOtherUser(selectedConvo).first_name || 'U')[0].toUpperCase()}
                                </div>
                                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                                    {getOtherUser(selectedConvo).first_name} {getOtherUser(selectedConvo).last_name}
                                </span>
                            </div>

                            {selectedConvo.listing_info && (
                                <div style={{
                                    marginTop: '0.75rem', padding: '0.5rem', background: 'var(--bg-secondary)',
                                    borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    cursor: 'pointer', border: '1px solid var(--border-color)'
                                }} onClick={() => navigate(`/listing/${selectedConvo.listing_info.id}`)}>
                                    {selectedConvo.listing_info.image ? (
                                        <img src={selectedConvo.listing_info.image.startsWith('/') ? API_BASE + selectedConvo.listing_info.image : selectedConvo.listing_info.image} alt="Property" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                                    ) : (
                                        <div style={{ width: '48px', height: '48px', background: 'var(--border-color)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Building2 size={20} color="var(--text-muted)" />
                                        </div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '0.85rem', margin: 0, fontWeight: '700', color: 'var(--text-primary)' }}>{selectedConvo.listing_info.title}</h4>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>₱{selectedConvo.listing_info.price}/mo • {selectedConvo.listing_info.property_type}</p>
                                    </div>
                                    <ArrowLeft size={16} strokeWidth={2} style={{ transform: 'rotate(135deg)', color: 'var(--text-muted)' }} />
                                </div>
                            )}
                        </div>

                        {/* Messages */}
                        <div style={{
                            flex: 1, overflowY: 'auto', padding: '1rem',
                            display: 'flex', flexDirection: 'column', gap: '0.5rem',
                        }}>
                            {msgLoading && (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <Loader2 size={24} className="spin" />
                                </div>
                            )}
                            {messages.map(msg => {
                                const isMine = msg.sender.id === user.user_id;
                                return (
                                    <div key={msg.id} style={{
                                        display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start',
                                    }}>
                                        <div style={{
                                            maxWidth: '75%', position: 'relative',
                                        }}>
                                            <div style={{
                                                padding: '0.5rem 0.75rem',
                                                borderRadius: isMine ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                                                background: isMine ? '#1a1a1a' : 'var(--bg-secondary)',
                                                color: isMine ? '#fff' : 'var(--text-primary)',
                                                fontSize: '0.85rem', lineHeight: '1.5',
                                                border: isMine ? 'none' : '1px solid var(--border-color)',
                                            }}>
                                                {msg.content}
                                                {msg.image && (
                                                    <img src={msg.image.startsWith('/') ? API_BASE + msg.image : msg.image}
                                                        alt="Attachment"
                                                        style={{ maxWidth: '200px', borderRadius: '8px', marginTop: '0.3rem', display: 'block' }}
                                                    />
                                                )}
                                            </div>
                                            {/* Time + read status */}
                                            <div style={{
                                                fontSize: '0.6rem', color: 'var(--text-muted)',
                                                marginTop: '0.15rem',
                                                textAlign: isMine ? 'right' : 'left',
                                                display: 'flex', alignItems: 'center', gap: '0.2rem',
                                                justifyContent: isMine ? 'flex-end' : 'flex-start',
                                            }}>
                                                {formatTime(msg.timestamp)}
                                                {isMine && (msg.is_read ? <CheckCheck size={10} color="#1a8c1a" /> : <Check size={10} />)}
                                            </div>
                                            {/* Reactions */}
                                            {msg.reactions && msg.reactions.length > 0 && (
                                                <div style={{
                                                    display: 'flex', gap: '0.2rem', marginTop: '0.15rem',
                                                    flexWrap: 'wrap',
                                                }}>
                                                    {msg.reactions.map((r, i) => (
                                                        <span key={i} style={{
                                                            fontSize: '0.65rem', background: 'var(--bg-secondary)',
                                                            borderRadius: '8px', padding: '0.1rem 0.3rem',
                                                            border: '1px solid var(--border-color)',
                                                        }}>
                                                            {REACTION_MAP[r.reaction_type]?.label || r.reaction_type}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {/* Quick react bar */}
                                            {!isMine && (
                                                <div style={{
                                                    display: 'flex', gap: '0.15rem', marginTop: '0.15rem',
                                                    opacity: 0.5, transition: 'opacity 0.2s',
                                                }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
                                                >
                                                    {Object.entries(REACTION_MAP).map(([key, val]) => (
                                                        <button key={key}
                                                            onClick={() => handleReact(msg.id, key)}
                                                            style={{
                                                                background: 'none', border: 'none', cursor: 'pointer',
                                                                fontSize: '0.7rem', padding: '0.1rem',
                                                            }}
                                                            title={key}
                                                        >
                                                            {val.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div style={{
                            padding: '0.75rem 1rem', borderTop: '1px solid var(--border-color)',
                            display: 'flex', gap: '0.5rem', alignItems: 'center',
                        }}>
                            <input
                                type="text"
                                value={newMsg}
                                onChange={e => setNewMsg(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                style={{
                                    flex: 1, padding: '0.6rem 0.75rem',
                                    borderRadius: '20px', border: '1px solid var(--border-color)',
                                    fontSize: '0.85rem', outline: 'none',
                                    background: 'var(--bg-secondary)',
                                }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={sending || !newMsg.trim()}
                                style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: newMsg.trim() ? '#1a1a1a' : 'var(--border-color)',
                                    color: '#fff', border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'background 0.2s',
                                }}
                            >
                                {sending ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
