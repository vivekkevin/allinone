import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Use the correct API URL based on environment
    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000'
        : 'http://193.203.163.244';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Registration failed');
            }

            const data = await response.json();
            console.log('Registration successful:', data);
            navigate('/login'); // Redirect to login page after successful registration
        } catch (error) {
            console.error('Registration error:', error);
            setError(error.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="register-container">
            <form onSubmit={handleSubmit}>
                <h1>Register</h1>
                {error && <div className="error-message">{error}</div>}
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;