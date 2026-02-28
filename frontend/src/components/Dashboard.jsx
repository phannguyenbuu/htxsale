import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FaSignOutAlt, FaFileExport, FaSave, FaPlus, FaMinus, FaDiceD6, FaIdCard, FaTshirt } from 'react-icons/fa';
import { MdCheckCircle } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f5f5f7;
  overflow-y: auto;
  padding-bottom: 60px;
  max-width: 480px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
`;

const BlueTopSection = styled.section`
  margin: 10px 10px 0;
  border-radius: 22px;
  overflow: hidden;
  background: linear-gradient(145deg, #08254e 0%, #0d3f78 100%);
  color: #fff;
`;

const TopContent = styled.div`
  padding: 10px 12px 8px;
`;

const Header = styled.header`
  padding: 15px;
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.22);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderCenterBtn = styled.button`
  border: 1px solid rgba(255, 255, 255, 0.32);
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
`;

const Title = styled.h1`
  font-size: 1.25rem;
  margin: 0;
  color: #ffffff;
  font-weight: 700;
`;

const FormContainer = styled.div`
  padding: 12px;
  flex: 1;
`;

const SectionTitle = styled.h3`
  color: #333;
  border-bottom: 2px solid #0066cc;
  padding-bottom: 6px;
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 1.1rem;
  font-weight: 600;
`;

const FormGroup = styled.div`
  margin-bottom: 10px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 4px;
  color: #555;
  font-size: 0.95rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #d1d1d6;
  color: #1c1c1e;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.2s;
  &:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #d1d1d6;
  color: #1c1c1e;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  &:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }
  option {
    background: #0d3f78;
    color: #ffffff;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #d1d1d6;
  color: #1c1c1e;
  border-radius: 10px;
  min-height: 60px;
  font-size: 0.95rem;
  font-family: inherit;
  line-height: 1.4;
  transition: all 0.2s;
  &:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 10px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 12px;
  background: ${props => props.$secondary ? '#84848d' : '#0066cc'};
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.9;
  }
  &:disabled {
    background: #c7c7cc;
    cursor: not-allowed;
  }
`;

const InventoryCard = styled.div`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 8px 12px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
`;

const IconWrapper = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.color || '#e3f2fd'};
  color: ${props => props.iconColor || '#1976d2'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  position: relative;
`;

const InventoryInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
  color: #1c1c1e;
  margin-bottom: 2px;
`;

const StockBadge = styled.div`
  font-size: 0.95rem;
  color: #8e8e93;
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  background: #f2f2f7;
  border-radius: 10px;
  padding: 4px;
  gap: 8px;
`;

const QtyBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #d1d1d6;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0066cc;
  cursor: pointer;
  &:disabled { color: #c7c7cc; }
`;

const QtyDisplay = styled.div`
  min-width: 20px;
  text-align: center;
  font-weight: 600;
  font-size: 0.95rem;
  color: #0066cc;
`;

const TotalRow = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 12px 16px;
  margin-top: 8px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
`;

const TotalLabel = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: #1c1c1e;
`;

const TotalValue = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #1c1c1e;
`;

const LogoutButton = styled.button`
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.24);
  color: #ffffff;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
`;

const PaymentContainer = styled.div`
  display: flex;
  gap: 12px;
  background: #ffffff;
  border-radius: 12px;
  padding: 8px 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  border: 1px solid #e0e0e0;
`;

const PaymentOption = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  background: ${props => props.$active ? '#e3f2fd' : 'transparent'};
  color: ${props => props.$active ? '#0066cc' : '#555'};
  border: 1px solid ${props => props.$active ? '#0066cc' : '#d1d1d6'};
  font-size: 0.7125rem;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s;
`;

const NotificationFloater = styled.div`
  position: fixed;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1500;
  width: min(92vw, 430px);
  border-radius: 12px;
  padding: 12px 14px;
  text-align: center;
  font-size: 0.92rem;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  border: 1px solid ${props => props.$type === 'error' ? '#ffcdd2' : '#b7ebc6'};
  background: ${props => props.$type === 'error' ? '#ffebee' : '#e8f5e9'};
  color: ${props => props.$type === 'error' ? '#c62828' : '#2e7d32'};
`;

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
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
  const [messageType, setMessageType] = useState('success');
  const [inventory, setInventory] = useState({ logo: 0, card: 0, tshirt: 0 });
  const [selection, setSelection] = useState({ logo: 0, card: 0, tshirt: 0 });
  const [pricing, setPricing] = useState({ logo_price: 50000, card_price: 50000, tshirt_price: 50000 });
  const [paymentMethod, setPaymentMethod] = useState('Chuyển Khoản');
  const [deliveryMethod, setDeliveryMethod] = useState('Đến mua tại HTX');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const messageTimeoutRef = useRef(null);

  const PRICE_LOGO = Number(pricing.logo_price || 0);
  const PRICE_CARD = Number(pricing.card_price || 0);
  const PRICE_TSHIRT = Number(pricing.tshirt_price || 0);

  const createDraftBillId = () => {
    const htx = (formData.htx || 'HTX').trim();
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const ymdhms = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const encoded = `${ymdhms}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    return `B-${htx}-${encoded}`;
  };

  const fetchInventory = (htx) => {
    const normalize = (val) => String(val || '').trim().toLowerCase();
    axios.get('/api/admin/inventory').then((res) => {
      const rows = Array.isArray(res.data) ? res.data : [];
      const selected = normalize(htx);
      const matched = rows.find((r) => normalize(r.name) === selected);
      setInventory({
        logo: Number(matched?.logo_stock || 0),
        card: Number(matched?.card_stock || 0),
        tshirt: Number(matched?.tshirt_stock || 0)
      });
    });
  };

  useEffect(() => {
    // Fetch HTX list
    axios.get('/api/htx_list').then(res => {
      setHtxList(res.data);
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, htx: res.data[0] }));
        fetchInventory(res.data[0]);
      }
    });
    axios.get('/api/admin/pricing').then((res) => {
      setPricing({
        logo_price: Number(res.data?.logo_price || 50000),
        card_price: Number(res.data?.card_price || 50000),
        tshirt_price: Number(res.data?.tshirt_price || 50000),
      });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setSelection((prev) => ({
      logo: Math.max(0, Math.min(Number(inventory.logo || 0), Number(prev.logo || 0))),
      card: Math.max(0, Math.min(Number(inventory.card || 0), Number(prev.card || 0))),
      tshirt: Math.max(0, Math.min(Number(inventory.tshirt || 0), Number(prev.tshirt || 0))),
    }));
  }, [inventory.logo, inventory.card, inventory.tshirt]);

  const showMessage = (text, type = 'success', duration = 2000) => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    setMessage(text);
    setMessageType(type);
    if (duration > 0) {
      messageTimeoutRef.current = setTimeout(() => {
        setMessage('');
        messageTimeoutRef.current = null;
      }, duration);
    }
  };

  const showValidationMessage = () => {
    showMessage('Vui lòng điền đủ thông tin', 'error', 2000);
  };

  const isBillInputValid = () => {
    const hasRequiredDriverInfo =
      formData.driver_name.trim() &&
      formData.license_plate.trim() &&
      formData.phone.trim();
    const hasAtLeastOneItem = (selection.logo + selection.card + selection.tshirt) > 0;
    const hasDeliveryAddress =
      deliveryMethod !== 'Gửi về địa chỉ' || deliveryAddress.trim();
    return Boolean(hasRequiredDriverInfo && hasAtLeastOneItem && hasDeliveryAddress);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'htx') {
      setFormData({
        htx: value,
        driver_name: '',
        license_plate: '',
        phone: '',
        details: ''
      });
      setSelection({ logo: 0, card: 0, tshirt: 0 });
      setPaymentMethod('Chuyá»ƒn Khoáº£n');
      setDeliveryMethod('Äáº¿n mua táº¡i HTX');
      setDeliveryAddress('');
      fetchInventory(value);
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));

    // Autofill Logic
    if (['license_plate', 'phone', 'driver_name'].includes(name) && value.length > 3) {
      axios.get(`/api/search_driver?${name}=${value}`).then(res => {
        if (res.data.length > 0) {
          const match = res.data[0];
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
    if (!isBillInputValid()) {
      showValidationMessage();
      return;
    }

    try {
      const billId = createDraftBillId();
      const payload = {
        ...formData,
        bill_id: billId,
        logo_qty: selection.logo,
        card_qty: selection.card,
        tshirt_qty: selection.tshirt,
        total_amount: selection.logo * PRICE_LOGO + selection.card * PRICE_CARD + selection.tshirt * PRICE_TSHIRT,
        payment_method: paymentMethod,
        delivery_method: deliveryMethod,
        delivery_address: deliveryMethod === 'Gửi về địa chỉ' ? deliveryAddress.trim() : '',
        sale_username: user?.username || null
      };
      const res = await axios.post('/api/up_bill', payload);
      setLastOrder(res.data.order_id || billId);
      showMessage('Lưu Bill thành công!', 'success', 2000);
      // Reset form
      setFormData(prev => ({ ...prev, driver_name: '', license_plate: '', phone: '', details: '' }));
      setSelection({ logo: 0, card: 0, tshirt: 0 });
      setPaymentMethod('Chuyển Khoản');
      setDeliveryMethod('Đến mua tại HTX');
      setDeliveryAddress('');
      fetchInventory(formData.htx);
    } catch (err) {
      showMessage('Lỗi khi lưu bill.', 'error', 2000);
    }
  };

  const handleExportBill = () => {
    if (!isBillInputValid()) {
      showValidationMessage();
      return;
    }

    const draftBill = {
      id: lastOrder || createDraftBillId(),
      created_at: new Date().toISOString(),
      htx: formData.htx || 'N/A',
      details: formData.details || '',
      logo_qty: selection.logo || 0,
      card_qty: selection.card || 0,
      tshirt_qty: selection.tshirt || 0,
      total_amount: (selection.logo * PRICE_LOGO) + (selection.card * PRICE_CARD) + (selection.tshirt * PRICE_TSHIRT),
      payment_method: paymentMethod || 'N/A',
      delivery_method: deliveryMethod || 'N/A',
      delivery_address: deliveryMethod === 'Gửi về địa chỉ' ? (deliveryAddress || '') : '',
      driver: {
        name: formData.driver_name || 'N/A',
        license_plate: formData.license_plate || 'N/A',
        phone: formData.phone || 'N/A'
      }
    };

    localStorage.setItem('draftBill', JSON.stringify(draftBill));
    navigate('/bill/draft', { state: { draftBill } });
  };

  return (
    <DashboardContainer>
      {message && (
        <NotificationFloater $type={messageType}>
          {message}
        </NotificationFloater>
      )}
      <BlueTopSection>
        <Header>
          <Title>HTX Sale</Title>
          <HeaderCenterBtn onClick={() => navigate('/bills')}>Hóa đơn</HeaderCenterBtn>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.82)', fontWeight: '500' }}>{user.username}</span>
            <LogoutButton onClick={onLogout} title="Đăng xuất"><FaSignOutAlt /></LogoutButton>
          </div>
        </Header>

        <TopContent>
          <SectionTitle style={{ color: '#dce9ff', borderBottomColor: 'rgba(220, 233, 255, 0.45)' }}>Tạo Đơn Hàng</SectionTitle>

          <FormGroup>
            <Label style={{ color: '#dbe8ff' }}>Hợp tác xã (HTX)</Label>
            <Select
              name="htx"
              value={formData.htx}
              onChange={handleChange}
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', borderColor: 'rgba(255, 255, 255, 0.28)', color: '#fff' }}
            >
              {htxList.map(htx => (
                <option key={htx} value={htx}>{htx}</option>
              ))}
            </Select>
          </FormGroup>

          <InventoryCard>
            <IconWrapper>
              <FaDiceD6 />
            </IconWrapper>
            <InventoryInfo>
              <ItemName>Logo</ItemName>
              <StockBadge>Kho còn: {Math.max(0, inventory.logo - selection.logo)} cái</StockBadge>
            </InventoryInfo>
            <QuantitySelector>
              <QtyBtn disabled={selection.logo <= 0} onClick={() => setSelection(p => ({ ...p, logo: Math.max(0, p.logo - 1) }))}><FaMinus /></QtyBtn>
              <QtyDisplay>{selection.logo}</QtyDisplay>
              <QtyBtn disabled={selection.logo >= inventory.logo || inventory.logo <= 0} onClick={() => setSelection(p => ({ ...p, logo: Math.min(inventory.logo, p.logo + 1) }))}><FaPlus /></QtyBtn>
            </QuantitySelector>
          </InventoryCard>

          <InventoryCard>
            <IconWrapper color="#fce4ec" iconColor="#d81b60">
              <FaIdCard />
            </IconWrapper>
            <InventoryInfo>
              <ItemName>Thẻ</ItemName>
              <StockBadge>Kho còn: {Math.max(0, inventory.card - selection.card)} cái</StockBadge>
            </InventoryInfo>
            <QuantitySelector>
              <QtyBtn disabled={selection.card <= 0} onClick={() => setSelection(p => ({ ...p, card: Math.max(0, p.card - 1) }))}><FaMinus /></QtyBtn>
              <QtyDisplay>{selection.card}</QtyDisplay>
              <QtyBtn disabled={selection.card >= inventory.card || inventory.card <= 0} onClick={() => setSelection(p => ({ ...p, card: Math.min(inventory.card, p.card + 1) }))}><FaPlus /></QtyBtn>
            </QuantitySelector>
          </InventoryCard>

          <InventoryCard>
            <IconWrapper color="#e8f5e9" iconColor="#2e7d32">
              <FaTshirt />
            </IconWrapper>
            <InventoryInfo>
              <ItemName>Áo thun</ItemName>
              <StockBadge>Kho còn: {Math.max(0, inventory.tshirt - selection.tshirt)} cái</StockBadge>
            </InventoryInfo>
            <QuantitySelector>
              <QtyBtn disabled={selection.tshirt <= 0} onClick={() => setSelection(p => ({ ...p, tshirt: Math.max(0, p.tshirt - 1) }))}><FaMinus /></QtyBtn>
              <QtyDisplay>{selection.tshirt}</QtyDisplay>
              <QtyBtn disabled={selection.tshirt >= inventory.tshirt || inventory.tshirt <= 0} onClick={() => setSelection(p => ({ ...p, tshirt: Math.min(inventory.tshirt, p.tshirt + 1) }))}><FaPlus /></QtyBtn>
            </QuantitySelector>
          </InventoryCard>

          <TotalRow>
            <TotalLabel>Thành Tiền</TotalLabel>
            <TotalValue>{(selection.logo * PRICE_LOGO + selection.card * PRICE_CARD + selection.tshirt * PRICE_TSHIRT).toLocaleString()}đ</TotalValue>
          </TotalRow>
        </TopContent>
      </BlueTopSection>

      <FormContainer>
        <PaymentContainer>
          <PaymentOption
            $active={paymentMethod === 'Chuyển Khoản'}
            onClick={() => setPaymentMethod('Chuyển Khoản')}
          >
            {paymentMethod === 'Chuyển Khoản' ? <MdCheckCircle /> : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid #d1d1d6' }} />}
            Chuyển Khoản
          </PaymentOption>
          <PaymentOption
            $active={paymentMethod === 'Tiền Mặt'}
            onClick={() => setPaymentMethod('Tiền Mặt')}
          >
            {paymentMethod === 'Tiền Mặt' ? <MdCheckCircle /> : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid #d1d1d6' }} />}
            Tiền Mặt
          </PaymentOption>
        </PaymentContainer>

        <PaymentContainer>
          <PaymentOption
            $active={deliveryMethod === 'Đến mua tại HTX'}
            onClick={() => setDeliveryMethod('Đến mua tại HTX')}
          >
            {deliveryMethod === 'Đến mua tại HTX' ? <MdCheckCircle /> : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid #d1d1d6' }} />}
            Đến mua tại HTX
          </PaymentOption>
          <PaymentOption
            $active={deliveryMethod === 'Gửi về địa chỉ'}
            onClick={() => setDeliveryMethod('Gửi về địa chỉ')}
          >
            {deliveryMethod === 'Gửi về địa chỉ' ? <MdCheckCircle /> : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid #d1d1d6' }} />}
            Gửi về địa chỉ
          </PaymentOption>
        </PaymentContainer>

        {deliveryMethod === 'Gửi về địa chỉ' && (
          <FormGroup>
            <Label>Địa chỉ</Label>
            <TextArea
              name="delivery_address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Nhập địa chỉ giao hàng"
              rows={3}
              style={{ minHeight: 'unset' }}
            />
          </FormGroup>
        )}

        <FormGroup style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <Label>Biển số xe</Label>
            <Input name="license_plate" value={formData.license_plate} onChange={handleChange} placeholder="VD: 59A-123.45" />
          </div>
          <div>
            <Label>Số điện thoại</Label>
            <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="VD: 0909123456" />
          </div>
        </FormGroup>

        <FormGroup>
          <Label>Tên tài xế</Label>
          <Input name="driver_name" value={formData.driver_name} onChange={handleChange} placeholder="Nhập tên tài xế" />
        </FormGroup>

        <FormGroup>
          <Label>Ghi chú</Label>
          <TextArea name="details" value={formData.details} onChange={handleChange} placeholder="Chi tiết..." />
        </FormGroup>

        <ButtonGroup>
          <ActionButton onClick={handleUpBill} $secondary>
            <FaSave /> Lưu Bill
          </ActionButton>

          <ActionButton
            onClick={handleExportBill}
          >
            <FaFileExport /> Xuất Bill
          </ActionButton>
        </ButtonGroup>

      </FormContainer>
    </DashboardContainer>
  );
}

export default Dashboard;
