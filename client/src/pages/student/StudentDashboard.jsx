import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, TrendingUp, CheckCircle2, XCircle, Users, MessageSquare, X, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [reason, setReason] = useState('');
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const fetchAttendance = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/student/attendance/?month=${selectedMonth}`);
            setAttendance(response.data);
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
            setMsg('Error loading attendance');
        } finally {
            setLoading(false);
        }
    }, [selectedMonth]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleUpdateReason = async () => {
        if (!selectedRecord) return;

        setSaving(true);
        setMsg('');
        try {
            await api.patch(`/student/attendance/${selectedRecord.id}/reason/`, {
                absence_reason: reason
            });
            setMsg('Absence reason updated successfully!');
            setTimeout(() => setMsg(''), 3000);
            setShowReasonModal(false);
            fetchAttendance(); // Refresh data
        } catch (error) {
            console.error('Failed to update reason:', error);
            setMsg('Failed to update absence reason');
        } finally {
            setSaving(false);
        }
    };

    const openReasonModal = (record) => {
        if (record.status === 'ABSENT') {
            setSelectedRecord(record);
            setReason(record.absence_reason || '');
            setShowReasonModal(true);
        }
    };

    const closeReasonModal = () => {
        setShowReasonModal(false);
        setSelectedRecord(null);
        setReason('');
    };

    // Calculate statistics
    const presentCount = attendance.filter(r => r.status === 'PRESENT').length;
    const absentCount = attendance.filter(r => r.status === 'ABSENT').length;
    const totalDays = attendance.length;
    const attendanceRate = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(1) : 0;

    // Get calendar days for the selected month
    const getCalendarDays = () => {
        const [year, month] = selectedMonth.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        const start = startOfMonth(date);
        const end = endOfMonth(date);
        return eachDayOfInterval({ start, end });
    };

    const getAttendanceForDate = (date) => {
        return attendance.find(r => isSameDay(new Date(r.date), date));
    };

    const calendarDays = getCalendarDays();

    return (
        <div className="min-h-screen p-6 animate-fade-in">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 animate-slide-up flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">
                            <span className="gradient-text">Welcome, {user?.first_name || user?.username}</span>
                        </h1>
                        <p className="text-gray-600">View your attendance records and manage absence reasons</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="card-modern p-6 card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Days</p>
                                <p className="text-3xl font-bold text-gray-900">{totalDays}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <CalendarIcon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="card-modern p-6 card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Present</p>
                                <p className="text-3xl font-bold text-green-600">{presentCount}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                <CheckCircle2 className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="card-modern p-6 card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Absent</p>
                                <p className="text-3xl font-bold text-red-600">{absentCount}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                                <XCircle className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="card-modern p-6 card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Attendance Rate</p>
                                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{attendanceRate}%</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Month Selector */}
                <div className="glass-card rounded-2xl p-6 mb-8 shadow-xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <CalendarIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Select Month</label>
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-200 bg-white"
                                />
                            </div>
                        </div>
                        {msg && (
                            <div className={`px-4 py-2 rounded-xl font-medium animate-fade-in ${msg.includes('Error') || msg.includes('Failed')
                                ? 'bg-red-50 text-red-700 border-2 border-red-200'
                                : 'bg-green-50 text-green-700 border-2 border-green-200'
                                }`}>
                                {msg}
                            </div>
                        )}
                    </div>
                </div>

                {/* Calendar View */}
                {loading ? (
                    <div className="glass-card rounded-2xl p-12 text-center shadow-xl animate-pulse">
                        <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading attendance...</p>
                    </div>
                ) : (
                    <div className="glass-card rounded-2xl p-6 shadow-xl animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <h2 className="text-2xl font-bold mb-6 gradient-text">Attendance Calendar</h2>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-2">
                            {/* Day headers */}
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center font-semibold text-gray-600 py-2">
                                    {day}
                                </div>
                            ))}

                            {/* Empty cells for days before month starts */}
                            {Array.from({ length: calendarDays[0].getDay() }).map((_, i) => (
                                <div key={`empty-${i}`} className="aspect-square"></div>
                            ))}

                            {/* Calendar days */}
                            {calendarDays.map((day, index) => {
                                const record = getAttendanceForDate(day);
                                const isPresent = record?.status === 'PRESENT';
                                const isAbsent = record?.status === 'ABSENT';

                                return (
                                    <div
                                        key={index}
                                        onClick={() => record && openReasonModal(record)}
                                        className={`aspect-square rounded-xl p-2 flex flex-col items-center justify-center transition-all duration-200 ${isPresent ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-500 cursor-default' :
                                            isAbsent ? 'bg-gradient-to-br from-red-100 to-rose-100 border-2 border-red-500 cursor-pointer hover:shadow-lg hover:scale-105' :
                                                'bg-gray-50 border border-gray-200'
                                            }`}
                                    >
                                        <span className={`text-sm font-semibold ${isPresent ? 'text-green-700' :
                                            isAbsent ? 'text-red-700' :
                                                'text-gray-500'
                                            }`}>
                                            {format(day, 'd')}
                                        </span>
                                        {isPresent && <CheckCircle2 className="w-4 h-4 text-green-600 mt-1" />}
                                        {isAbsent && (
                                            <div className="flex flex-col items-center">
                                                <XCircle className="w-4 h-4 text-red-600 mt-1" />
                                                {record.absence_reason && (
                                                    <MessageSquare className="w-3 h-3 text-red-500 mt-0.5" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-500"></div>
                                <span className="text-gray-600">Present</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-gradient-to-br from-red-100 to-rose-100 border-2 border-red-500"></div>
                                <span className="text-gray-600">Absent (click to add reason)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-gray-50 border border-gray-200"></div>
                                <span className="text-gray-600">No record</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Absence Reason Modal */}
            {showReasonModal && selectedRecord && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="glass-card rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-scale-in">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold gradient-text">Absence Reason</h3>
                            <button
                                onClick={closeReasonModal}
                                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-600 mb-2">
                                Date: <span className="font-semibold text-gray-900">{format(new Date(selectedRecord.date), 'MMMM d, yyyy')}</span>
                            </p>
                            <p className="text-sm text-gray-600 mb-4">
                                Status: <span className="font-semibold text-red-600">Absent</span>
                            </p>

                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Reason for Absence
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="input-modern min-h-[120px] resize-none"
                                placeholder="Enter the reason for your absence..."
                                disabled={saving}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={closeReasonModal}
                                className="flex-1 px-6 py-2.5 rounded-xl font-semibold border-2 border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200"
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateReason}
                                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Reason'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
