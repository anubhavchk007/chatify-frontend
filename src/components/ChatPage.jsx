import React, { use, useEffect, useRef, useState } from 'react';
import { MdAttachFile, MdSend } from 'react-icons/md';
import chatBg from '../assets/chat-bg.png'; 
import useChatContext from '../context/ChatContext';
import { useNavigate } from 'react-router';
import { baseURL } from '../config/AxiosHelper';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import toast from 'react-hot-toast';
import { getMessages } from '../services/RoomService';
import { formatTime } from '../config/TimeHelper';

const AVATARS = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7x7RFFT8-4WY26mVJxhk5lvmoTIhb_0NzAQ&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDv4IypsNlDqKx5_XwdakAhV19hDBHjkWkwpyFoV8ZitZNKiG2ukUdBfSIvcnmkd1ChDo&usqp=CAU",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVqmU7y6soGvdinKBPwoIZtwTdl1E_8oICMHakli76aJ1k_gIDeMzRycHPZsAhj88jZUM&usqp=CAU",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvZRzCOTmTpG-0zKoHeoNr8J-LeI_ihfZO3Q&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR60SJOqpVKgNKYEgFRWvk5gHzcMfVWOwJl_KOBcEeCDRv04wrvTRMwgsZ8bT298zDW3nc&usqp=CAU",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwfki8qupAeZafWi7UTxzDOHPhtTyJ2AGghm6zF6sJjKVXxxac_gFEZ5nsHmghc31f54M&usqp=CAU"
]

const ChatPage = () => {
    const {roomId, currentUser, connected, setConnected, setRoomId, setCurrentUser} = useChatContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!connected) {
            navigate('/');
        }
    }, [connected, roomId, currentUser]);

    const [messages, setMessages] = useState([]); 
    const [input, setInput] = useState('');
    const inputRef = useRef(null);
    const chatBoxRef = useRef(null);
    const [stompClient, setStompClient] = useState(null);
    const usernameMap = useRef({});
    const avatarMap = useRef({});

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scroll({
                top: chatBoxRef.current.scrollHeight,
                behavior: 'smooth'
            })
        }
    }, [messages])


    // page init:
    // messages ko load karna hai

    useEffect(() => {
        async function loadMessages() {
            try {
                const messages = await getMessages(roomId);
                // console.log(messages);
                setMessages(messages);
            } catch (error) {
                
            }
        }
        if (connected) {
            inputRef.current?.focus();
            loadMessages();
        }
    }, [])

    // stompClient ko init karna hai
        // subscribe
    useEffect(() => {
        const connectWebSocket = () => {
        ///SockJS
        const sock = new SockJS(`${baseURL}/chat`);
        const client = Stomp.over(sock);

        client.connect({}, () => {
            setStompClient(client);

            client.subscribe(`/topic/room/${roomId}`, (message) => {
                const newMessage = JSON.parse(message.body);
                setMessages((prev) => [...prev, newMessage]);


                //rest of the work after success receiving the message
                });
            });
        };

        if (connected) {
            connectWebSocket();
        }

        //stomp client
    }, [roomId]);
    
    // send message handler
    const sendMessage = async () => {
        if (stompClient && connected && input.trim()) {
            // console.log(input);
            const message = {
                sender:currentUser,
                content:input,
                roomId:roomId
            };

            stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(message));
            setInput('');
            inputRef.current?.focus();
        }
    };

    function handleLogout() {
        stompClient.disconnect();
        setConnected(false);
        setRoomId('');
        setCurrentUser('');
        navigate('/');
    }



  return (
    <div>
        {/* this is the header */}
        <header className='dark:border-gray-700 fixed w-full dark:bg-gray-900 py-5 shadow flex justify-around items-center'>
            <div>
                <h1 className="text-xl font-semibold">
                    Room : <span>Family Room</span>
                </h1>
            </div>
            <div>
                <h1 className='text-xl font-semibold'>
                    User : <span>{currentUser}</span>
                </h1>
            </div>
            <div>
                <button
                onClick={handleLogout}
                className='dark:bg-red-700 dark:hover:bg-red-500 active:dark:bg-red-600 px-3 py-2 rounded-full'>
                    Leave Room
                </button>
            </div>
        </header>

        {/* this is the chat messages section */}
        <main className='py-20 w-2/3 mx-auto h-screen overflow-auto rounded-[10px] h-[calc(100vh-1.5rem)]'
        ref={chatBoxRef}
        style={{ 
            backgroundImage: `url(${chatBg})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            scrollbarWidth: 'thin',
            scrollbarColor: '#4a5568 transparent'
            
        }}>
            {
                messages.map((message, index) => {
                    const isCurrentUser = message.sender === currentUser;
                    const isSameAsPrevious = index > 0 && messages[index - 1].sender === message.sender;
                    const randInd = Math.floor(Math.random() * AVATARS.length);
                    avatarMap[message.sender] = avatarMap[message.sender] ? avatarMap[message.sender] : AVATARS[randInd];
                    const avatarPic = avatarMap[message.sender];

                    return (
                    <div
                        key={index}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${
                        isSameAsPrevious ? 'mt-0.5' : 'mt-5'
                        }`}
                    >
                        <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} ml-2 gap-2 items-start`}>
                        
                        {/* Avatar placeholder for alignment */}
                        <div className="w-10 h-10 flex-shrink-0">
                            <img
                            src={avatarPic}
                            alt="avatar"
                            className={`h-10 w-10 rounded-full ${isSameAsPrevious ? 'invisible' : ''}`}
                            />
                        </div>

                        {/* Message bubble */}
                        <div className={`flex flex-col max-w-[75%]`}>
                            <div
                            className={`px-4 py-2 ${
                                isCurrentUser ? 'dark:bg-sky-900' : 'dark:bg-slate-800'
                            } rounded-xl break-words`}
                            >
                            {!isSameAsPrevious && (
                                <p className="text-sm font-semibold mb-1">{message.sender}</p>
                            )}
                            <p className="text-base leading-snug">{message.content}</p>
                            <div className="flex justify-end mt-1">
                                <span className="text-[12px] dark:text-gray-400">{formatTime(message.timeStamp)}</span>
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    );
                })
                
            }

        </main>

        {/* this is the input textbox and send button */}
        <div className='fixed bottom-0 w-full h-16'>
            <div className='h-full gap-4 flex relative items-center justify-between rounded-full dark:bg-slate-800 w-2/3 mx-auto'>
                <input 
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && input.trim() !== '') {
                        sendMessage();
                    }
                }}
                ref={inputRef}
                value={input}
                onChange={(e) => {setInput(e.target.value)}}
                type='text' placeholder='Type your message here...' 
                className='dark:border-gray-700 w-full dark:bg-slate-800 pl-6 pb-3 pr-1 px-3 py-2 rounded-full h-full focus:outline-none' />
                <div className='flex'>
                    <button className='dark:transparent h-11 w-11 flex mr-2 hover:dark:bg-slate-600 active:dark:bg-gray-700 justify-center items-center px-3 py-2 rounded-full'>
                        <MdAttachFile className='h-6 w-6'/>
                    </button>
                    
                    <button 
                    onClick={sendMessage}
                    className='dark:bg-green-600 hover:dark:bg-green-500 active:dark:bg-green-700 h-11 w-11 flex mr-3 justify-center items-center px-3 py-2 rounded-full'>
                        <MdSend className='h-6 w-6' />
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ChatPage;