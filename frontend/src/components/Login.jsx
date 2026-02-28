import React, { useState } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import styled from 'styled-components';
import { FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5; /* Light grey background */
`;

const LoginBox = styled.div`
  width: 80%;
  max-width: 380px; /* Reduced width to feel more compact */
  padding: 40px;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05); /* Soft shadow, no harsh borders */
  text-align: center;
`;

const Title = styled.h2`
  color: #212529;
  margin-bottom: 30px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px;
  margin: 12px 0;
  background: #f8f9fa;
  border: 1px solid #ced4da;
  color: #495057;
  border-radius: 10px;
  transition: all 0.3s ease;
  &:focus {
    border-color: #007bff;
    background: #fff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    outline: none;
  }
`;

const InputWrap = styled.div`
  position: relative;
  width: 100%;
`;

const InputWithIcon = styled(Input)`
  padding-right: 42px;
`;

const InputIconBtn = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #6b7280;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  margin-top: 24px;
  background: #007bff;
  border: none;
  border-radius: 10px;
  color: #fff;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    background: #0056b3;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  }
`;

const QRButton = styled(Button)`
  background: #6c757d;
  margin-top: 12px;
  &:hover {
    background: #5a6268;
    box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
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
  const [showPassword, setShowPassword] = useState(false);

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
            <InputWrap>
              <InputWithIcon
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {username && (
                <InputIconBtn type="button" onClick={() => setUsername('')} title="Xóa nhanh">
                  <FaTimes />
                </InputIconBtn>
              )}
            </InputWrap>
            <InputWrap>
              <InputWithIcon
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputIconBtn
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </InputIconBtn>
            </InputWrap>
            <Button onClick={handleLogin}>Login</Button>
            <QRButton onClick={startScanner}>Scan QR</QRButton>
            {error && <ErrorMsg>{error}</ErrorMsg>}
          </>
        ) : (
          <div style={{ color: '#333' }}>
            <div id="reader" style={{ width: '100%', marginBottom: '20px' }}></div>
            <Button onClick={() => window.location.reload()} style={{ background: '#dc3545', color: 'white' }}>Cancel</Button>
          </div>
        )}
      </LoginBox>
    </Container>
  );
}

export default Login;
