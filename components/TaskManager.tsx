import React, { useState } from 'react';
import { Task } from '../types';
import { Plus, Trash2, CheckCircle, Circle, Tag, AlertCircle } from 'lucide-react';

interface TaskManagerProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, setTasks }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      priority,
      category: 'General',
      estimatedPomodoros: 1,
      completedPomodoros: 0
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4 dark:text-white flex items-center gap-2">
        <CheckCircle className="text-emerald-500" /> Tasks
      </h2>

      {/* Input */}
      <form onSubmit={addTask} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm mb-4 border border-slate-100 dark:border-slate-700">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What do you need to focus on?"
            className="flex-1 bg-transparent border-b-2 border-slate-200 dark:border-slate-600 focus:border-emerald-500 outline-none pb-2 text-slate-800 dark:text-white placeholder-slate-400"
          />
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {(['LOW', 'MEDIUM', 'HIGH'] as const).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                  priority === p 
                  ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 border-slate-800' 
                  : 'text-slate-500 border-slate-200 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button type="submit" className="bg-emerald-500 text-white p-2 rounded-lg hover:bg-emerald-600 transition-colors">
            <Plus size={20} />
          </button>
        </div>
      </form>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {tasks.length === 0 && (
          <div className="text-center text-slate-400 mt-10">
            <p>No tasks yet. Plan your day!</p>
          </div>
        )}
        {tasks.map(task => (
          <div key={task.id} className={`group flex items-center p-3 rounded-xl border transition-all ${
            task.completed 
              ? 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-60' 
              : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm'
          }`}>
            <button onClick={() => toggleTask(task.id)} className="mr-3 text-emerald-500 hover:scale-110 transition-transform">
              {task.completed ? <CheckCircle /> : <Circle />}
            </button>
            <div className="flex-1">
              <p className={`font-medium dark:text-white ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                {task.title}
              </p>
              <div className="flex gap-2 mt-1">
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                   task.priority === 'HIGH' ? 'text-red-500 border-red-200 bg-red-50' :
                   task.priority === 'MEDIUM' ? 'text-amber-500 border-amber-200 bg-amber-50' :
                   'text-blue-500 border-blue-200 bg-blue-50'
                }`}>
                  {task.priority}
                </span>
              </div>
            </div>
            <button onClick={() => deleteTask(task.id)} className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskManager;