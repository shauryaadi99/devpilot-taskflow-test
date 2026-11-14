import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle,
  AlertCircle,
  Flag
} from 'lucide-react';

const statusStyles = {
  Pending: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500'
  },
  'In Progress': {
    bg: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-500'
  },
  Completed: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500'
  }
};

const priorityStyles = {
  Low: 'bg-slate-100 text-slate-600 border-slate-200',
  Medium: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  High: 'bg-rose-50 text-rose-700 border-rose-200'
};

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusConfig = statusStyles[task.status] || statusStyles.Pending;
  const priorityClass = priorityStyles[task.priority] || priorityStyles.Medium;

  const handleQuickStatusChange = async (newStatus) => {
    if (newStatus === task.status || isUpdating) return;
    try {
      setIsUpdating(true);
      await onStatusChange(task._id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const isOverdue =
    task.dueDate &&
    task.status !== 'Completed' &&
    new Date(task.dueDate).setHours(23, 59, 59, 999) < Date.now();

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Badges & Controls */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Status Selector Dropdown */}
            <div className="relative inline-block">
              <select
                value={task.status}
                onChange={(e) => handleQuickStatusChange(e.target.value)}
                disabled={isUpdating}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer appearance-none pr-6 focus:outline-none focus:ring-1 focus:ring-indigo-400 ${statusConfig.bg}`}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-current">
                <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
              </div>
            </div>

            {/* Priority Badge */}
            <span
              className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md border ${priorityClass}`}
            >
              <Flag className="w-3 h-3 mr-1" />
              {task.priority}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Edit task"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          className={`text-base font-semibold text-slate-900 leading-snug break-words ${
            task.status === 'Completed' ? 'line-through text-slate-400' : ''
          }`}
        >
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p
            className={`mt-2 text-sm text-slate-600 line-clamp-3 leading-relaxed break-words ${
              task.status === 'Completed' ? 'text-slate-400' : ''
            }`}
          >
            {task.description}
          </p>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          {formattedDueDate && (
            <span
              className={`inline-flex items-center font-medium ${
                isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-500'
              }`}
              title={isOverdue ? 'This task is overdue!' : 'Due Date'}
            >
              <Calendar className="w-3.5 h-3.5 mr-1" />
              {formattedDueDate}
              {isOverdue && <span className="ml-1 text-[10px] uppercase font-bold">(Overdue)</span>}
            </span>
          )}
        </div>

        <span className="text-[11px] text-slate-400">
          {new Date(task.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })}
        </span>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl border border-slate-100">
            <h4 className="text-base font-bold text-slate-900">Delete Task</h4>
            <p className="mt-1 text-sm text-slate-600">
              Are you sure you want to delete <span className="font-semibold text-slate-800">"{task.title}"</span>? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete(task._id);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;

