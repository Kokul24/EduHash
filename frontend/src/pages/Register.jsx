import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student', studentId: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/auth/register', formData);
            navigate('/login');
        } catch (err) {
            alert('Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050510] text-white">
            <div className="w-full max-w-md p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input className="w-full bg-[#0f172a] border border-gray-700 rounded px-4 py-3" placeholder="Full Name" onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    <input className="w-full bg-[#0f172a] border border-gray-700 rounded px-4 py-3" placeholder="Email" type="email" onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    <input className="w-full bg-[#0f172a] border border-gray-700 rounded px-4 py-3" placeholder="Password" type="password" onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    <input className="w-full bg-[#0f172a] border border-gray-700 rounded px-4 py-3" placeholder="Student ID (Optional)" onChange={e => setFormData({ ...formData, studentId: e.target.value })} />

                    {/* Role selection removed - Defaults to Student */}
                    <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded text-sm text-blue-300">
                        <p>ℹ️ Creating a Student Account</p>
                    </div>

                    <button className="w-full py-3 rounded bg-blue-600 hover:bg-blue-500 font-bold">Register</button>
                </form>
                <p className="mt-4 text-center text-gray-500 text-sm">
                    Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
