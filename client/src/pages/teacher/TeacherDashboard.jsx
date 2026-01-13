import React, { useState, useEffect } from 'react';
import api from '../../api';
import { format } from 'date-fns';
import { Save, Calendar } from 'lucide-react';

const TeacherDashboard = () => {
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

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

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Daily Attendance</h1>

            <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center gap-4">
                    <label className="font-semibold text-gray-700 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Select Date:
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                {msg && (
                    <span className={`px-4 py-2 rounded ${msg.includes('Error') || msg.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {msg}
                    </span>
                )}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Attendance'}
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {students.map(student => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                        {student.first_name || student.username} {student.last_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {student.username}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleStatusChange(student.id, 'PRESENT')}
                                                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${attendance[student.id] === 'PRESENT'
                                                        ? 'bg-green-100 text-green-800 border-2 border-green-500'
                                                        : 'bg-gray-100 text-gray-500 border border-transparent hover:bg-gray-200'
                                                    }`}
                                            >
                                                Present
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(student.id, 'ABSENT')}
                                                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${attendance[student.id] === 'ABSENT'
                                                        ? 'bg-red-100 text-red-800 border-2 border-red-500'
                                                        : 'bg-gray-100 text-gray-500 border border-transparent hover:bg-gray-200'
                                                    }`}
                                            >
                                                Absent
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;
