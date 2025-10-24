/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState, useContext  } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Camera, CameraOff, Mic, MicOff, Video, Phone, MonitorUp, MessageSquare, PhoneOff, Monitor, X, Send, Users, PhoneCallIcon, PhoneCall, LucidePhoneOff, BarChart3, Plus, Check } from 'lucide-react';
import servers from '../enviroment';
const server_url = servers;

var connections = {};
const peerConfigConnections = {
  "iceServers": [
    { "urls": "stun:stun.l.google.com:19302" }
  ]
};

const VideoMeet = () => {

  const { addtoUserHistory } = useContext(AuthContext);
  const { id: meetingCode } = useParams();
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoRef = useRef();
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const chatEndRef = useRef(null);
  const messageInputRef = useRef(null);

  const [videoAvailable, setVideoAvailable] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(false);
  const [video, setVideo] = useState(false);
  const [audio, setAudio] = useState(false);
  const [videos, setVideos] = useState([]);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [screen, setScreen] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [participants, setParticipants] = useState([]);

  // Polling states
  const [showPolls, setShowPolls] = useState(false);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [polls, setPolls] = useState([]);
  const [newPollQuestion, setNewPollQuestion] = useState("");
  const [newPollOptions, setNewPollOptions] = useState(["", ""]);

  const getPermissions = async () => {
    try {
      let stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });

      setVideoAvailable(true);
      setAudioAvailable(true);
      setVideo(true);
      setAudio(true);

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log("Permissions granted - Video & Audio tracks:", stream.getTracks());
    } catch (err) {
      console.log("Permission error:", err);
      
      try {
        let videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setVideoAvailable(true);
        setVideo(true);
        localStreamRef.current = videoStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = videoStream;
        }
        console.log("Video permission granted");
      } catch (videoErr) {
        console.log("Video permission denied");
        setVideoAvailable(false);
      }

      try {
        let audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioAvailable(true);
        setAudio(true);
        
        if (localStreamRef.current) {
          audioStream.getAudioTracks().forEach(track => {
            localStreamRef.current.addTrack(track);
          });
        } else {
          localStreamRef.current = audioStream;
        }
        
        if (localVideoRef.current && localStreamRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
        console.log("Audio permission granted");
      } catch (audioErr) {
        console.log("Audio permission denied");
        setAudioAvailable(false);
      }
    }
  };

  // Polling Functions
  const loadPolls = () => {
    const savedPolls = localStorage.getItem(`polls_${meetingCode}`);
    if (savedPolls) {
      setPolls(JSON.parse(savedPolls));
    }
  };

  const savePolls = (pollsData) => {
    localStorage.setItem(`polls_${meetingCode}`, JSON.stringify(pollsData));
  };

  const createPoll = () => {
    if (!newPollQuestion.trim()) {
      alert("Please enter a question");
      return;
    }

    const validOptions = newPollOptions.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      alert("Please add at least 2 options");
      return;
    }

    const newPoll = {
      id: Date.now(),
      question: newPollQuestion,
      options: validOptions.map(opt => ({
        text: opt,
        votes: [],
        count: 0
      })),
      createdBy: username,
      createdAt: new Date().toISOString(),
      active: true
    };

    const updatedPolls = [...polls, newPoll];
    setPolls(updatedPolls);
    savePolls(updatedPolls);

    // Broadcast poll to other users
    if (socketRef.current) {
      socketRef.current.emit('poll-created', newPoll);
    }

    // Reset form
    setNewPollQuestion("");
    setNewPollOptions(["", ""]);
    setShowCreatePoll(false);
  };

  const votePoll = (pollId, optionIndex) => {
    const updatedPolls = polls.map(poll => {
      if (poll.id === pollId) {
        // Check if user already voted
        const hasVoted = poll.options.some(opt => opt.votes.includes(socketIdRef.current));
        
        if (hasVoted) {
          // Remove previous vote
          poll.options.forEach(opt => {
            opt.votes = opt.votes.filter(id => id !== socketIdRef.current);
            opt.count = opt.votes.length;
          });
        }

        // Add new vote
        poll.options[optionIndex].votes.push(socketIdRef.current);
        poll.options[optionIndex].count = poll.options[optionIndex].votes.length;
      }
      return poll;
    });

    setPolls(updatedPolls);
    savePolls(updatedPolls);

    // Broadcast vote to other users
    if (socketRef.current) {
      socketRef.current.emit('poll-vote', { pollId, optionIndex, voterId: socketIdRef.current });
    }
  };

  const closePoll = (pollId) => {
    const updatedPolls = polls.map(poll => {
      if (poll.id === pollId) {
        poll.active = false;
      }
      return poll;
    });

    setPolls(updatedPolls);
    savePolls(updatedPolls);

    if (socketRef.current) {
      socketRef.current.emit('poll-closed', pollId);
    }
  };

  const addPollOption = () => {
    setNewPollOptions([...newPollOptions, ""]);
  };

  const updatePollOption = (index, value) => {
    const updated = [...newPollOptions];
    updated[index] = value;
    setNewPollOptions(updated);
  };

  const removePollOption = (index) => {
    if (newPollOptions.length > 2) {
      setNewPollOptions(newPollOptions.filter((_, i) => i !== index));
    }
  };

  const togglePolls = () => {
    setShowPolls(!showPolls);
    setShowCreatePoll(false);
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: true
      });

      const originalStream = localStreamRef.current;
      screenStreamRef.current = screenStream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      const screenVideoTrack = screenStream.getVideoTracks()[0];
      
      for (let id in connections) {
        if (id === socketIdRef.current) continue;

        const senders = connections[id].getSenders();
        const videoSender = senders.find(sender => sender.track?.kind === 'video');
        
        if (videoSender) {
          videoSender.replaceTrack(screenVideoTrack);
        }
      }

      screenVideoTrack.onended = () => {
        stopScreenShare(originalStream);
      };

      setScreen(true);
      console.log("Screen sharing started");
    } catch (err) {
      console.log("Error starting screen share:", err);
      alert("Could not start screen sharing. Please try again.");
    }
  };

  const stopScreenShare = async (originalStream = null) => {
    try {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }

      let cameraStream = originalStream;
      if (!cameraStream) {
        try {
          cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720 },
            audio: false
          });
        } catch (err) {
          console.log("Error getting camera stream:", err);
          setVideo(false);
          setScreen(false);
          return;
        }
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = cameraStream;
      }

      const cameraVideoTrack = cameraStream.getVideoTracks()[0];
      cameraVideoTrack.enabled = video;

      for (let id in connections) {
        if (id === socketIdRef.current) continue;

        const senders = connections[id].getSenders();
        const videoSender = senders.find(sender => sender.track?.kind === 'video');
        
        if (videoSender) {
          videoSender.replaceTrack(cameraVideoTrack);
        }
      }

      if (localStreamRef.current) {
        const audioTracks = localStreamRef.current.getAudioTracks();
        localStreamRef.current = new MediaStream([cameraVideoTrack, ...audioTracks]);
      }

      setScreen(false);
      console.log("Screen sharing stopped, camera resumed");
    } catch (err) {
      console.log("Error stopping screen share:", err);
    }
  };

  const toggleScreenShare = () => {
    if (screen) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  const sendMessage = () => {
    if (messageInput.trim() && socketRef.current) {
      const message = {
        sender: username,
        text: messageInput.trim(),
        timestamp: new Date().toISOString(),
        socketId: socketIdRef.current
      };
      
      socketRef.current.emit('chat-message', message);
      setMessages(prev => [...prev, message]);
      setMessageInput("");
    }
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    if (!showChat) {
      setUnreadCount(0);
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 100);
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const gotMessageFromServer = (fromId, message) => {
    try {
      const signal = JSON.parse(message);

      if (fromId !== socketIdRef.current) {
        if (signal.sdp) {
          connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
            .then(() => {
              if (signal.sdp.type === "offer") {
                connections[fromId].createAnswer()
                  .then((description) => {
                    connections[fromId].setLocalDescription(description)
                      .then(() => {
                        socketRef.current.emit("signal", fromId, JSON.stringify({ "sdp": connections[fromId].localDescription }));
                      })
                      .catch(e => console.log(e));
                  })
                  .catch(e => console.log(e));
              }
            })
            .catch(e => console.log(e));
        }

        if (signal.ice) {
          connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice))
            .catch(e => console.log(e));
        }
      }
    } catch (e) {
      console.log("Error parsing message:", e);
    }
  };

  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on('signal', gotMessageFromServer);

    socketRef.current.on('chat-message', (message) => {
      if (message.socketId !== socketIdRef.current) {
        setMessages(prev => [...prev, message]);
        if (!showChat) {
          setUnreadCount(prev => prev + 1);
        }
      }
    });

    socketRef.current.on('participants-update', (participantsList) => {
      setParticipants(participantsList);
    });

    // Poll event listeners
    socketRef.current.on('poll-created', (poll) => {
      const updatedPolls = [...polls, poll];
      setPolls(updatedPolls);
      savePolls(updatedPolls);
    });

    socketRef.current.on('poll-vote', ({ pollId, optionIndex, voterId }) => {
      const updatedPolls = polls.map(poll => {
        if (poll.id === pollId) {
          // Remove previous vote from this voter
          poll.options.forEach(opt => {
            opt.votes = opt.votes.filter(id => id !== voterId);
            opt.count = opt.votes.length;
          });
          // Add new vote
          poll.options[optionIndex].votes.push(voterId);
          poll.options[optionIndex].count = poll.options[optionIndex].votes.length;
        }
        return poll;
      });
      setPolls(updatedPolls);
      savePolls(updatedPolls);
    });

    socketRef.current.on('poll-closed', (pollId) => {
      const updatedPolls = polls.map(poll => {
        if (poll.id === pollId) {
          poll.active = false;
        }
        return poll;
      });
      setPolls(updatedPolls);
      savePolls(updatedPolls);
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to socket server");
      socketRef.current.emit("join-call", { 
        room: window.location.href,
        username: username 
      });
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("user-left", (id) => {
        console.log("User left:", id);
        setVideos((videos) => videos.filter((video) => video.socketID !== id));
        
        if (connections[id]) {
          connections[id].close();
          delete connections[id];
        }
      });

      socketRef.current.on("user-joined", (id, clients) => {
        console.log("User joined:", id, "Clients:", clients);

        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate != null) {
              socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
            }
          };

          connections[socketListId].ontrack = (event) => {
            console.log("TRACK received from:", socketListId, event.streams[0]);

            setVideos(prevVideos => {
              const existingIndex = prevVideos.findIndex(v => v.socketID === socketListId);
              
              if (existingIndex !== -1) {
                const updated = [...prevVideos];
                updated[existingIndex] = {
                  socketID: socketListId,
                  stream: event.streams[0]
                };
                console.log("Updated existing video for:", socketListId);
                return updated;
              } else {
                console.log("Added new video for:", socketListId);
                return [...prevVideos, {
                  socketID: socketListId,
                  stream: event.streams[0]
                }];
              }
            });
          };

          if (localStreamRef.current) {
            console.log("Adding local tracks to connection:", socketListId);
            localStreamRef.current.getTracks().forEach(track => {
              connections[socketListId].addTrack(track, localStreamRef.current);
              console.log("Added track:", track.kind, track.enabled);
            });
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            console.log("Creating offer for:", id2);
            connections[id2].createOffer()
              .then((description) => {
                connections[id2].setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localDescription }));
                  })
                  .catch(e => console.log(e));
              });
          }
        }
      });
    });
  };

  const connect = async () => {
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }

    if (!localStreamRef.current) {
      alert("Please wait for camera/microphone access");
      return;
    }

    console.log("Connecting with stream:", localStreamRef.current.getTracks());
    setAskForUsername(false);
    connectToSocketServer();
    loadPolls();

    addtoUserHistory();
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideo(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudio(audioTrack.enabled);
      }
    }
  };

  useEffect(() => {
    getPermissions();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      Object.values(connections).forEach(conn => conn.close());
    };
  }, []);

  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [askForUsername]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-800 to-black text-white">
      {askForUsername ? (
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="w-full max-w-2xl">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700/50">
            
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-800 rounded-xl mb-4">
                  <Video className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-700 bg-clip-text text-transparent mb-2">
                  Join Video Call
                </h1>
                <p className="text-slate-400">Enter your name to get started</p>
              </div>

              <div className="space-y-6">
                <div>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full h-12 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-slate-400"
                    onKeyPress={(e) => e.key === 'Enter' && connect()}
                  />
                </div>

                <button
                  onClick={connect}
                  disabled={!username.trim()}
                  className="w-full h-10 py-3 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 rounded-2xl disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed font-semibold transition-all duration-200 shadow-lg hover:shadow-purple-500/50"
                >
                  Join Call
                </button>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4 text-center text-slate-300">
                    Video Preview
                  </h3>
                  <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                      <div className={`px-4 py-2 rounded-full text-sm font-medium ${videoAvailable ? 'bg-green-600' : 'bg-red-600'}`}>
                        {videoAvailable ? '✓ Camera Ready' : '✗ No Camera'}
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-medium ${audioAvailable ? 'bg-green-600' : 'bg-red-600'}`}>
                        {audioAvailable ? '✓ Mic Ready' : '✗ No Mic'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400">Connected as <span className="text-purple-400 font-semibold">{username}</span></p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-medium">{videos.length + 1} participants</span>
                </div>
              </div>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${(showChat || showPolls) ? 'mr-96' : ''} transition-all duration-300`}>
              <div className="relative group">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl border border-slate-700/50">
                  <div className="aspect-video bg-slate-900 relative">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-sm font-medium flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      You ({username})
                      {screen && (
                        <span className="ml-1 text-xs bg-blue-600 px-2 py-0.5 rounded">
                          <Monitor className="w-3 h-3 inline" />
                        </span>
                      )}
                    </div>
                    {!video && !screen && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                        <div className="text-center">
                          <CameraOff className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                          <p className="text-slate-400 text-sm">Camera Off</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {videos.map((videoItem) => (
                <div key={videoItem.socketID} className="relative group">
                  <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl border border-slate-700/50">
                    <div className="aspect-video bg-slate-900 relative">
                      <video
                        autoPlay
                        playsInline
                        ref={ref => {
                          if (ref && videoItem.stream) {
                            ref.srcObject = videoItem.stream;
                          }
                        }}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-sm font-medium flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        User {videoItem.socketID.substring(0, 8)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {videos.length === 0 && (
              <div className="mt-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800/50 rounded-full mb-4">
                  <Phone className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">Waiting for others to join...</h3>
                <p className="text-slate-500">Share the meeting link with others to start the call</p>
              </div>
            )}
          </div>

          {/* Chat Panel */}
          {showChat && (
            <div className="fixed right-0 top-0 h-full w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700 shadow-2xl z-40 flex flex-col">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg">
                    <MessageSquare className="w-7 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Live Chat</h3>
                    <p className="text-xs text-slate-400">{videos.length + 1} participants</p>
                  </div>
                </div>
                <button
                  onClick={toggleChat}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-7 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.socketId === socketIdRef.current ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs ${
                          msg.socketId === socketIdRef.current
                            ? 'bg-purple-700 text-white rounded rounded-tr-sm'
                            : 'bg-slate-700 text-white rounded rounded-tl-sm'
                        } px-4 py-3 shadow-lg`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold opacity-90">
                            {msg.socketId === socketIdRef.current ? 'You' : msg.sender}
                          </span>
                          <span className="text-xs opacity-60">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm break-words">{msg.text}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-slate-700">
                <div className="flex gap-2">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 h-10 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!messageInput.trim()}
                    className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-2xl transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Polls Panel */}
          {showPolls && (
            <div className="fixed right-0 top-0 h-full w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700 shadow-2xl z-40 flex flex-col">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg">
                    <BarChart3 className="w-6 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Polls</h3>
                    <p className="text-xs text-slate-400">{polls.length} poll(s)</p>
                  </div>
                </div>
                <button
                  onClick={togglePolls}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {!showCreatePoll && (
                  <button
                    onClick={() => setShowCreatePoll(true)}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Create New Poll
                  </button>
                )}

                {showCreatePoll && (
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">Create Poll</h4>
                      <button
                        onClick={() => {
                          setShowCreatePoll(false);
                          setNewPollQuestion("");
                          setNewPollOptions(["", ""]);
                        }}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Poll question"
                      value={newPollQuestion}
                      onChange={(e) => setNewPollQuestion(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-400 mb-3"
                    />

                    <div className="space-y-2 mb-3">
                      {newPollOptions.map((option, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            placeholder={`Option ${idx + 1}`}
                            value={option}
                            onChange={(e) => updatePollOption(idx, e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-400"
                          />
                          {newPollOptions.length > 2 && (
                            <button
                              onClick={() => removePollOption(idx)}
                              className="px-2 text-red-400 hover:text-red-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={addPollOption}
                        className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                      >
                        Add Option
                      </button>
                      <button
                        onClick={createPoll}
                        className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                )}

                {polls.length === 0 && !showCreatePoll && (
                  <div className="flex items-center justify-center h-64 text-slate-500">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No polls yet</p>
                      <p className="text-xs">Create one to get started!</p>
                    </div>
                  </div>
                )}

                {polls.map((poll) => {
                  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.count, 0);
                  const userVoted = poll.options.some(opt => opt.votes.includes(socketIdRef.current));
                  
                  return (
                    <div key={poll.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{poll.question}</h4>
                          <p className="text-xs text-slate-400">
                            By {poll.createdBy} • {totalVotes} vote(s)
                          </p>
                        </div>
                        {poll.active && poll.createdBy === username && (
                          <button
                            onClick={() => closePoll(poll.id)}
                            className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded transition-colors"
                          >
                            Close
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {poll.options.map((option, idx) => {
                          const percentage = totalVotes > 0 ? (option.count / totalVotes * 100) : 0;
                          const isSelected = option.votes.includes(socketIdRef.current);
                          
                          return (
                            <div key={idx}>
                              <button
                                onClick={() => poll.active && votePoll(poll.id, idx)}
                                disabled={!poll.active}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                                  poll.active 
                                    ? 'hover:bg-slate-700 cursor-pointer' 
                                    : 'cursor-not-allowed opacity-75'
                                } ${
                                  isSelected ? 'bg-purple-600/30 border border-purple-500' : 'bg-slate-700'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium flex items-center gap-2">
                                    {option.text}
                                    {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                                  </span>
                                  <span className="text-xs text-slate-400">{option.count}</span>
                                </div>
                                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full transition-all duration-300 ${
                                      isSelected ? 'bg-purple-500' : 'bg-slate-600'
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                {totalVotes > 0 && (
                                  <p className="text-xs text-slate-400 mt-1">{percentage.toFixed(1)}%</p>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {!poll.active && (
                        <div className="mt-3 px-3 py-1 bg-slate-700 rounded text-xs text-center text-slate-400">
                          Poll Closed
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Floating Control Bar */}
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 px-6 py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleVideo}
                  disabled={screen}
                  className={`p-4 rounded-xl transition-all duration-200 hover:scale-110 ${
                    screen
                      ? 'bg-slate-800 cursor-not-allowed opacity-50'
                      : video 
                      ? 'bg-slate-700 hover:bg-slate-600' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                  title={screen ? 'Camera disabled during screen share' : video ? 'Turn off camera' : 'Turn on camera'}
                >
                  {video ? <Camera className="w-6 h-6" /> : <CameraOff className="w-6 h-6" />}
                </button>
                
                <button
                  onClick={toggleAudio}
                  className={`p-4 rounded-xl transition-all duration-200 hover:scale-110 ${
                    audio 
                      ? 'bg-slate-700 hover:bg-slate-600' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                  title={audio ? 'Mute' : 'Unmute'}
                >
                  {audio ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </button>

                <div className="w-px h-10 bg-slate-700"></div>

                <button
                  onClick={toggleScreenShare}
                  disabled={!screenAvailable}
                  className={`p-4 rounded-xl transition-all duration-200 hover:scale-110 ${
                    !screenAvailable
                      ? 'bg-slate-800 cursor-not-allowed opacity-50'
                      : screen
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                  title={!screenAvailable ? 'Screen share not available' : screen ? 'Stop sharing' : 'Share screen'}
                >
                  {screen ? <Monitor className="w-6 h-6" /> : <MonitorUp className="w-6 h-6" />}
                </button>

                <button
                  onClick={toggleChat}
                  className={`p-4 rounded-xl transition-all duration-200 hover:scale-110 relative ${
                    showChat ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                  title="Toggle chat"
                >
                  <MessageSquare className="w-6 h-6" />
                  {unreadCount > 0 && !showChat && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full text-xs flex items-center justify-center font-bold animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={togglePolls}
                  className={`p-4 rounded-xl transition-all duration-200 hover:scale-110 ${
                    showPolls ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                  title="Toggle polls"
                >
                  <BarChart3 className="w-6 h-6" />
                </button>

                <div className="w-px h-10 bg-slate-400"></div>

                <button
                  className="p-4 rounded-xl bg-red-600 hover:bg-red-700 transition-all duration-200 hover:scale-110"
                  title="End call"
                  onClick={() => {
                    if (confirm('Are you sure you want to end the call?')) {
                      window.location.reload();
                    }
                  }}
                >
                  <LucidePhoneOff className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoMeet;