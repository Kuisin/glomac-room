'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const accessKey = 'glomac-2024';
  const [permission, setPermission] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('')

  const getPageTitle = () => {
    const path = pathname.split('/').pop();
    switch (path) {
      case 'force':
        return 'Force Records Management';
      case 'list':
        return 'List Management';
      case 'courses':
        return 'Courses Management';
      default:
        return 'Admin Dashboard';
    }
  };

  useEffect(() => {
    const savedPassword = localStorage.getItem('adminPassword');
    if (savedPassword === accessKey) {
      setPermission(true);
    }
  }, []);

  const checkPassword = (event: React.FormEvent) => {
    event.preventDefault();
    if (password === accessKey) {
      setPermission(true);
      localStorage.setItem('adminPassword', password);
      return;
    }
    setPassword('');
  }

  const handleLogout = () => {
    setPermission(false);
    localStorage.removeItem('adminPassword');
    setPassword('');
  }

  return (
    <div className='bg-white text-black'>
      {permission ? (
        <>
        <header className="sticky top-0 left-0 z-40 w-full flex items-center gap-2 bg-white px-4 py-4 shadow">
          <h1 className="font-bold mr-auto">{getPageTitle()}</h1>
            <button
              onClick={handleLogout}
              className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded shadow"
            >
              Logout
            </button>
          <button
            className="bg-gray-200 hover:bg-white text-gray-800 px-4 py-2 rounded shadow"
            onClick={() => {
              router.push("./");
            }}
          >
            HOME
          </button>
        </header>
          {children}
        </>
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
