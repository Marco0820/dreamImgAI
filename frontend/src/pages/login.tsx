import { useState, useEffect, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { loginUser, AuthState } from '@/store/authSlice';
import { AppDispatch, RootState } from '@/store';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch<AppDispatch>();
    const { token, error } = useSelector((state: RootState) => state.auth);
    const router = useRouter();

    useEffect(() => {
        if (token) {
            router.push('/');
        }
    }, [token, router]);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(loginUser({ email, password })).unwrap();
            router.push('/');
        } catch (err) {
            console.error('Failed to login:', err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-white">Log in to DreamImg AI</h1>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                     {error && <p className="text-red-500 text-sm">{typeof error === 'string' ? error : 'Login failed'}</p>}
                    <button
                        type="submit"
                        className="w-full py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
                    >
                        Log In
                    </button>
                </form>
                <p className="text-sm text-center text-gray-400">
                    Don't have an account?{' '}
                    <Link href="/signup" className="font-medium text-blue-500 hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage; 