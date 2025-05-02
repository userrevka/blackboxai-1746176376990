import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000', { autoConnect: false });

function Chat({ token, username, onLogout }) {
  const [friends, setFriends] = useState([]);
  const [friendUsername, setFriendUsername] = useState('');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (token) {
      socket.auth = { token };
      socket.connect();

      socket.on('chatMessage', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [token]);

  useEffect(() => {
    if (selectedFriend) {
      socket.emit('joinRoom', getRoomId(username, selectedFriend.username));
      setMessages([]);
    }
    return () => {
      if (selectedFriend) {
        socket.emit('leaveRoom', getRoomId(username, selectedFriend.username));
      }
    };
  }, [selectedFriend, username]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchFriends();
  }, [token]);

  const fetchFriends = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/friends', {
        headers: { Authorization: 'Bearer ' + token },
      });
      setFriends(res.data.friends);
    } catch (err) {
      console.error(err);
    }
  };

  const addFriend = async () => {
    if (!friendUsername) return;
    try {
      await axios.post(
        'http://localhost:5000/api/friends/add',
        { friendUsername },
        { headers: { Authorization: 'Bearer ' + token } }
      );
      setFriendUsername('');
      fetchFriends();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add friend');
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !selectedFriend) return;
    const room = getRoomId(username, selectedFriend.username);
    const message = input.trim();
    socket.emit('chatMessage', { room, message, sender: username });
    setMessages((prev) => [...prev, { message, sender: username, timestamp: new Date() }]);
    setInput('');
  };

  const getRoomId = (user1, user2) => {
    return [user1, user2].sort().join('_');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded shadow flex flex-col md:flex-row overflow-hidden">
      <div className="md:w-1/3 border-r border-gray-300 p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Friends</h2>
          <button
            onClick={onLogout}
            className="text-red-600 hover:underline text-sm"
          >
            Logout
          </button>
        </div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Add friend by username"
            value={friendUsername}
            onChange={(e) => setFriendUsername(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <button
            onClick={addFriend}
            className="mt-2 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            Add Friend
          </button>
        </div>
        <ul className="flex-1 overflow-auto">
          {friends.map((friend) => (
            <li
              key={friend._id}
              onClick={() => setSelectedFriend(friend)}
              className={`p-2 cursor-pointer rounded ${
                selectedFriend?._id === friend._id ? 'bg-blue-200' : 'hover:bg-gray-100'
              }`}
            >
              {friend.username}
            </li>
          ))}
        </ul>
      </div>
      <div className="md:w-2/3 flex flex-col p-4">
        <div className="flex-1 overflow-auto mb-4 border border-gray-300 rounded p-2">
          {selectedFriend ? (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-2 ${
                  msg.sender === username ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block px-3 py-1 rounded ${
                    msg.sender === username ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'
                  }`}
                >
                  <strong>{msg.sender}</strong>: {msg.message}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Select a friend to start chatting</p>
          )}
          <div ref={messagesEndRef} />
        </div>
        {selectedFriend && (
          <div className="flex">
            <input
              type="text"
              placeholder="Type a message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded"
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-blue-600 text-white px-4 rounded hover:bg-blue-700 transition"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
