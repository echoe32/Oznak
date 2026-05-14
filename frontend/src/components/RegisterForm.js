import React, { useState } from 'react';
import { registerUser } from '../services/api';

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}$/;

const RegisterForm = ({ onRegistered }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [strength, setStrength] = useState({length: false, upper: false, lower: false, numOrSpec: false});
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const emailLooksValid = EMAIL_PATTERN.test(email.trim());

    const validatePassword = (value) => {
        setPassword(value);
        setError('');
        setStrength({
            length: value.length >= 8,
            upper: /[A-Z]/.test(value),
            lower: /[a-z]/.test(value),
            numOrSpec: /[0-9!@#$%^&*]/.test(value)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!emailLooksValid) {
            setError('Please enter a valid email address.');
            return;
        }
        setIsSubmitting(true);
        try {
            await registerUser(email, password);
            if (onRegistered) {
                onRegistered(email);
            }
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-100 p-8 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-2xl text-slate-800 mb-6">Создать аккаунт</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    maxLength={254}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                    }}
                    className="w-full mb-4 p-2 border rounded bg-slate-50 text-slate-900"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    maxLength={128}
                    onChange={(e) => validatePassword(e.target.value)}
                    className="w-full mb-2 p-2 border rounded bg-slate-50 text-slate-900"
                />

                <div className="text-sm mb-4">
                    <p className={strength.length ? "text-emerald-500" : "text-slate-500"}>✓ At least 8 characters</p>
                    <p className={strength.upper ? "text-emerald-500" : "text-slate-500"}>✓ One uppercase letter</p>
                    <p className={strength.lower ? "text-emerald-500" : "text-slate-500"}>✓ One lowercase letter</p>
                    <p className={strength.numOrSpec ? "text-emerald-500" : "text-slate-500"}>✓ One number or symbol</p>
                </div>
                {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

                <button
                    type="submit"
                    disabled={!Object.values(strength).every(Boolean) || !email || !emailLooksValid || isSubmitting}
                    className="w-full bg-slate-700 text-white p-2 rounded hover:bg-slate-600 transition disabled:bg-slate-400"
                >
                    {isSubmitting ? 'Регистрируем...' : 'Зарегистрироваться'}
                </button>
            </form>
        </div>
    );
}
export default RegisterForm;