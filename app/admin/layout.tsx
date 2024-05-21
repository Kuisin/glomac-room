'use client';
import { useState } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const accessKey = 'glomac-mana';
  const [permission, setPermission] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('')

  const checkPassword = (event: React.FormEvent) => {
    event.preventDefault();
    if (password == accessKey) {
      setPermission(true);
      return;
    }
    setPassword('');
  }

  return (
    <div className='bg-white text-black'>
      {permission ? (
        <>{children}</>
      ) : (
        <div className='m-10'>
          <form onSubmit={checkPassword}>
            <div className="mb-5">
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
            </div>
            <div className='flex justify-between'>
              <button
                type="submit"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >Submit</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
