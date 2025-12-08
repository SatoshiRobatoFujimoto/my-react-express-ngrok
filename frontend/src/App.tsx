import { useState, useEffect } from 'react'
import './App.css'

interface HealthResponse {
  status: string;
  timestamp: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // ページ読み込み時に認証状態を確認
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // ログイン処理
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${apiBaseUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('認証に失敗しました。ユーザー名とパスワードを確認してください。');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // トークンのみを保存（パスワードは保存しない）
      localStorage.setItem('token', data.token);
      setIsAuthenticated(true);
      // パスワードをクリア
      setPassword('');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'ログインに失敗しました');
    } finally {
      setLoginLoading(false);
    }
  };

  // ログアウト処理
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setHealthData(null);
    setError(null);
  };

  // Health APIを呼び出す
  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        handleLogout();
        throw new Error('認証トークンが見つかりません。再度ログインしてください。');
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${apiBaseUrl}/api/health`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleLogout();
          throw new Error('認証に失敗しました。再度ログインしてください。');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: HealthResponse = await response.json();
      setHealthData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  };

  // ログインページ
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '3rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '420px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#667eea',
              borderRadius: '16px',
              margin: '0 auto 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem'
            }}>
              🔐
            </div>
            <h1 style={{
              margin: 0,
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#1a202c',
              marginBottom: '0.5rem'
            }}>
              ログイン
            </h1>
            <p style={{
              margin: 0,
              color: '#718096',
              fontSize: '0.9rem'
            }}>
              ダッシュボードにアクセス
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#2d3748',
                fontSize: '0.9rem'
              }}>
                ユーザー名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="ユーザー名を入力"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  fontSize: '1rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#2d3748',
                fontSize: '0.9rem'
              }}>
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="パスワードを入力"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  fontSize: '1rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              />
            </div>

            {loginError && (
              <div style={{
                padding: '0.875rem',
                backgroundColor: '#fed7d7',
                color: '#c53030',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                border: '1px solid #fc8181'
              }}>
                {loginError}
              </div>
            )}

            <button 
              type="submit"
              disabled={loginLoading}
              style={{
                width: '100%',
                padding: '0.875rem',
                fontSize: '1rem',
                fontWeight: '600',
                background: loginLoading 
                  ? '#a0aec0' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loginLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: loginLoading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}
              onMouseOver={(e) => {
                if (!loginLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                }
              }}
              onMouseOut={(e) => {
                if (!loginLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }
              }}
            >
              {loginLoading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ダッシュボード
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f7fafc'
    }}>
      {/* ヘッダー */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '1.25rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            📊
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '700'
          }}>
            Health API Dashboard
          </h1>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.625rem 1.25rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            backdropFilter: 'blur(10px)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
          }}
        >
          ログアウト
        </button>
      </header>

      {/* メインコンテンツ */}
      <main style={{
        padding: '2rem',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* 統計カード */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div>
                <p style={{
                  margin: 0,
                  color: '#718096',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.25rem'
                }}>
                  API Status
                </p>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: healthData ? '#48bb78' : '#a0aec0'
                }}>
                  {healthData ? '🟢 Online' : '⚪ Offline'}
                </h3>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: healthData ? '#c6f6d5' : '#edf2f7',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                {healthData ? '✅' : '⏸️'}
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div>
                <p style={{
                  margin: 0,
                  color: '#718096',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.25rem'
                }}>
                  Last Check
                </p>
                <h3 style={{
                  margin: 0,
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#2d3748'
                }}>
                  {healthData 
                    ? new Date(healthData.timestamp).toLocaleString('ja-JP')
                    : '未実行'
                  }
                </h3>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#e6fffa',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                🕐
              </div>
            </div>
          </div>
        </div>

        {/* メインカード */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1a202c',
                marginBottom: '0.5rem'
              }}>
                Health Check
              </h2>
              <p style={{
                margin: 0,
                color: '#718096',
                fontSize: '0.9rem'
              }}>
                APIの状態を確認します
              </p>
            </div>
            <button 
              onClick={fetchHealth} 
              disabled={loading}
              style={{
                padding: '0.875rem 1.75rem',
                fontSize: '1rem',
                fontWeight: '600',
                background: loading
                  ? '#a0aec0'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }
              }}
            >
              {loading ? (
                <>
                  <span>⏳</span>
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <span>🔍</span>
                  <span>Check Health</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div style={{
              padding: '1.25rem',
              backgroundColor: '#fed7d7',
              color: '#c53030',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              border: '1px solid #fc8181',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>⚠️</span>
              <div>
                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>エラー</strong>
                <span style={{ fontSize: '0.9rem' }}>{error}</span>
              </div>
            </div>
          )}

          {healthData && (
            <div style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%)',
              borderRadius: '12px',
              border: '1px solid #68d391'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  ✅
                </div>
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#22543d',
                    marginBottom: '0.25rem'
                  }}>
                    System Healthy
                  </h3>
                  <p style={{
                    margin: 0,
                    color: '#2f855a',
                    fontSize: '0.9rem'
                  }}>
                    APIは正常に動作しています
                  </p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginTop: '1.5rem'
              }}>
                <div style={{
                  backgroundColor: 'white',
                  padding: '1rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <p style={{
                    margin: 0,
                    color: '#718096',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>
                    Status
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    color: '#22543d'
                  }}>
                    {healthData.status}
                  </p>
                </div>
                <div style={{
                  backgroundColor: 'white',
                  padding: '1rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <p style={{
                    margin: 0,
                    color: '#718096',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>
                    Timestamp
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    color: '#22543d'
                  }}>
                    {new Date(healthData.timestamp).toLocaleString('ja-JP')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!healthData && !error && !loading && (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              color: '#a0aec0'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📡</div>
              <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>
                Health Checkを実行してください
              </p>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
                上記のボタンをクリックしてAPIの状態を確認します
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
