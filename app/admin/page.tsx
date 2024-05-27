'use client'
import { useRouter } from 'next/navigation';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCalendarDays, faHouse, faRepeat, fas } from '@fortawesome/free-solid-svg-icons'
library.add(fas)

export default function Admin() {
    const router = useRouter();

    return (
        <div className='flex justify-center items-center'>
            <div className='grid grid-cols-1 lg:grid-cols-2 content-center items-center h-screen gap-8'>
                <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                    <div className="w-10 h-10 text-gray-500 dark:text-gray-400 mb-4">
                        <FontAwesomeIcon icon={faHouse} className="text-2xl" />
                    </div>
                    <a onClick={() => router.push('./')} className="cursor-pointer">
                        <h5 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Home</h5>
                    </a>
                    <p className="mb-3 font-normal text-gray-500 dark:text-gray-400">Go to this step by step guideline process on how to add recurring bookings:</p>
                    <a
                        className="inline-flex font-medium items-center text-blue-600 hover:underline">
                        See our manual
                        <svg className="w-3 h-3 ms-2.5 rtl:rotate-[270deg]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778" />
                        </svg>
                    </a>
                </div>
                <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                    <div className="w-10 h-10 text-gray-500 dark:text-gray-400 mb-4">
                        <FontAwesomeIcon icon={faCalendarDays} className="text-2xl" />
                    </div>
                    <a onClick={() => router.push('./admin/force')} className="cursor-pointer">
                        <h5 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Add Weekly Bookings</h5>
                    </a>
                    <p className="mb-3 font-normal text-gray-500 dark:text-gray-400">Go to this step by step guideline process on how to add weekly bookings:</p>
                    <a
                        className="inline-flex font-medium items-center text-blue-600 hover:underline">
                        See our manual
                        <svg className="w-3 h-3 ms-2.5 rtl:rotate-[270deg]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778" />
                        </svg>
                    </a>
                </div>
                <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                    <div className="w-10 h-10 text-gray-500 dark:text-gray-400 mb-4">
                        <FontAwesomeIcon icon={faRepeat} className="text-2xl" />
                    </div>
                    <a onClick={() => router.push('./admin/courses')} className="cursor-pointer">
                        <h5 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Add Recurring Bookings</h5>
                    </a>
                    <p className="mb-3 font-normal text-gray-500 dark:text-gray-400">Go to this step by step guideline process on how to add recurring bookings:</p>
                    <a
                        className="inline-flex font-medium items-center text-blue-600 hover:underline">
                        See our manual
                        <svg className="w-3 h-3 ms-2.5 rtl:rotate-[270deg]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
}
