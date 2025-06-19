import { NextPage } from 'next';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const PaymentSuccessPage: NextPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-900 text-white">
            <CheckCircleIcon className="h-24 w-24 text-green-500" />
            <h1 className="mt-6 text-4xl font-bold">Payment Successful!</h1>
            <p className="mt-4 text-lg text-gray-400">
                Thank you for your purchase. Your account has been upgraded and credits have been added.
            </p>
            <Link href="/" className="mt-8">
                <button className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700">
                    Go to Dashboard
                </button>
            </Link>
        </div>
    );
};

export default PaymentSuccessPage; 