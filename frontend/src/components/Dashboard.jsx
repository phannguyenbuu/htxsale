import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FaSignOutAlt, FaFileExport, FaPlus, FaMinus, FaDiceD6, FaIdCard, FaTshirt, FaBox } from 'react-icons/fa';
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
  background: #007bff;
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

const DraftList = styled.div`
  display: grid;
  gap: 8px;
  margin-bottom: 10px;
`;

const DraftItem = styled.div`
  border: 1px solid #dbe2f1;
  border-radius: 10px;
  background: #fff;
  padding: 8px 10px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
`;

const DraftTitle = styled.div`
  font-size: 0.88rem;
  font-weight: 600;
  color: #1f2d47;
`;

const DraftMeta = styled.div`
  font-size: 0.8rem;
  color: #5f6f8f;
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
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [products, setProducts] = useState([]);
  const [selection, setSelection] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('Chuyển Khoản');
  const [deliveryMethod, setDeliveryMethod] = useState('Đến Mua Tại HTX');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '' });
  const [tempBills, setTempBills] = useState([]);
  const [selectedTempBillId, setSelectedTempBillId] = useState('');
  const [cardPriceOverride, setCardPriceOverride] = useState(35000);
  const messageTimeoutRef = useRef(null);

  const isAnSpecialSale = String(user?.username || '').trim().toLowerCase() === 'an';
  const parseMoneyInput = (raw) => Number(String(raw ?? '').replace(/[^\d]/g, '') || 0);
  const formatMoneyInput = (value) => Number(value || 0).toLocaleString('en-US');

  const iconOf = (code) => {
    if (code === 'logo') return <FaDiceD6 />;
    if (code === 'card') return <FaIdCard />;
    if (code === 'driver_card') return <img src="/thedeo.png" alt="The Nghiep Vu Tai Xe" style={{ width: 22, height: 22, objectFit: 'contain' }} />;
    if (code === 'tshirt') return <FaTshirt />;
    return <FaBox />;
  };

  const colorOf = (code) => {
    if (code === 'logo') return { bg: '#e3f2fd', fg: '#1976d2' };
    if (code === 'card' || code === 'driver_card') return { bg: '#fce4ec', fg: '#d81b60' };
    if (code === 'tshirt') return { bg: '#e8f5e9', fg: '#2e7d32' };
    return { bg: '#fff8e1', fg: '#ff8f00' };
  };

  const getUnitPrice = (productCode, fallbackPrice) => {
    if (isAnSpecialSale && productCode === 'card') return Number(cardPriceOverride || 35000);
    return Number(fallbackPrice || 0);
  };

  const totalAmount = products.reduce((sum, p) => {
    const unit = getUnitPrice(p.code, p.unit_price);
    return sum + Number(selection[p.code] || 0) * unit;
  }, 0);

  const createDraftBillId = () => {
    const htx = (formData.htx || 'HTX').trim();
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const ymdhms = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const encoded = `${ymdhms}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    return `B-${htx}-${encoded}`;
  };

  const fetchInventory = (htx) => {
    axios.get(`/api/inventory?htx=${encodeURIComponent(htx)}`).then((res) => {
      const list = Array.isArray(res.data?.products) ? res.data.products : [];
      const normalized = list.map((p) => ({
        code: p.code,
        name: p.name,
        unit_price: Number(p.unit_price || 0),
        quantity: Number(p.quantity || 0)
      }));
      setProducts(normalized);
    });
  };

  const loadTempBills = () => {
    if (!user?.username) return;
    axios.get(`/api/temp_bills?sale_username=${encodeURIComponent(user.username)}`).then((res) => {
      setTempBills(Array.isArray(res.data) ? res.data : []);
    }).catch(() => {});
  };

  useEffect(() => {
    axios.get('/api/htx_list').then((res) => {
      const list = Array.isArray(res.data) ? res.data : [];
      setHtxList(list);
      if (list.length > 0) {
        setFormData((prev) => ({ ...prev, htx: list[0] }));
        fetchInventory(list[0]);
      }
    });
  }, []);

  useEffect(() => {
    loadTempBills();
  }, [user?.username]);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setSelection((prev) => {
      const next = {};
      products.forEach((p) => {
        next[p.code] = Math.max(0, Math.min(Number(p.quantity || 0), Number(prev[p.code] || 0)));
      });
      return next;
    });
  }, [products]);

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

  const isBillInputValid = () => {
    const hasRequiredDriverInfo =
      formData.driver_name.trim() &&
      formData.license_plate.trim() &&
      formData.phone.trim();
    const hasAtLeastOneItem = Object.values(selection).reduce((sum, qty) => sum + Number(qty || 0), 0) > 0;
    const hasDeliveryAddress = deliveryMethod !== 'Gửi Về Địa Chỉ' || deliveryAddress.trim();
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
      setSelection({});
      setPaymentMethod('Chuyển Khoản');
      setDeliveryMethod('Đến Mua Tại HTX');
      setDeliveryAddress('');
      if (isAnSpecialSale) setCardPriceOverride(35000);
      fetchInventory(value);
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (['license_plate', 'phone', 'driver_name'].includes(name) && value.length > 3) {
      axios.get(`/api/search_driver?${name}=${value}`).then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const match = res.data[0];
          setFormData((prev) => ({
            ...prev,
            driver_name: prev.driver_name || match.name,
            license_plate: prev.license_plate || match.license_plate,
            phone: prev.phone || match.phone
          }));
        }
      });
    }
  };

  const buildBillPayload = (billId) => {
    const item_details = {};
    products.forEach((p) => {
      const qty = Number(selection[p.code] || 0);
      if (qty > 0) item_details[p.code] = qty;
    });

    return {
      ...formData,
      bill_id: billId,
      item_details,
      logo_qty: Number(item_details.logo || 0),
      card_qty: Number(item_details.card || 0),
      tshirt_qty: Number(item_details.tshirt || 0),
      total_amount: totalAmount,
      payment_method: paymentMethod,
      delivery_method: deliveryMethod,
      delivery_address: deliveryMethod === 'Gửi Về Địa Chỉ' ? deliveryAddress.trim() : '',
      card_unit_price_override: isAnSpecialSale ? Number(cardPriceOverride || 35000) : undefined,
      sale_username: user?.username || null
    };
  };

  const buildTemporaryPayload = (tempId = '') => {
    const item_details = {};
    products.forEach((p) => {
      const qty = Number(selection[p.code] || 0);
      if (qty > 0) item_details[p.code] = qty;
    });
    return {
      id: tempId || undefined,
      sale_username: user?.username || '',
      htx: formData.htx,
      driver_name: formData.driver_name,
      license_plate: formData.license_plate,
      phone: formData.phone,
      details: formData.details,
      item_details,
      payment_method: paymentMethod,
      delivery_method: deliveryMethod,
      delivery_address: deliveryMethod === 'Gửi Về Địa Chỉ' ? deliveryAddress.trim() : '',
      card_unit_price_override: isAnSpecialSale ? Number(cardPriceOverride || 35000) : 0,
    };
  };

  const resetBillForm = () => {
    setFormData((prev) => ({ ...prev, driver_name: '', license_plate: '', phone: '', details: '' }));
    setSelection({});
    setPaymentMethod('Chuyển Khoản');
    setDeliveryMethod('Đến Mua Tại HTX');
    setDeliveryAddress('');
    if (isAnSpecialSale) setCardPriceOverride(35000);
  };

  const persistBill = async () => {
    const billId = createDraftBillId();
    const payload = buildBillPayload(billId);
    const res = await axios.post('/api/up_bill', payload);
    return res.data.order_id || billId;
  };

  const handleExportBill = async () => {
    if (!isBillInputValid()) {
      showMessage('Vui Lòng Điền Đầy Đủ Thông Tin', 'error', 2000);
      return;
    }

    try {
      const billId = createDraftBillId();
      const payload = {
        ...buildBillPayload(billId),
        temp_bill_id: selectedTempBillId || undefined,
      };
      const res = await axios.post('/api/up_bill', payload);
      const orderId = res.data.order_id || billId;
      showMessage('Lưu Bill Thành Công', 'success', 1500);
      resetBillForm();
      setSelectedTempBillId('');
      fetchInventory(formData.htx);
      loadTempBills();
      navigate(`/bill/${orderId}`);
    } catch (err) {
      showMessage('Lỗi Khi Lưu Bill', 'error', 2000);
    }
  };

  const handleSaveTemporaryBill = async () => {
    if (!formData.htx) {
      showMessage('Vui Lòng Chọn HTX', 'error', 2000);
      return;
    }
    try {
      const res = await axios.post('/api/temp_bills', buildTemporaryPayload(selectedTempBillId));
      setSelectedTempBillId(res.data?.id || selectedTempBillId);
      showMessage('Đã Lưu Bill Tạm', 'success', 1500);
      loadTempBills();
    } catch (err) {
      showMessage('Không Lưu Được Bill Tạm', 'error', 2000);
    }
  };

  const handleLoadTemporaryBill = (draft) => {
    const nextHtx = draft?.htx || '';
    if (!nextHtx) return;
    setSelectedTempBillId(draft.id || '');
    setFormData({
      htx: nextHtx,
      driver_name: draft.driver_name || '',
      license_plate: draft.license_plate || '',
      phone: draft.phone || '',
      details: draft.details || '',
    });
    setPaymentMethod(draft.payment_method || 'Chuyển Khoản');
    setDeliveryMethod(draft.delivery_method || 'Đến Mua Tại HTX');
    setDeliveryAddress(draft.delivery_address || '');
    if (isAnSpecialSale) {
      setCardPriceOverride(Number(draft.card_unit_price_override || 35000));
    }
    fetchInventory(nextHtx);
    const itemDetails = (draft.item_details && typeof draft.item_details === 'object') ? draft.item_details : {};
    setSelection(itemDetails);
    showMessage('Đã Tải Bill Tạm', 'success', 1200);
  };

  const handleDeleteTemporaryBill = async (tempId) => {
    try {
      await axios.delete(`/api/temp_bills/${encodeURIComponent(tempId)}?sale_username=${encodeURIComponent(user?.username || '')}`);
      if (selectedTempBillId === tempId) setSelectedTempBillId('');
      loadTempBills();
      showMessage('Đã Xóa Bill Tạm', 'success', 1200);
    } catch (err) {
      showMessage('Không Xóa Được Bill Tạm', 'error', 2000);
    }
  };

  const handleChangePassword = async () => {
    if (String(passwordForm.new_password || '').length !== 6) {
      showMessage('Mật Khẩu Mới Phải Đúng 6 Ký Tự', 'error', 2200);
      return;
    }
    try {
      await axios.post('/api/change_password', {
        username: user?.username,
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      });
      setPasswordForm({ old_password: '', new_password: '' });
      setShowChangePassword(false);
      showMessage('Đổi Mật Khẩu Thành Công', 'success', 2000);
    } catch (err) {
      showMessage(err?.response?.data?.error || 'Không Đổi Được Mật Khẩu', 'error', 2500);
    }
  };

  const handleCreateUnifiedOrder = async () => {
    try {
      const services = ORDER_SERVICE_SCHEMA
        .filter((s) => Boolean(serviceChecks[s.key]))
        .map((s) => ({
          service_type: s.key,
          amount: Number(serviceAmounts[s.key] || 0),
        }))
        .filter((s) => s.amount > 0);

      const payments = ORDER_PAYMENT_SCHEMA
        .map((p) => ({
          bank_account: p.key,
          amount: Number(bankPayments[p.key] || 0),
        }))
        .filter((p) => p.amount > 0);

      const amountFromServices = services.reduce((sum, s) => sum + Number(s.amount || 0), 0);

      await axios.post('/api/orders', {
        plate_number: formData.license_plate,
        driver_name: formData.driver_name,
        phone: formData.phone,
        htx: formData.htx,
        description: formData.details,
        amount: amountFromServices,
        service_type: services[0]?.service_type || null,
        services,
        payments,
        note: orderNote,
        date: new Date().toISOString().slice(0, 10),
      });

      showMessage('Đã Lưu Order Theo Schema Mới', 'success', 1800);
    } catch (err) {
      showMessage(err?.response?.data?.error || 'Không Lưu Được Order Mới', 'error', 2500);
    }
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
          <div style={{ display: 'flex', gap: 8 }}>
            <HeaderCenterBtn onClick={() => navigate('/bills')}>Hóa Đơn</HeaderCenterBtn>
            <HeaderCenterBtn onClick={() => setShowChangePassword((v) => !v)}>Đổi Mật Khẩu</HeaderCenterBtn>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.82)', fontWeight: '500' }}>{user.username}</span>
            <LogoutButton onClick={onLogout} title="Đăng Xuất"><FaSignOutAlt /></LogoutButton>
          </div>
        </Header>

        <TopContent>
          <SectionTitle style={{ color: '#dce9ff', borderBottomColor: 'rgba(220, 233, 255, 0.45)' }}>Tạo Đơn Hàng</SectionTitle>

          <FormGroup>
            <Label style={{ color: '#dbe8ff' }}>Hợp Tác Xã (HTX)</Label>
            <Select
              name="htx"
              value={formData.htx}
              onChange={handleChange}
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', borderColor: 'rgba(255, 255, 255, 0.28)', color: '#fff' }}
            >
              {htxList.map((htx) => (
                <option key={htx} value={htx}>{htx}</option>
              ))}
            </Select>
          </FormGroup>

          {products.map((p) => {
            const colors = colorOf(p.code);
            const selectedQty = Number(selection[p.code] || 0);
            const remaining = Math.max(0, Number(p.quantity || 0) - selectedQty);
            return (
              <InventoryCard key={p.code}>
                <IconWrapper color={colors.bg} iconColor={colors.fg}>
                  {iconOf(p.code)}
                </IconWrapper>
                <InventoryInfo>
                  <ItemName>{p.name}</ItemName>
                  <StockBadge>
                    Kho Còn: {remaining} | Giá: {getUnitPrice(p.code, p.unit_price).toLocaleString('vi-VN')}đ
                  </StockBadge>
                </InventoryInfo>
                <QuantitySelector>
                  <QtyBtn
                    disabled={selectedQty <= 0}
                    onClick={() => setSelection((prev) => ({ ...prev, [p.code]: Math.max(0, Number(prev[p.code] || 0) - 1) }))}
                  >
                    <FaMinus />
                  </QtyBtn>
                  <QtyDisplay>{selectedQty}</QtyDisplay>
                  <QtyBtn
                    disabled={selectedQty >= Number(p.quantity || 0) || Number(p.quantity || 0) <= 0}
                    onClick={() => setSelection((prev) => ({ ...prev, [p.code]: Math.min(Number(p.quantity || 0), Number(prev[p.code] || 0) + 1) }))}
                  >
                    <FaPlus />
                  </QtyBtn>
                </QuantitySelector>
              </InventoryCard>
            );
          })}

          <TotalRow>
            <TotalLabel>Thành Tiền</TotalLabel>
            <TotalValue>{totalAmount.toLocaleString('vi-VN')}đ</TotalValue>
          </TotalRow>
        </TopContent>
      </BlueTopSection>

      <FormContainer>
        {tempBills.length > 0 && (
          <FormGroup>
            <Label>Bill Tạm Của Bạn</Label>
            <DraftList>
              {tempBills.map((draft) => (
                <DraftItem key={draft.id}>
                  <div>
                    <DraftTitle>{draft.license_plate || 'Chưa Có Biển Số'} - {draft.driver_name || 'Chưa Có Tên'}</DraftTitle>
                    <DraftMeta>{draft.htx} | {new Date(draft.updated_at || draft.created_at).toLocaleString('vi-VN')}</DraftMeta>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <ActionButton style={{ padding: '8px 10px', flex: 'unset' }} onClick={() => handleLoadTemporaryBill(draft)}>Tải</ActionButton>
                    <ActionButton $secondary style={{ padding: '8px 10px', flex: 'unset' }} onClick={() => handleDeleteTemporaryBill(draft.id)}>Xóa</ActionButton>
                  </div>
                </DraftItem>
              ))}
            </DraftList>
          </FormGroup>
        )}

        {showChangePassword && (
          <FormGroup style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12, padding: 10 }}>
            <Label>Mật Khẩu Hiện Tại</Label>
            <Input
              type="password"
              value={passwordForm.old_password}
              onChange={(e) => setPasswordForm((p) => ({ ...p, old_password: e.target.value }))}
              placeholder="Nhập 6 Ký Tự"
            />
            <Label style={{ marginTop: 8 }}>Mật Khẩu Mới (6 Ký Tự)</Label>
            <Input
              type="password"
              maxLength={6}
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm((p) => ({ ...p, new_password: e.target.value }))}
              placeholder="Nhập 6 Ký Tự"
            />
            <ButtonGroup>
              <ActionButton onClick={handleChangePassword}>Lưu Mật Khẩu</ActionButton>
              <ActionButton $secondary onClick={() => setShowChangePassword(false)}>Hủy</ActionButton>
            </ButtonGroup>
          </FormGroup>
        )}

        {isAnSpecialSale && (
          <FormGroup>
            <Label>Đơn Giá Thẻ Đeo (Riêng Ân)</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={formatMoneyInput(cardPriceOverride)}
              onChange={(e) => setCardPriceOverride(parseMoneyInput(e.target.value))}
            />
          </FormGroup>
        )}

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
            $active={deliveryMethod === 'Đến Mua Tại HTX'}
            onClick={() => setDeliveryMethod('Đến Mua Tại HTX')}
          >
            {deliveryMethod === 'Đến Mua Tại HTX' ? <MdCheckCircle /> : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid #d1d1d6' }} />}
            Đến Mua Tại HTX
          </PaymentOption>
          <PaymentOption
            $active={deliveryMethod === 'Gửi Về Địa Chỉ'}
            onClick={() => setDeliveryMethod('Gửi Về Địa Chỉ')}
          >
            {deliveryMethod === 'Gửi Về Địa Chỉ' ? <MdCheckCircle /> : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid #d1d1d6' }} />}
            Gửi Về Địa Chỉ
          </PaymentOption>
        </PaymentContainer>

        {deliveryMethod === 'Gửi Về Địa Chỉ' && (
          <FormGroup>
            <Label>Địa Chỉ</Label>
            <TextArea
              name="delivery_address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Nhập Địa Chỉ Giao Hàng"
              rows={3}
              style={{ minHeight: 'unset' }}
            />
          </FormGroup>
        )}

        <FormGroup style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <Label>Biển Số Xe</Label>
            <Input name="license_plate" value={formData.license_plate} onChange={handleChange} placeholder="VD: 59A-123.45" />
          </div>
          <div>
            <Label>Số Điện Thoại</Label>
            <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="VD: 0909123456" />
          </div>
        </FormGroup>

        <FormGroup>
          <Label>Tên Tài Xế</Label>
          <Input name="driver_name" value={formData.driver_name} onChange={handleChange} placeholder="Nhập Tên Tài Xế" />
        </FormGroup>

        <FormGroup>
          <Label>Ghi Chú</Label>
          <TextArea name="details" value={formData.details} onChange={handleChange} placeholder="Chi Tiết..." />
        </FormGroup>

        <ButtonGroup>
          <ActionButton $secondary onClick={handleSaveTemporaryBill}>
            Lưu Bill
          </ActionButton>
          <ActionButton onClick={handleExportBill}>
            <FaFileExport /> Xuất Bill
          </ActionButton>
        </ButtonGroup>
      </FormContainer>
    </DashboardContainer>
  );
}

export default Dashboard;


