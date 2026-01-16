import React, { useState } from 'react';
import { X, Calendar, User, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api';

const BulkAttendanceModal = ({ isOpen, onClose, students, onSuccess }) => {
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [status, setStatus] = useState('PRESENT');
    const [overwrite, setOverwrite] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!selectedStudent || !selectedMonth) {
            setError('Please select both student and month');
            return;
        }

        setLoading(true);
        try {
            await api.post('/teacher/attendance/bulk/', {
                student_id: selectedStudent,
                month: selectedMonth,
                status: status,
                overwrite: overwrite
            });
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to mark bulk attendance');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="glass-card rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-scale-in">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold gradient-text">Bulk Attendance</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-200">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Student</label>
                        <div className="relative">
                            <select
                                value={selectedStudent}
                                onChange={(e) => setSelectedStudent(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl appearance-none bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                            >
                                <option value="">Select a student...</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.first_name} {s.last_name} ({s.username})
                                    </option>
                                ))}
                            </select>
                            <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Month</label>
                        <div className="relative">
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                            />
                            <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Status to Mark</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setStatus('PRESENT')}
                                className={`p-3 rounded-xl border-2 font-semibold transition-all flex items-center justify-center gap-2 ${status === 'PRESENT'
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                            >
                                <CheckCircle2 className={`w-5 h-5 ${status === 'PRESENT' ? 'fill-current' : ''}`} />
                                Present
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatus('ABSENT')}
                                className={`p-3 rounded-xl border-2 font-semibold transition-all flex items-center justify-center gap-2 ${status === 'ABSENT'
                                    ? 'border-red-500 bg-red-50 text-red-700'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                            >
                                <X className="w-5 h-5" />
                                Absent
                            </button>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                        <input
                            type="checkbox"
                            ids="overwrite"
                            checked={overwrite}
                            onChange={(e) => setOverwrite(e.target.checked)}
                            className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="overwrite" className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-900 block mb-0.5">Overwrite existing records</span>
                            If unchecked, days with existing attendance (e.g. manually marked absences) will be skipped.
                        </label>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 text-lg shadow-lg shadow-blue-500/20"
                        >
                            {loading ? 'Processing...' : 'Mark All Days'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BulkAttendanceModal;
