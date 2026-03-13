import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, LogOut, Radio, Search } from 'lucide-react';
import { getWebSocketURL } from '../api/config';

export const AnonymousChat = () => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [status, setStatus] = useState('idle'); // idle | searching | connected
    const [roomId, setRoomId] = useState(null);
    const ws = useRef(null);
    const messagesEndRef = useRef(null);
    const myId = useRef(Math.random().toString(36).substring(7));

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Cleanup on unmount
    useEffect(() => {
        return () => { if (ws.current) ws.current.close(); };
    }, []);

    const startSearch = () => {
        setStatus('searching');
        setMessages([]);
        setRoomId(null);

        const wsUrl = getWebSocketURL('/ws/chat/');

        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            // Ask backend to find a match
            ws.current.send(JSON.stringify({
                action: 'find_match',
                user_id: myId.current
            }));
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'waiting') {
                // Still in queue
                setStatus('searching');
            } else if (data.type === 'system_message') {
                if (data.room_id) {
                    // Matched!
                    setStatus('connected');
                    setRoomId(data.room_id);
                }
                setMessages(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    text: data.message,
                    sender: 'system'
                }]);
            } else if (data.type === 'chat_message') {
                setMessages(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    text: data.message,
                    sender: data.user_id === myId.current ? 'me' : 'them'
                }]);
            }
        };

        ws.current.onclose = () => {
            if (status !== 'idle') {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    text: 'Disconnected.',
                    sender: 'system'
                }]);
            }
            setStatus('idle');
        };

        ws.current.onerror = () => {
            setStatus('idle');
            setMessages([{
                id: Date.now(),
                text: 'Connection failed. Is the server running?',
                sender: 'system'
            }]);
        };
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || !ws.current) return;

        ws.current.send(JSON.stringify({
            action: 'send_message',
            message: inputValue,
            user_id: myId.current
        }));
        setInputValue('');
    };

    const disconnect = () => {
        if (ws.current) ws.current.close();
        ws.current = null;
        setStatus('idle');
        setRoomId(null);
        setMessages([]);
    };

    const findNew = () => {
        if (ws.current) ws.current.close();
        ws.current = null;
        // Small delay to let the old connection close
        setTimeout(startSearch, 300);
    };

    return (
        <div className="container animate-fade-in-up" style={{ padding: '2rem 1.5rem', maxWidth: '720px' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MessageCircle size={22} color="var(--accent-primary)" /> Community Chat
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Connect with other locals, landlords, and tenants in the area.
                </p>
            </div>

            {status === 'idle' ? (
                /* ─── Start Screen ─── */
                <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'var(--accent-light)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.25rem',
                    }}>
                        <Radio size={28} color="var(--accent-primary)" />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Find a Chat Partner</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.85rem', maxWidth: '320px', margin: '0 auto 2rem' }}>
                        You'll be matched with a random anonymous user for a private conversation.
                    </p>
                    <button className="btn btn-primary btn-lg" onClick={startSearch}>
                        Start Searching
                    </button>
                </div>
            ) : status === 'searching' ? (
                /* ─── Searching / Queued ─── */
                <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'var(--accent-light)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        animation: 'pulse 2s infinite',
                    }}>
                        <Search size={28} color="var(--accent-primary)" />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Searching for a Partner...</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                        Waiting for someone else to join. Hang tight!
                    </p>
                    <div className="typing-indicator" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
                        <span /><span /><span />
                    </div>
                    <button className="btn btn-ghost" onClick={disconnect}>
                        Cancel
                    </button>
                </div>
            ) : (
                /* ─── Chat Room ─── */
                <div className="card" style={{ height: '520px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                    {/* Header */}
                    <div style={{
                        padding: '0.75rem 1.25rem',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="badge" style={{ backgroundColor: '#ecfdf5', color: 'var(--success)' }}>
                                <span className="pulse-dot" style={{ marginRight: '0.35rem' }} /> Matched
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Room {roomId}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-ghost btn-sm" onClick={findNew} style={{ fontSize: '0.78rem' }}>
                                <Search size={13} /> New Match
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={disconnect} style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>
                                <LogOut size={13} /> Leave
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1, overflowY: 'auto', padding: '1rem 1.25rem',
                        display: 'flex', flexDirection: 'column', gap: '0.5rem',
                    }}>
                        {messages.map(msg => (
                            <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={sendMessage} style={{
                        padding: '0.75rem 1.25rem',
                        borderTop: '1px solid var(--border-color)',
                        display: 'flex', gap: '0.5rem',
                    }}>
                        <input
                            className="input"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type your message..."
                            autoFocus
                        />
                        <button type="submit" className="btn btn-primary" disabled={!inputValue.trim()}>
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};
