import React, { useState, useEffect, useRef } from 'react';
import { Card, CardBody, CardHeader, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';

export const AnonymousChat = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [roomId, setRoomId] = useState(null);
    const ws = useRef(null);
    const myId = useRef(Math.random().toString(36).substring(7));

    // Mock connecting to a random room
    const connectToChat = () => {
        // Real app: We'd get a room ID from the server queue API
        const newRoomId = Math.random().toString(36).substring(7);
        setRoomId(newRoomId);

        // Connect to Django Channels WebSocket
        const wsUrl = `ws://localhost:8000/ws/chat/${newRoomId}/`;

        try {
            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = () => {
                setIsConnected(true);
                setMessages([{ id: Date.now(), text: 'Connected! Waiting for an anonymous partner to join...', sender: 'system' }]);
            };

            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setMessages(prev => [...prev, { id: Date.now() + Math.random(), text: data.message, sender: data.user_id === myId.current ? 'me' : 'them' }]);
            };

            ws.current.onclose = () => {
                setIsConnected(false);
                setMessages(prev => [...prev, { id: Date.now(), text: 'Disconnected from server.', sender: 'system' }]);
            };
        } catch (err) {
            console.error("WebSocket connection failed", err);
            alert("Connection failed. Is the Django Channels server running?");
        }
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                message: inputValue,
                user_id: myId.current
            }));
        }
        setInputValue('');
    };

    const disconnect = () => {
        if (ws.current) {
            ws.current.close();
        }
        setIsConnected(false);
        setRoomId(null);
        setMessages([]);
    };

    return (
        <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Anonymous Chat</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Connect safely with strangers near you.</p>

            {!isConnected ? (
                <Card style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Find a Connection</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Click below to be matched with a random anonymous user.</p>
                    <Button variant="primary" onClick={connectToChat} size="large">
                        Start Chatting
                    </Button>
                </Card>
            ) : (
                <Card style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
                    <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                        <div>
                            <span className="badge" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-hover)' }}>Live</span>
                            <span style={{ marginLeft: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Room: {roomId}</span>
                        </div>
                        <Button variant="secondary" onClick={disconnect}>Leave Room</Button>
                    </CardHeader>

                    <CardBody style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                style={{
                                    alignSelf: msg.sender === 'me' ? 'flex-end' : msg.sender === 'system' ? 'center' : 'flex-start',
                                    backgroundColor: msg.sender === 'me' ? 'var(--accent-primary)' : msg.sender === 'system' ? 'transparent' : 'var(--bg-secondary)',
                                    color: msg.sender === 'me' ? 'white' : msg.sender === 'system' ? 'var(--text-muted)' : 'var(--text-primary)',
                                    padding: msg.sender === 'system' ? '0' : '0.75rem 1rem',
                                    borderRadius: msg.sender === 'me' ? '1rem 1rem 0 1rem' : msg.sender === 'system' ? '0' : '1rem 1rem 1rem 0',
                                    maxWidth: '70%',
                                    fontSize: msg.sender === 'system' ? '0.75rem' : '1rem',
                                    border: msg.sender === 'them' ? '1px solid var(--border-color)' : 'none'
                                }}
                            >
                                {msg.text}
                            </div>
                        ))}
                    </CardBody>

                    <CardFooter style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0' }}>
                        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Type your message..."
                                style={{ flex: 1, marginBottom: 0 }}
                            />
                            <Button type="submit" variant="primary">Send</Button>
                        </form>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
};
