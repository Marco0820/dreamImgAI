import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { checkUserSession } from '../store/authSlice';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

const ProfilePage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { user, token } = useSelector((state: RootState) => state.auth);

    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            router.push('/login');
        } else if (!user) {
            dispatch(checkUserSession());
        } else {
            setUsername(user.username || '');
            setBio(user.bio || '');
        }
    }, [token, user, router, dispatch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // await dispatch(updateUser({ username, bio })).unwrap();
            toast.success('Profile updated successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };
    
    if (!user) {
        return <div className="text-center p-10">Loading profile...</div>
    }

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center space-x-4 mb-6">
                    <img
                        src={user.avatar || '/default-avatar.png'}
                        alt="User Avatar"
                        className="w-24 h-24 rounded-full object-cover"
                    />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
                        <p className="text-gray-400">{user.email}</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage; 