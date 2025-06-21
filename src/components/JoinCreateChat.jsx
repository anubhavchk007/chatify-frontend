import React, { useState } from 'react';
import chatIcon from '../assets/speech-bubble.png'; 
import toast from 'react-hot-toast';
import { createRoomApi, joinChatApi } from '../services/RoomService'; // Assuming you have an API function to create a room
import useChatContext from '../context/ChatContext';
import { useNavigate } from 'react-router';

const JoinCreateChat = () => {
    const [detail, setDetail] = useState({
        roomId: '',
        userName: '',
    });

    const {roomId, currentUser, connected, setRoomId, setCurrentUser, setConnected} = useChatContext();
    const navigate = useNavigate();

    function validateForm() {
        if (!detail.roomId || !detail.userName) {
            toast.error('Please fill in all fields');
            return false;
        }
        return true;
    }

    function handleInputChange(event) {
        setDetail({
            ...detail,
            [event.target.name]: event.target.value,
        });
    }

    async function joinChat() {
        if (validateForm()) {
            try {
                const room = await joinChatApi(detail.roomId);
                toast.success('Joined room successfully');
                setCurrentUser(detail.userName);
                setRoomId(room.roomId);
                setConnected(true);

                navigate('/chat');
            } catch ( error) {
                console.log(error);
                if (error.status === 400) {
                    toast.error('Room not found');
                } else {
                    toast.error('Failed to join room');
                }
            }
        }
    }

    async function createRoom() {
        if (validateForm()) {
            console.log(detail);
            // call api to create a new room on backend
            try {
                const response = await createRoomApi(detail.roomId);
                console.log(response);
                toast.success('Room created successfully');
                setCurrentUser(detail.userName);
                setRoomId(response.roomId);
                setConnected(true);

                navigate('/chat');
                // joinChat();
            } catch (error) {
                console.error('Error creating room:', error);
                if (error.status === 400) {
                    toast.error('Room with the same ID already exists');
                } else {
                    toast.error('Failed to create room');
                }
            }
        }
    }

  return (
    <div className="min-h-screen flex items-center justify-center">
        <div className="p-10 dark:border-gray-700 border w-full flex flex-col gap-5 max-w-md rounded-lg dark:bg-gray-900 shadow">
            <div>
                <img src={chatIcon} alt="logo" className='w-24 mx-auto' />
            </div>
            <h1 className="text-2xl font-semibold text-center ">Join Room / Create Room</h1>
            {/* name div */}
            <div>
                <label htmlFor='name' className='block font-medium mb-2'>Your name</label>
                <input 
                onChange={handleInputChange}
                value={detail.userName}
                name='userName'
                placeholder='Enter your name'
                type='text' id='name' className='w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-full focus:outline-none' />
            </div>

            {/* room id div */}
            <div>
                <label htmlFor='name' className='block font-medium mb-2'>Room ID / New Room ID</label>
                <input 
                name='roomId'
                onChange={handleInputChange}
                value={detail.roomId}
                placeholder='Enter room ID or create a new one'
                type='text' id='name' className='w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-full focus:outline-none' />
            </div>

            {/* buttons div */}
            <div className='flex items-center justify-between mt-4'>
                <button 
                onClick={joinChat}
                className='px-3 py-2 w-[120px] dark:bg-blue-800 hover:dark:bg-blue-600 active:dark:bg-blue-700 rounded'>Join Room</button>
                <button 
                onClick={createRoom}
                className='px-3 py-2 w-[120px] dark:bg-rose-500 hover:dark:bg-rose-600 active:dark:bg-rose-700 rounded'>Create Room</button>

            </div>
        </div>
    </div>
  )
};

export default JoinCreateChat;