// components/UserTable.jsx
import Link from 'next/link';
import React from 'react';

const UserTable = ({ users, loggedInAdmin, onEdit, onDelete, onStatusToggle }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    console.log(users);

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Login
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                        <tr
                            key={user._id || user.id} // Use _id if available, fallback to id
                            className={`hover:bg-gray-50 ${user.isCurrentUser ? 'bg-indigo-50' : ''}`}
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${user.isCurrentUser ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-700'
                                            }`}>
                                            <span className="font-bold">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900 flex items-center">
                                            <Link
                                                href={`/admin/users/${user._id || user.id}`}
                                                className="hover:text-indigo-600 hover:underline"
                                                title="View user details"
                                            >
                                                {user.name || 'Unknown User'}
                                            </Link>
                                            {user.isCurrentUser && (
                                                <span className="ml-2 px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin'
                                        ? 'bg-purple-100 text-purple-800'
                                        : user.role === 'moderator'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {(user.role || 'user').charAt(0).toUpperCase() + (user.role || 'user').slice(1)}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                    onClick={() => onStatusToggle(user._id || user.id)}
                                    disabled={user.isCurrentUser}
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${user.status === 'active' || user.emailVerified
                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                                        } ${user.isCurrentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title={user.isCurrentUser ? "Can't change your own status" : "Click to toggle status"}
                                >
                                    {user.emailVerified ? 'Verified' : (user.status || 'inactive').charAt(0).toUpperCase() + (user.status || 'inactive').slice(1)}
                                </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(user.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(user.lastLogin)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-3">
                                    {/* View Details Link */}
                                    <Link
                                        href={`/admin/users/${user._id}`}
                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                        title="View Details"
                                    >
                                        <i className="fas fa-eye"></i>
                                    </Link>
                                    
                                    {/* Edit Button */}
                                    <button
                                        onClick={() => onEdit(user)}
                                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                        title="Edit User"
                                    >
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    
                                    {/* Delete Button */}
                                    <button
                                        onClick={() => onDelete(user._id || user.id)}
                                        disabled={user.isCurrentUser}
                                        className={`${user.isCurrentUser
                                                ? 'text-gray-400 cursor-not-allowed'
                                                : 'text-red-600 hover:text-red-900'
                                            } transition-colors`}
                                        title={user.isCurrentUser ? "Can't delete yourself" : "Delete user"}
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;