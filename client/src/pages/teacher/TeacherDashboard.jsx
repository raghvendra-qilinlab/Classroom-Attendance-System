import React, { useState, useEffect } from 'react';
import api from '../../api';
import { format } from 'date-fns';
import { Save, Calendar, Users, CheckCircle2, XCircle, LogOut, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Get all students
                const studentsRes = await api.get('/teacher/students/');
                const studentList = studentsRes.data;
                setStudents(studentList);

                // 2. Get attendance for the date
                const attRes = await api.get(`/teacher/attendance/?date=${date}`);
                const attMap = {};

                // Initialize with PRESENT default for all students if no record exists
                studentList.forEach(s => {
                    attMap[s.id] = 'PRESENT';
                });

                // Override with existing records
                attRes.data.forEach(r => {
                    attMap[r.student] = r.status;
                });

                setAttendance(attMap);
            } catch (err) {
                console.error("Failed to fetch data", err);
                setMsg('Error loading data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [date]);

    const handleStatusChange = (studentId, status) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMsg('');
        try {
            const records = Object.keys(attendance).map(studentId => ({
                student_id: studentId,
                status: attendance[studentId]
            }));

            await api.post('/teacher/attendance/mark/', {
                date,
                records
            });
            setMsg('Attendance saved successfully!');
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            console.error(err);
            setMsg('Failed to save attendance.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Calculate statistics
    const presentCount = Object.values(attendance).filter(status => status === 'PRESENT').length;
    const absentCount = Object.values(attendance).filter(status => status === 'ABSENT').length;
    const totalStudents = students.length;
    const attendanceRate = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0;

    return (
        <div className="min-h-screen p-6 animate-fade-in">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between animate-slide-up">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">
                            <span className="gradient-text">Daily Attendance</span>
                        </h1>
                        <p className="text-gray-600">Track and manage student attendance efficiently</p>
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
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Students</p>
                                <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <Users className="w-6 h-6 text-white" />
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

                {/* Controls Card */}
                <div className="glass-card rounded-2xl p-6 mb-8 shadow-xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Select Date</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-200 bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {msg && (
                                <div className={`px-4 py-2 rounded-xl font-medium animate-fade-in ${msg.includes('Error') || msg.includes('Failed')
                                        ? 'bg-red-50 text-red-700 border-2 border-red-200'
                                        : 'bg-green-50 text-green-700 border-2 border-green-200'
                                    }`}>
                                    {msg}
                                </div>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-5 h-5" />
                                {saving ? 'Saving...' : 'Save Attendance'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Attendance Table */}
                {loading ? (
                    <div className="glass-card rounded-2xl p-12 text-center shadow-xl animate-pulse">
                        <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading students...</p>
                    </div>
                ) : (
                    <div className="glass-card rounded-2xl shadow-xl overflow-hidden animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Student Name</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Username</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {students.map((student, index) => (
                                        <tr
                                            key={student.id}
                                            className="hover:bg-purple-50/50 transition-colors duration-200 animate-fade-in"
                                            style={{ animationDelay: `${0.05 * index}s` }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
                                                        {(student.first_name || student.username).charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">
                                                            {student.first_name || student.username} {student.last_name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                {student.username}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex justify-center gap-3">
                                                    <button
                                                        onClick={() => handleStatusChange(student.id, 'PRESENT')}
                                                        className={attendance[student.id] === 'PRESENT' ? 'btn-success' : 'badge-present-inactive'}
                                                    >
                                                        <CheckCircle2 className="w-4 h-4 inline mr-1" />
                                                        Present
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(student.id, 'ABSENT')}
                                                        className={attendance[student.id] === 'ABSENT' ? 'btn-danger' : 'badge-absent-inactive'}
                                                    >
                                                        <XCircle className="w-4 h-4 inline mr-1" />
                                                        Absent
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;
