import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/common/Header';
import '../styles/Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    setCredentials({
      username: '',
      password: ''
    });
  }, []);

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  try {
    const result = await login(credentials.username, credentials.password); // ✅ await

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  } catch (err) {
    setError('Network error');
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="login-container">
      <Header />
      <div className="login-content">
        <div className="login-left-panel">
          <h1 className="login-title">CityTraffic & Pollution Analytics</h1>
          <p className="login-description">
            Advanced monitoring system for urban traffic patterns, vehicle emissions, 
            and real-time air quality metrics across municipal zones.
            <br/><br/>
            Monitor pollution levels, traffic flow, and environmental impact in real-time.
          </p>
        </div>
        
        <div className="login-right-panel">
          <div className="login-form-container">
            <div className="login-form-header">
              <div className="system-status-indicator"></div>
              <h2>Municipal System Access</h2>
            </div>
            <form onSubmit={handleSubmit} className="login-form">
              {error && <div className="login-error">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="username">Municipal ID</label>
                <input
                  type="text"
                  id="username"
                  placeholder="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Security Key</label>
                <input
                  type="password"
                  id="password"
                  placeholder="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying Credentials...' : 'Access Dashboard'}
              </button>
            
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;