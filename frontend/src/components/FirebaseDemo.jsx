import React, { useState, useEffect } from 'react';
import { uploadFile } from '../services/storageService';
import { writeData, readData, removeData, addDocument } from '../services/databaseService';
import { registerUser, loginUser, logoutUser, subscribeToAuthChanges } from '../services/authService';
import toast from 'react-hot-toast';

const FirebaseDemo = () => {
  const [file, setFile] = useState(null);
  const [dbPath, setDbPath] = useState('test/data');
  const [dbValue, setDbValue] = useState('');
  const [readDbValue, setReadDbValue] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        toast.success(`Logged in as: ${currentUser.email}`);
      } else {
        toast.info('Logged out');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first!');
      return;
    }
    try {
      const filePath = `uploads/${file.name}`;
      const downloadURL = await uploadFile(file, filePath);
      toast.success(`File uploaded: ${downloadURL}`);
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`);
    }
  };

  const handleWriteData = async () => {
    try {
      await writeData(dbPath, dbValue);
      toast.success(`Data written to ${dbPath}`);
    } catch (error) {
      toast.error(`Write failed: ${error.message}`);
    }
  };

  const handleReadData = () => {
    readData(dbPath, (data) => {
      setReadDbValue(JSON.stringify(data, null, 2));
      toast.success(`Data read from ${dbPath}`);
    });
  };

  const handleRemoveData = async () => {
    try {
      await removeData(dbPath);
      toast.success(`Data removed from ${dbPath}`);
      setReadDbValue('');
    } catch (error) {
      toast.error(`Remove failed: ${error.message}`);
    }
  };

  const handlePushData = async () => {
    try {
      const key = await addDocument(dbPath, JSON.parse(dbValue));
      toast.success(`Data pushed to ${dbPath} with key: ${key}`);
    } catch (error) {
      toast.error(`Push failed: ${error.message}`);
    }
  };

  const handleRegister = async () => {
    try {
      await registerUser(email, password);
      toast.success('User registered successfully!');
    } catch (error) {
      toast.error(`Registration failed: ${error.message}`);
    }
  };

  const handleLogin = async () => {
    try {
      await loginUser(email, password);
      toast.success('User logged in successfully!');
    } catch (error) {
      toast.error(`Login failed: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success('User logged out!');
    } catch (error) {
      toast.error(`Logout failed: ${error.message}`);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Firebase Demo</h2>

      {/* Auth Section */}
      <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Authentication</h3>
        {user ? (
          <p className="text-gray-700 dark:text-gray-300 mb-2">Logged in as: {user.email}</p>
        ) : (
          <p className="text-gray-700 dark:text-gray-300 mb-2">Not logged in</p>
        )}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex space-x-2">
          <button onClick={handleRegister} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Register
          </button>
          <button onClick={handleLogin} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
            Login
          </button>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
            Logout
          </button>
        </div>
      </div>

      {/* Storage Section */}
      <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Storage (File Upload)</h3>
        <input type="file" onChange={handleFileChange} className="mb-4 text-gray-900 dark:text-white" />
        <button onClick={handleUpload} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
          Upload File
        </button>
      </div>

      {/* Realtime Database Section */}
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Realtime Database</h3>
        <input
          type="text"
          placeholder="Database Path (e.g., users/123/profile)"
          className="w-full p-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          value={dbPath}
          onChange={(e) => setDbPath(e.target.value)}
        />
        <textarea
          placeholder="Data (JSON or string)"
          className="w-full p-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white h-24"
          value={dbValue}
          onChange={(e) => setDbValue(e.target.value)}
        ></textarea>
        <div className="flex space-x-2 mb-4">
          <button onClick={handleWriteData} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
            Write Data
          </button>
          <button onClick={handlePushData} className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors">
            Push Data
          </button>
          <button onClick={handleReadData} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors">
            Read Data
          </button>
          <button onClick={handleRemoveData} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
            Remove Data
          </button>
        </div>
        {readDbValue && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Read Data:</h4>
            <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">{readDbValue}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirebaseDemo;