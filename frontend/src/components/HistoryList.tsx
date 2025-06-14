import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHistory } from '../store/imageSlice';
import { RootState, AppDispatch } from '../store';

interface HistoryItem {
    id: number;
    prompt: string;
    image_url: string;
    created_at: string;
}

const HistoryList = () => {
    const dispatch = useDispatch<AppDispatch>();
    const history = useSelector((state: RootState) => state.image.history);
    const loading = useSelector((state: RootState) => state.image.loading);
    const error = useSelector((state: RootState) => state.image.error);

    useEffect(() => {
        dispatch(fetchHistory());
    }, [dispatch]);

    if (loading) {
        return <div>Loading history...</div>;
    }

    if (error) {
        return <div>Error loading history: {error}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Generation History</h2>
            {history.length === 0 ? (
                <p>No images generated yet.</p>
            ) : (
                <ul className="space-y-4">
                    {history.map((item: HistoryItem) => (
                        <li key={item.id} className="flex items-center space-x-4">
                            <img src={item.image_url} alt={item.prompt} className="w-16 h-16 rounded-md object-cover" />
                            <div>
                                <p className="font-semibold">{item.prompt}</p>
                                <p className="text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default HistoryList; 