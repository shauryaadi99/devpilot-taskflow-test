import React, { useState, useEffect, useCallback } from 'react';
import { taskAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatsCard from '../components/StatsCard';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import TaskFilters from '../components/TaskFilters';
import { Plus, CheckSquare, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  // State
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Notification message
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Fetch stats and tasks
  const fetchData = useCallback(async () => {
    try {
      setError('');
      const [statsRes, tasksRes] = await Promise.all([
        taskAPI.getStats(),
        taskAPI.getTasks({
          status: statusFilter !== 'All' ? statusFilter : undefined,
          priority: priorityFilter !== 'All' ? priorityFilter : undefined,
          search: search.trim() ? search.trim() : undefined,
          sortBy: sortBy === 'oldest' ? 'createdAt' : sortBy,
          order: sortBy === 'oldest' || sortBy === 'title' ? 'asc' : 'desc'
        })
      ]);

      setStats(statsRes.data.data);
      setTasks(tasksRes.data.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Unable to load tasks from server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, priorityFilter, search, sortBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle manual refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Handle Create or Update task
  const handleSaveTask = async (taskData) => {
    if (editingTask) {
      await taskAPI.updateTask(editingTask._id, taskData);
      showNotification('Task updated successfully');
    } else {
      await taskAPI.createTask(taskData);
      showNotification('Task created successfully');
    }
    fetchData();
  };

  // Handle status toggle directly from card
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskAPI.updateTask(taskId, { status: newStatus });
      showNotification(`Task marked as ${newStatus}`);
      fetchData();
    } catch (err) {
      showNotification('Failed to update status', 'error');
    }
  };

  // Handle delete task
  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      showNotification('Task deleted');
      fetchData();
    } catch (err) {
      showNotification('Failed to delete task', 'error');
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setSortBy('createdAt');
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-lg border text-sm font-medium flex items-center space-x-2 ${
              notification.type === 'error'
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>{notification.msg}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Welcome & Create Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hello, {user?.name || 'User'} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Here is what is happening with your tasks today.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-xs transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Task</span>
            </button>
          </div>
        </div>

        {/* Global Error Banner if any */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-sm text-rose-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <StatsCard
            type="total"
            count={stats.total}
            isActive={statusFilter === 'All'}
            onClick={() => setStatusFilter('All')}
          />
          <StatsCard
            type="pending"
            count={stats.pending}
            isActive={statusFilter === 'Pending'}
            onClick={() => setStatusFilter('Pending')}
          />
          <StatsCard
            type="inProgress"
            count={stats.inProgress}
            isActive={statusFilter === 'In Progress'}
            onClick={() => setStatusFilter('In Progress')}
          />
          <StatsCard
            type="completed"
            count={stats.completed}
            isActive={statusFilter === 'Completed'}
            onClick={() => setStatusFilter('Completed')}
          />
        </div>

        {/* Progress Overview Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Overall Progress
              </span>
            </div>
            <span className="text-sm font-bold text-slate-800">
              {stats.completionRate}% Completed
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>

        {/* Filters and Search Bar */}
        <TaskFilters
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onReset={handleResetFilters}
        />

        {/* Task Cards Content */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 font-medium">Fetching tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-300 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
              <CheckSquare className="w-7 h-7 stroke-[1.8]" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No tasks found</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">
              {search || statusFilter !== 'All' || priorityFilter !== 'All'
                ? 'No tasks match your current filter settings. Try clearing your filters.'
                : 'You have not added any tasks yet. Create your first task to get started!'}
            </p>
            <div className="mt-5">
              {search || statusFilter !== 'All' || priorityFilter !== 'All' ? (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-100 transition-colors"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Create First Task</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={(t) => {
                  setEditingTask(t);
                  setIsModalOpen(true);
                }}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTask}
        initialTask={editingTask}
      />
    </div>
  );
};

export default Dashboard;

