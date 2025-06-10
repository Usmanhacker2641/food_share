import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Package, AlertTriangle, BarChart, Search, Filter } from 'lucide-react';
import { cn } from '../lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'suspended';
  joinedAt: string;
}

interface Report {
  id: string;
  type: 'user' | 'donation';
  title: string;
  description: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'reports'>('users');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - in a real app, this would come from your backend
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'John Donor',
      email: 'john@example.com',
      role: 'donor',
      status: 'active',
      joinedAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Sarah Recipient',
      email: 'sarah@example.com',
      role: 'recipient',
      status: 'active',
      joinedAt: '2024-02-01',
    },
    {
      id: '3',
      name: 'Mike Rider',
      email: 'mike@example.com',
      role: 'rider',
      status: 'suspended',
      joinedAt: '2024-02-15',
    },
  ];

  const mockReports: Report[] = [
    {
      id: '1',
      type: 'user',
      title: 'Suspicious user activity',
      description: 'Multiple cancelled pickups',
      status: 'pending',
      createdAt: '2024-03-15',
    },
    {
      id: '2',
      type: 'donation',
      title: 'Expired food donation',
      description: 'Food items past expiration date',
      status: 'resolved',
      createdAt: '2024-03-14',
    },
  ];

  // Redirect if not an admin
  React.useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReports = mockReports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserAction = (userId: string, action: 'suspend' | 'activate') => {
    // In a real app, this would make an API call
    console.log(`${action} user:`, userId);
  };

  const handleReportAction = (reportId: string, action: 'resolve' | 'dismiss') => {
    // In a real app, this would make an API call
    console.log(`${action} report:`, reportId);
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Admin Dashboard</h1>
        <p className="mt-2 text-neutral-600">
          Manage users and monitor platform activity
        </p>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-card">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
            <Users className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">Total Users</h3>
          <p className="text-2xl font-bold text-primary-600">{mockUsers.length}</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-card">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary-100">
            <Package className="h-6 w-6 text-secondary-600" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">Active Donations</h3>
          <p className="text-2xl font-bold text-secondary-600">12</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-card">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning-100">
            <AlertTriangle className="h-6 w-6 text-warning-500" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">Pending Reports</h3>
          <p className="text-2xl font-bold text-warning-500">
            {mockReports.filter(r => r.status === 'pending').length}
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-card">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-100">
            <BarChart className="h-6 w-6 text-accent-600" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">Success Rate</h3>
          <p className="text-2xl font-bold text-accent-600">94%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-neutral-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={cn(
                'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
              )}
            >
              Users Management
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={cn(
                'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
                activeTab === 'reports'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
              )}
            >
              Reports & Issues
            </button>
          </nav>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'users' ? 'users' : 'reports'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-10 pr-4 text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
          />
        </div>
      </div>

      {/* Content */}
      {activeTab === 'users' ? (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <div className="font-medium text-neutral-900">{user.name}</div>
                      <div className="text-sm text-neutral-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-full bg-primary-100 px-2 text-xs font-semibold leading-5 text-primary-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 text-xs font-semibold leading-5',
                        user.status === 'active'
                          ? 'bg-success-100 text-success-800'
                          : 'bg-error-100 text-error-800'
                      )}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">
                    {new Date(user.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button
                      onClick={() =>
                        handleUserAction(
                          user.id,
                          user.status === 'active' ? 'suspend' : 'activate'
                        )
                      }
                      className={cn(
                        'rounded px-2 py-1 text-sm font-medium',
                        user.status === 'active'
                          ? 'text-error-600 hover:bg-error-50'
                          : 'text-success-600 hover:bg-success-50'
                      )}
                    >
                      {user.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="rounded-lg border border-neutral-200 bg-white p-6 shadow-card"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                        report.type === 'user'
                          ? 'bg-error-100 text-error-800'
                          : 'bg-warning-100 text-warning-800'
                      )}
                    >
                      {report.type}
                    </span>
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                        report.status === 'pending'
                          ? 'bg-warning-100 text-warning-800'
                          : 'bg-success-100 text-success-800'
                      )}
                    >
                      {report.status}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-neutral-900">
                    {report.title}
                  </h3>
                  <p className="mt-1 text-neutral-600">{report.description}</p>
                  <p className="mt-2 text-sm text-neutral-500">
                    Reported on: {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {report.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReportAction(report.id, 'resolve')}
                      className="rounded bg-primary-100 px-3 py-1 text-sm font-medium text-primary-600 hover:bg-primary-200"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleReportAction(report.id, 'dismiss')}
                      className="rounded bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-600 hover:bg-neutral-200"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredReports.length === 0 && (
            <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-neutral-400" />
              <h3 className="mt-4 text-lg font-medium text-neutral-900">No reports found</h3>
              <p className="mt-2 text-neutral-600">
                There are no reports matching your search criteria
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;