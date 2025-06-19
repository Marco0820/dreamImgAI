import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useSession } from 'next-auth/react';

const ProfilePage = () => {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated' && session?.user) {
            setUsername(session.user.name || '');
            // Assuming 'bio' is not part of the default session user object.
            // You might need to extend the session type.
            setBio(''); 
        }
    }, [status, session, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Here you would typically call an API to update the user profile
            // For now, just show a success toast as an example.
            toast.success('Profile updated successfully! (Frontend only)');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };
    
    if (status === 'loading') {
        return <div className="text-center p-10">Loading profile...</div>
    }

    if (status === 'unauthenticated' || !session?.user) {
        return <div className="text-center p-10">Please log in to view your profile.</div>;
    }

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center space-x-4 mb-6">
                    <img
                        src={session.user.image || '/default-avatar.png'}
                        alt="User Avatar"
                        className="w-24 h-24 rounded-full object-cover"
                    />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{session.user.name}</h1>
                        <p className="text-gray-400">{session.user.email}</p>
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

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
});

export default ProfilePage; 