import { NextPage } from 'next';
import Link from 'next/link';
import { XCircleIcon } from '@heroicons/react/24/solid';

const PaymentCancelPage: NextPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-900 text-white">
            <XCircleIcon className="h-24 w-24 text-red-500" />
            <h1 className="mt-6 text-4xl font-bold">Payment Cancelled</h1>
            <p className="mt-4 text-lg text-gray-400">
                Your payment process was cancelled. You can try again from the pricing page.
            </p>
            <Link href="/pricing" className="mt-8">
                <button className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700">
                    Back to Pricing
                </button>
            </Link>
        </div>
    );
};

export default PaymentCancelPage; 