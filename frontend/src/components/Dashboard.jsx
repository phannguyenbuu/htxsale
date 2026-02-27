import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FaSignOutAlt, FaFileExport, FaSave } from 'react-icons/fa';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #0d0d1a;
  overflow-y: auto;
  padding-bottom: 60px;
  max-width: 480px;
  margin: 0 auto;
  border-left: 1px solid #333;
  border-right: 1px solid #333;
`;

const Header = styled.header`
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Title = styled.h1`
  font-size: 1.2rem;
  margin: 0;
  color: #00ffff;
  text-shadow: 0 0 5px #00ffff;
`;

const FormContainer = styled.div`
  padding: 20px;
  flex: 1;
`;

const SectionTitle = styled.h3`
  color: #ff00ff;
  border-bottom: 1px solid #ff00ff;
  padding-bottom: 5px;
  margin-top: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  color: #ccc;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #444;
  color: #fff;
  border-radius: 5px;
  &:focus {
    border-color: #00ffff;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #444;
  color: #fff;
  border-radius: 5px;
  &:focus {
    border-color: #00ffff;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #444;
  color: #fff;
  border-radius: 5px;
  min-height: 80px;
  &:focus {
    border-color: #00ffff;
  }
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 12px;
  background: linear-gradient(45deg, #00ffff, #00cccc);
  color: #000;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const LogoutButton = styled.button`
  background: transparent;
  border: 1px solid #ff4d4d;
  color: #ff4d4d;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.8rem;
`;

const BillPreview = styled.div`
  margin-top: 20px;
  background: #fff;
  padding: 10px;
  border-radius: 5px;
  color: #000;
  text-align: center;
`;

function Dashboard({ user, onLogout }) {
  const [htxList, setHtxList] = useState([]);
  const [formData, setFormData] = useState({
    htx: '',
    driver_name: '',
    license_plate: '',
    phone: '',
    details: ''
  });
  const [lastOrder, setLastOrder] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch HTX list
    axios.get('/api/htx_list').then(res => {
      setHtxList(res.data);
      if (res.data.length > 0) setFormData(prev => ({ ...prev, htx: res.data[0] }));
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Autofill Logic
    if (['license_plate', 'phone', 'driver_name'].includes(name) && value.length > 3) {
      // Debounce call could be better, but for simplicity:
      axios.get(`/api/search_driver?${name}=${value}`).then(res => {
        if (res.data.length > 0) {
          const match = res.data[0];
          // Only autofill empty fields to avoid overwriting user intent
          setFormData(prev => ({
            ...prev,
            driver_name: prev.driver_name || match.name,
            license_plate: prev.license_plate || match.license_plate,
            phone: prev.phone || match.phone
          }));
        }
      });
    }
  };

  const handleUpBill = async () => {
    try {
      const res = await axios.post('/api/up_bill', formData);
      setLastOrder(res.data.order_id);
      setMessage('Bill Uploaded Successfully!');
      // Reset form (keep HTX maybe)
      setFormData(prev => ({ ...prev, driver_name: '', license_plate: '', phone: '', details: '' }));
    } catch (err) {
      setMessage('Error uploading bill.');
    }
  };

  const handleExportBill = () => {
    if (lastOrder) {
      window.open(`/api/export_bill/${lastOrder}`, '_blank');
    }
  };

  return (
    <DashboardContainer>
      <Header>
        <Title>HTX Sale</Title>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <span style={{fontSize: '0.8rem', color: '#aaa'}}>{user.username}</span>
            <LogoutButton onClick={onLogout}><FaSignOutAlt /></LogoutButton>
        </div>
      </Header>

      <FormContainer>
        {message && <p style={{color: '#00ffff'}}>{message}</p>}
        
        <SectionTitle>Create Order</SectionTitle>
        
        <FormGroup>
          <Label>HTX</Label>
          <Select name="htx" value={formData.htx} onChange={handleChange}>
            {htxList.map(htx => (
              <option key={htx} value={htx}>{htx}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>License Plate</Label>
          <Input name="license_plate" value={formData.license_plate} onChange={handleChange} placeholder="59A-123.45" />
        </FormGroup>

        <FormGroup>
          <Label>Driver Name</Label>
          <Input name="driver_name" value={formData.driver_name} onChange={handleChange} placeholder="Nguyen Van A" />
        </FormGroup>

        <FormGroup>
          <Label>Phone</Label>
          <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="0909123456" />
        </FormGroup>

        <FormGroup>
          <Label>Order Details</Label>
          <TextArea name="details" value={formData.details} onChange={handleChange} placeholder="Item list..." />
        </FormGroup>

        <ActionButton onClick={handleUpBill}>
          <FaSave /> Up Bill
        </ActionButton>

        {lastOrder && (
          <ActionButton onClick={handleExportBill} style={{background: 'linear-gradient(45deg, #ff00ff, #cc00cc)', color: 'white'}}>
            <FaFileExport /> Export Bill (PNG)
          </ActionButton>
        )}

      </FormContainer>
    </DashboardContainer>
  );
}

export default Dashboard;
