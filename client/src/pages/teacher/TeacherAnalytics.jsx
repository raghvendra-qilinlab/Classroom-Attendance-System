import React, { useState, useEffect } from 'react';
import api from '../../api';
import { format, eachDayOfInterval, endOfMonth, startOfMonth, isSameDay } from 'date-fns';
import { BarChart3, Users, Calendar, TrendingUp, User, ArrowLeft, ArrowRight, Download, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeacherAnalytics = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('class'); // 'class' or 'student'
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [loading, setLoading] = useState(false);

    // Class Data
    const [classStats, setClassStats] = useState(null);

    // Student Data
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [studentStats, setStudentStats] = useState(null);

    // Fetch initial data
    useEffect(() => {
        fetchStudents();
    }, []);

    // Fetch class data when tab is 'class' or month changes
    useEffect(() => {
        if (activeTab === 'class') {
            fetchClassAnalytics();
        }
    }, [selectedMonth, activeTab]);

    // Fetch student data when tab is 'student', month changes, or student changes
    useEffect(() => {
        if (activeTab === 'student' && selectedStudent) {
            fetchStudentAnalytics();
        }
    }, [selectedMonth, activeTab, selectedStudent]);

    const fetchStudents = async () => {
        try {
            const res = await api.get('/teacher/students/');
            setStudents(res.data);
            if (res.data.length > 0 && !selectedStudent) {
                setSelectedStudent(res.data[0].id);
            }
        } catch (err) {
            console.error("Failed to fetch students", err);
        }
    };

    const fetchClassAnalytics = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/teacher/analytics/class/?month=${selectedMonth}`);
            setClassStats(res.data);
        } catch (err) {
            console.error("Failed to fetch class analytics", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentAnalytics = async () => {
        if (!selectedStudent) return;
        setLoading(true);
        try {
            const res = await api.get(`/teacher/analytics/student/?month=${selectedMonth}&student_id=${selectedStudent}`);
            setStudentStats(res.data);
        } catch (err) {
            console.error("Failed to fetch student analytics", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-6 animate-fade-in bg-gray-50/50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            <span className="gradient-text">Attendance Analytics</span>
                        </h1>
                        <p className="text-gray-600">Detailed insights into class and student performance</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/teacher')}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </button>
                    </div>
                </div>

                {/* Tabs & Filters */}
                <div className="glass-card rounded-2xl p-4 mb-8 shadow-sm">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex bg-gray-100/50 p-1 rounded-xl w-full md:w-auto">
                            <button
                                onClick={() => setActiveTab('class')}
                                className={`flex-1 md:w-32 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'class'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <BarChart3 className="w-4 h-4" />
                                Class Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('student')}
                                className={`flex-1 md:w-32 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'student'
                                    ? 'bg-white text-purple-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <User className="w-4 h-4" />
                                Student Report
                            </button>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            {activeTab === 'student' && (
                                <div className="relative flex-1 md:w-64">
                                    <select
                                        value={selectedStudent}
                                        onChange={(e) => setSelectedStudent(e.target.value)}
                                        className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-xl appearance-none bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                                    >
                                        <option value="">Select Student</option>
                                        {students.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.first_name} {s.last_name} ({s.username})
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        <User className="w-4 h-4" />
                                    </div>
                                </div>
                            )}

                            <div className="relative">
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading analytics...</p>
                    </div>
                ) : (
                    <>
                        {/* CLASS ANALYTICS VIEW */}
                        {activeTab === 'class' && classStats && (
                            <div className="space-y-6 animate-slide-up">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="card-modern p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-full">Monthly Avg</span>
                                        </div>
                                        <h3 className="text-gray-500 text-sm font-medium mb-1">Attendance Rate</h3>
                                        <p className="text-3xl font-bold text-gray-900">{classStats.overview.attendance_rate}%</p>
                                    </div>

                                    <div className="card-modern p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                                                <Users className="w-5 h-5 text-green-600" />
                                            </div>
                                            <span className="text-xs font-semibold px-2 py-1 bg-green-50 text-green-700 rounded-full">Total</span>
                                        </div>
                                        <h3 className="text-gray-500 text-sm font-medium mb-1">Present Count</h3>
                                        <p className="text-3xl font-bold text-gray-900">{classStats.overview.present}</p>
                                    </div>

                                    <div className="card-modern p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                                                <Calendar className="w-5 h-5 text-red-600" />
                                            </div>
                                            <span className="text-xs font-semibold px-2 py-1 bg-red-50 text-red-700 rounded-full">Total</span>
                                        </div>
                                        <h3 className="text-gray-500 text-sm font-medium mb-1">Absent Count</h3>
                                        <p className="text-3xl font-bold text-gray-900">{classStats.overview.absent}</p>
                                    </div>
                                </div>

                                {/* Daily Breakdown Table */}
                                <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
                                    <div className="p-6 border-b border-gray-100">
                                        <h3 className="text-lg font-bold text-gray-900">Daily Attendance Breakdown</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50/50">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendance Rate</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Present</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Absent</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 bg-white">
                                                {classStats.daily.map((day) => (
                                                    <tr key={day.date} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {format(new Date(day.date), 'MMM d, yyyy')}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full ${day.rate >= 90 ? 'bg-green-500' : day.rate >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                                        style={{ width: `${day.rate}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="font-medium">{day.rate}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                                            {day.present}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                                            {day.absent}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${day.rate >= 90 ? 'bg-green-100 text-green-800' :
                                                                day.rate >= 75 ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-red-100 text-red-800'
                                                                }`}>
                                                                {day.rate >= 90 ? 'Excellent' : day.rate >= 75 ? 'Good' : 'Needs Attention'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {classStats.daily.length === 0 && (
                                                    <tr>
                                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                            No attendance records found for this month.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STUDENT ANALYTICS VIEW */}
                        {activeTab === 'student' && studentStats && (
                            <div className="space-y-6 animate-slide-up">
                                {/* Student Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="card-modern p-6 col-span-1 md:col-span-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                                                {students.find(s => s.id == selectedStudent)?.first_name[0]}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold">
                                                    {students.find(s => s.id == selectedStudent)?.first_name} {students.find(s => s.id == selectedStudent)?.last_name}
                                                </h2>
                                                <p className="text-white/80">{students.find(s => s.id == selectedStudent)?.username}</p>
                                            </div>
                                            <div className="ml-auto text-right hidden md:block">
                                                <p className="text-white/60 text-sm lowercase">Attendance Rate</p>
                                                <p className="text-4xl font-bold">{studentStats.stats.rate}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-modern p-6">
                                        <p className="text-gray-500 text-sm font-medium mb-1">Total Days</p>
                                        <p className="text-3xl font-bold text-gray-900">{studentStats.stats.total}</p>
                                    </div>
                                    <div className="card-modern p-6">
                                        <p className="text-gray-500 text-sm font-medium mb-1">Days Present</p>
                                        <p className="text-3xl font-bold text-green-600">{studentStats.stats.present}</p>
                                    </div>
                                    <div className="card-modern p-6">
                                        <p className="text-gray-500 text-sm font-medium mb-1">Days Absent</p>
                                        <p className="text-3xl font-bold text-red-600">{studentStats.stats.absent}</p>
                                    </div>
                                    <div className="card-modern p-6 md:hidden">
                                        <p className="text-gray-500 text-sm font-medium mb-1">Rate</p>
                                        <p className="text-3xl font-bold text-purple-600">{studentStats.stats.rate}%</p>
                                    </div>
                                </div>

                                {/* Absences List */}
                                <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                        <h3 className="text-lg font-bold text-gray-900">Absence History</h3>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {studentStats.absences.length > 0 ? (
                                            studentStats.absences.map((record) => (
                                                <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                                                            <Calendar className="w-5 h-5 text-red-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">
                                                                {format(new Date(record.date), 'EEEE, MMMM d, yyyy')}
                                                            </p>
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                                                                Absent
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 max-w-2xl">
                                                        {record.absence_reason ? (
                                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Reason Provided:</p>
                                                                <p className="text-gray-700 text-sm">{record.absence_reason}</p>
                                                            </div>
                                                        ) : (
                                                            <div className="text-gray-400 text-sm italic flex items-center gap-2">
                                                                No reason provided
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-12 text-center text-gray-500">
                                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                                                </div>
                                                <p className="font-medium text-lg">Perfect Attendance!</p>
                                                <p className="text-sm">No absences recorded for this month.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// Need access to CheckCircle2 which was missed in import? No, I added it in lucide-react import but missed it in component if I used it.
// I see CheckCircle2 usage. Let me check imports.
// imports: BarChart3, Users, Calendar, TrendingUp, User, ArrowLeft, ArrowRight, Download
// I missed CheckCircle2 in imports. Correcting it.

export default TeacherAnalytics;
