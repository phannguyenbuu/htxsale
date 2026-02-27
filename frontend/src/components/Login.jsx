import React, { useState } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 100%);
`;

const LoginBox = styled.div`
  width: 90%;
  max-width: 400px;
  padding: 40px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  text-align: center;
`;

const Title = styled.h2`
  color: #fff;
  margin-bottom: 30px;
  font-weight: 300;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-shadow: 0 0 10px #00ffff;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 8px;
  &:focus {
    border-color: #00ffff;
    box-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
    outline: none;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 20px;
  background: linear-gradient(45deg, #00ffff, #00cccc);
  border: none;
  border-radius: 8px;
  color: #000;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  &:hover {
    box-shadow: 0 0 15px #00ffff;
    transform: translateY(-2px);
  }
`;

const QRButton = styled(Button)`
  background: linear-gradient(45deg, #ff00ff, #cc00cc);
  margin-top: 10px;
  &:hover {
    box-shadow: 0 0 15px #ff00ff;
  }
`;

const ErrorMsg = styled.p`
  color: #ff4d4d;
  margin-top: 10px;
`;

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await axios.post('/api/login', { username, password });
      onLogin(res.data);
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  const startScanner = () => {
    setScanning(true);
    // Give time for modal to render
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "reader", 
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      scanner.render(onScanSuccess, onScanFailure);
      
      function onScanSuccess(decodedText, decodedResult) {
        scanner.clear();
        setScanning(false);
        handleQRLogin(decodedText);
      }
      
      function onScanFailure(error) {
        // handle scan failure, usually better to ignore and keep scanning.
        // console.warn(`Code scan error = ${error}`);
      }
    }, 100);
  };

  const handleQRLogin = async (token) => {
      try {
          const res = await axios.post('/api/login/qr', { token });
          onLogin(res.data);
      } catch (err) {
          setError('Invalid QR Token');
      }
  };

  return (
    <Container>
      <LoginBox>
        <Title>HTX Sale Login</Title>
        {!scanning ? (
          <>
            <Input 
              type="text" 
              placeholder="Username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
            <Input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <Button onClick={handleLogin}>Login</Button>
            <QRButton onClick={startScanner}>Scan QR</QRButton>
            {error && <ErrorMsg>{error}</ErrorMsg>}
          </>
        ) : (
          <div style={{color: 'white'}}>
            <div id="reader" width="300px"></div>
            <Button onClick={() => window.location.reload()} style={{background: '#333', color: 'white'}}>Cancel</Button>
          </div>
        )}
      </LoginBox>
    </Container>
  );
}

export default Login;
