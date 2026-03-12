import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FaBoxes, FaCalendarAlt, FaCamera, FaEdit, FaFileInvoice, FaIdCard, FaPlus, FaSearch, FaSignOutAlt, FaTrashAlt, FaUsers, FaUpload } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const Page = styled.div`
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  margin: 0;
  background: #f4f6fb;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
`;

const Header = styled.div`
  background: #007bff;
  color: #fff;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.2rem;
`;

const LogoutBtn = styled.button`
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border-radius: 999px;
  padding: 6px 12px;
  cursor: pointer;
`;

const TabRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  padding: 10px 12px;
  background: #fff;
  border-bottom: 1px solid #dfe5f1;
`;

const TabBtn = styled.button`
  border: 1px solid ${(p) => (p.$active ? '#0a66c2' : '#d5dcec')};
  background: ${(p) => (p.$active ? '#e8f2ff' : '#fff')};
  color: ${(p) => (p.$active ? '#0a66c2' : '#394660')};
  border-radius: 10px;
  min-height: 68px;
  padding: 8px 6px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const Body = styled.div`
  padding: 12px;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #dfe5f1;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  border: 1px solid #ced6e8;
  border-radius: 10px;
  padding: 8px 10px;
  text-align: center;
  font-weight: 700;
`;

const TextArea = styled.textarea`
  width: 100%;
  border: 1px solid #ced6e8;
  border-radius: 10px;
  padding: 8px 10px;
  min-height: 114px;
  resize: vertical;
  font-family: inherit;
`;

const Select = styled.select`
  width: 100%;
  border: 1px solid #ced6e8;
  border-radius: 10px;
  padding: 8px 10px;
`;

const Btn = styled.button`
  border: none;
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
  background: ${(p) => (p.$secondary ? '#eef2fb' : '#0a66c2')};
  color: ${(p) => (p.$secondary ? '#20314f' : '#fff')};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
`;

const Th = styled.th`
  text-align: left;
  border-bottom: 1px solid #dfe5f1;
  padding: 8px 6px;
  color: #4e5a75;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
`;

const Td = styled.td`
  border-bottom: 1px solid #edf1f8;
  padding: 8px 6px;
  color: #1f2d47;
`;

const HtxPill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid ${(p) => p.$border || '#ced6e8'};
  background: ${(p) => p.$bg || '#f3f6ff'};
  color: ${(p) => p.$color || '#1f2d47'};
  font-weight: 700;
  font-size: 0.82rem;
  white-space: nowrap;
`;

const Small = styled.div`
  font-size: 0.84rem;
  color: #5f6f8f;
`;

const ActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
`;

const IconBtn = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: #eef2fb;
  color: #20314f;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 16px;
`;

const ModalCard = styled.div`
  width: min(94vw, 600px);
  max-height: 90vh;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #dfe5f1;
  border-radius: 14px;
  padding: 14px;
`;

const ModalTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2d47;
  margin-bottom: 6px;
`;

const ModalText = styled.div`
  font-size: 0.9rem;
  color: #5f6f8f;
  margin-bottom: 12px;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
`;

const FormGrid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 10px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const InventoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 15px;
`;

const CenterRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 0;
`;

const HtxTitle = styled.div`
  font-weight: 700;
  color: #1f2d47;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #007bff;
`;

const StockItemBox = styled.div`
  border: 1px solid #edf1f8;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 10px;
  background: #fafbfc;
`;

const StockItemHeader = styled.div`
  font-size: 0.88rem;
  font-weight: 700;
  color: #394660;
  margin-bottom: 8px;
`;

const StockInputs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 10px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StockEditWrap = styled.div`
  display: grid;
  grid-template-columns: 32px 1fr 32px;
  gap: 4px;
`;

const DateFilterRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) auto;
  gap: 10px;
  align-items: end;
`;

const DateInput = styled.input`
  width: 100%;
  border: 1px solid #ced6e8;
  border-radius: 10px;
  padding: 10px 10px;
  font-weight: 600;
`;

const PagerRow = styled.div`
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
`;

const PageBtn = styled.button`
  min-width: 34px;
  height: 30px;
  border: 1px solid ${(p) => (p.$active ? '#ff6a2a' : '#d8deeb')};
  background: ${(p) => (p.$active ? '#ff6a2a' : '#fff')};
  color: ${(p) => (p.$active ? '#fff' : '#5f6f8f')};
  border-radius: 6px;
  cursor: ${(p) => (p.disabled ? 'not-allowed' : 'pointer')};
  opacity: ${(p) => (p.disabled ? 0.55 : 1)};
  font-weight: 700;
`;

const Tabs = {
  bills: 'bills',
  inventory: 'inventory',
  drivers: 'drivers',
  sales: 'sales',
};

const SummaryBox = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
`;

const SummaryItem = styled.div`
  flex: 1;
  background: #fff;
  border: 1px solid #dfe5f1;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const SummaryLabel = styled.div`
  font-size: 0.85rem;
  color: #5f6f8f;
  font-weight: 600;
`;

const SummaryValue = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${p => p.$color || '#1f2d47'};
`;

const FilterGrid = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 12px;
  align-items: end;
  background: #fff;
  border: 1px solid #dfe5f1;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;

  & > div {
    flex: 1;
    min-width: 0;
  }

  & > button {
    flex-shrink: 0;
  }
`;

const SortIcon = ({ sort, field }) => {
  const active = sort.key === field;
  return (
    <span style={{ 
      marginLeft: 4, 
      display: 'inline-block',
      fontSize: '0.75rem',
      color: active ? '#0a66c2' : '#ced6e8',
      opacity: active ? 1 : 0.5
    }}>
      {active ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}
    </span>
  );
};

const getHtxPillStyle = (htxName) => {
  const name = String(htxName || '').toUpperCase();
  if (name.includes('THANH VY')) return { $bg: '#fff5f5', $border: '#ffc1c1', $color: '#dc3545' }; // Red
  if (name.includes('NGHĨA PHÁT')) return { $bg: '#f8f5ff', $border: '#dccaff', $color: '#6f42c1' }; // Purple
  if (name.includes('TIỀN GIANG')) return { $bg: '#f1faf5', $border: '#a7e1c4', $color: '#198754' }; // Green
  if (name.includes('MINH VY')) return { $bg: '#fffaf2', $border: '#ffdfba', $color: '#d9480f' }; // Dark Orange
  if (name.includes('KIM THỊNH')) return { $bg: '#f0f7ff', $border: '#b0d4ff', $color: '#0a58ca' }; // Dark Blue
  return { $bg: '#f3f6ff', $border: '#ced6e8', $color: '#1f2d47' };
};

function SaleAdminPanel({ onLogout, user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(Tabs.bills);

  const [inventoryRows, setInventoryRows] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventoryDraft, setInventoryDraft] = useState({});
  
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', unit_price: 0, sort_order: 0 });

  const [bills, setBills] = useState([]);
  const [billFilterSale, setBillFilterSale] = useState('');
  const [billFilterHtx, setBillFilterHtx] = useState('');
  const [billDateFrom, setBillDateFrom] = useState('');
  const [billDateTo, setBillDateTo] = useState('');
  const [billFilterProduct, setBillFilterProduct] = useState('');
  const [billFilterStatus, setBillFilterStatus] = useState('');
  
  const [billSort, setBillSort] = useState({ key: 'created_at', dir: 'desc' });
  const [billPage, setBillPage] = useState(1);
  const [billPageSize, setBillPageSize] = useState(50);
  
  const [showBillModal, setShowBillModal] = useState(false);
  const [editingBillId, setEditingBillId] = useState(null);
  const [billForm, setBillForm] = useState({
    driver_name: '', phone: '', license_plate: '',
    payment_method: 'Chuyển Khoản', status: 'paid', htx: '', sale_username: '', note: '',
    transfer_date: new Date().toISOString().split('T')[0],
    bill_image: null,
    services: {},
  });

  const [previewImage, setPreviewImage] = useState(null);

  const [drivers, setDrivers] = useState([]);
  const [driverQuery, setDriverQuery] = useState('');
  const [driverFilterHtx, setDriverFilterHtx] = useState('');
  const [driverSort, setDriverSort] = useState({ key: 'driver_name', dir: 'asc' });
  const [driverPage, setDriverPage] = useState(1);
  const [driverPageSize, setDriverPageSize] = useState(50);

  const [sales, setSales] = useState([]);
  const [saleForm, setSaleForm] = useState({ username: '', password: '123456', full_name: '', phone: '' });
  const [saleSort, setSaleSort] = useState({ key: 'id', dir: 'asc' });
  const [message, setMessage] = useState('');

  const activeProducts = useMemo(() => products.filter(p => !!p.is_active), [products]);
  const htxOptions = useMemo(() => inventoryRows.map((r) => r.name).filter(Boolean), [inventoryRows]);

  const parseMoneyInput = (raw) => Number(String(raw ?? '').replace(/[^\d]/g, '') || 0);
  const formatMoneyInput = (value) => Number(value || 0).toLocaleString('vi-VN') + 'đ';

  const handleSort = (tab, key) => {
    const setSort = tab === 'bills' ? setBillSort : (tab === 'drivers' ? setDriverSort : setSaleSort);
    const sort = tab === 'bills' ? billSort : (tab === 'drivers' ? driverSort : saleSort);
    setSort({ key, dir: sort.key === key && sort.dir === 'asc' ? 'desc' : 'asc' });
  };

  const loadInventory = async () => {
    try {
      const res = await axios.get('/api/admin/inventory');
      const { products: pRows, htx_rows, stocks, prices } = res.data || {};
      setProducts(pRows || []);
      setInventoryRows(htx_rows || []);
      const draft = {};
      (htx_rows || []).forEach((r) => {
        draft[r.name] = { stocks: {}, prices: {} };
        (pRows || []).forEach((p) => {
          draft[r.name].stocks[p.code] = Number(stocks?.[r.name]?.[p.code] || 0);
          draft[r.name].prices[p.code] = Number(prices?.[r.name]?.[p.code] || p.unit_price || 0);
        });
      });
      setInventoryDraft(draft);
      if (htx_rows?.length > 0) setBillForm(prev => ({ ...prev, htx: htx_rows[0].name }));
    } catch (err) { setMessage('Không Tải Được Kho Hàng.'); }
  };

  const loadBills = async () => {
    const params = new URLSearchParams();
    if (billFilterSale) params.set('sale_username', billFilterSale);
    if (billFilterHtx) params.set('htx', billFilterHtx);
    if (billDateFrom) params.set('date_from', billDateFrom);
    if (billDateTo) params.set('date_to', billDateTo);
    const res = await axios.get(`/api/admin/bills?${params.toString()}`);
    let data = Array.isArray(res.data) ? res.data : [];
    // Only update status for UI logic, keep payment_method as is from DB
    data = data.map(b => {
        const desc = (b.details || b.note || '').toLowerCase();
        if (desc.includes('chưa tt')) {
            return { ...b, status: 'Chưa TT' };
        }
        return b;
    });
    setBills(data);
    setBillPage(1);
  };

  const loadSales = async () => {
    const res = await axios.get('/api/admin/sale_users');
    setSales(Array.isArray(res.data) ? res.data : []);
  };

  const loadDrivers = async () => {
    const params = new URLSearchParams();
    if (driverQuery) params.set('query', driverQuery);
    if (driverFilterHtx) params.set('htx', driverFilterHtx);
    const res = await axios.get(`/api/admin/drivers?${params.toString()}`);
    setDrivers(Array.isArray(res.data) ? res.data : []);
    setDriverPage(1);
  };

  useEffect(() => { loadInventory(); loadSales(); }, []);
  useEffect(() => {
    if (activeTab === Tabs.bills) loadBills();
    if (activeTab === Tabs.drivers) loadDrivers();
    if (activeTab === Tabs.sales) loadSales();
    if (activeTab === Tabs.inventory) loadInventory();
  }, [activeTab]);

  const handleCreateSale = async () => {
    try {
        await axios.post('/api/admin/create_sale', saleForm);
        setSaleForm({ username: '', password: '123456', full_name: '', phone: '' });
        loadSales();
        setMessage('Đã thêm sale thành công');
    } catch (err) { setMessage('Lỗi khi thêm sale'); }
  };

  const handleSaveBill = async () => {
    try {
        const formData = new FormData();
        formData.append('driver_name', billForm.driver_name);
        formData.append('phone', billForm.phone);
        formData.append('license_plate', billForm.license_plate);
        formData.append('payment_method', billForm.payment_method);
        formData.append('htx', billForm.htx);
        formData.append('sale_username', billForm.sale_username || user.username);
        formData.append('note', billForm.note);
        formData.append('status', billForm.status);
        formData.append('transfer_date', billForm.payment_method === 'Chuyển Khoản' ? billForm.transfer_date : '');
        if (billForm.bill_image) formData.append('bill_image', billForm.bill_image);
        
        const totalAmount = Object.entries(billForm.services).reduce((sum, [code, qty]) => {
            const p = products.find(prod => prod.code === code);
            return sum + (Number(qty) * (p?.unit_price || 0));
        }, 0);
        formData.append('amount', totalAmount);
        formData.append('services', JSON.stringify(billForm.services));

        const config = { headers: { 'Content-Type': 'multipart/form-data' } };
        if (editingBillId) {
            await axios.put(`/api/admin/bills/${editingBillId}`, formData, config);
            setMessage('Đã cập nhật hóa đơn');
        } else {
            await axios.post('/api/admin/bills/manual', formData, config);
            setMessage('Đã tạo hóa đơn thành công');
        }
        
        setShowBillModal(false);
        setEditingBillId(null);
        setBillForm({
            driver_name: '', phone: '', license_plate: '',
            payment_method: 'Chuyển Khoản', htx: htxOptions[0] || '', sale_username: '', note: '',
            status: 'paid',
            transfer_date: new Date().toISOString().split('T')[0],
            bill_image: null,
            services: {},
        });
        loadBills();
    } catch (err) { setMessage('Lỗi khi lưu hóa đơn'); }
  };

  const openEditBill = (b) => {
    setEditingBillId(b.id);
    
    // Normalize payment method to match radio button labels
    let pm = b.payment_method || '';
    if (pm === 'Chuyen Khoan') pm = 'Chuyển Khoản';
    if (pm === 'Tien Mat') pm = 'Tiền Mặt';

    setBillForm({
        driver_name: b.driver_name || '',
        phone: b.phone || '',
        license_plate: b.license_plate || '',
        payment_method: pm,
        status: b.status || 'paid',
        htx: b.htx || '',
        sale_username: b.sale_username || '',
        note: b.details || b.note || '',
        transfer_date: b.transfer_date || new Date().toISOString().split('T')[0],
        bill_image: null,
        services: b.item_details || {}
    });
    setShowBillModal(true);
  };

  const deleteSale = async (id) => {
    if (window.confirm('Xóa nhân viên này?')) {
        await axios.delete(`/api/admin/sale_users/${id}`);
        loadSales();
    }
  };

  const sortData = (data, sort) => {
    if (!sort.key) return data;
    return [...data].sort((a, b) => {
        let valA = a[sort.key] || '';
        let valB = b[sort.key] || '';
        
        if (sort.key === 'driver_name') {
            const getSortableName = (n) => {
                const parts = String(n).trim().split(/\s+/);
                const last = parts[parts.length - 1] || '';
                return (last + " " + n).toLowerCase();
            };
            valA = getSortableName(valA);
            valB = getSortableName(valB);
        } else if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }
        
        if (valA < valB) return sort.dir === 'asc' ? -1 : 1;
        if (valA > valB) return sort.dir === 'asc' ? 1 : -1;
        return 0;
    });
  };

  const filteredBills = useMemo(() => {
    let result = bills;
    if (billFilterProduct) result = result.filter(b => b.item_details?.[billFilterProduct]);
    if (billFilterStatus) {
        if (billFilterStatus === 'Chua TT') {
            result = result.filter(b => b.status === 'Chưa TT');
        } else if (billFilterStatus === 'Chuyen Khoan') {
            result = result.filter(b => b.status !== 'Chưa TT' && (String(b.payment_method).includes('Chuyển Khoản') || String(b.payment_method).includes('Chuyen Khoan')));
        } else if (billFilterStatus === 'Tien Mat') {
            result = result.filter(b => b.status !== 'Chưa TT' && (String(b.payment_method).includes('Tiền Mặt') || String(b.payment_method).includes('Tien Mat')));
        }
    }
    return sortData(result, billSort);
  }, [bills, billFilterProduct, billFilterStatus, billSort]);

  const summary = useMemo(() => {
    let total = 0, transfer = 0, cash = 0, unpaid = 0;
    filteredBills.forEach(b => {
        const amt = Number(b.total_amount || 0);
        total += amt;
        if (b.status === 'Chưa TT') {
            unpaid += amt;
        } else {
            if (b.payment_method === 'Chuyển Khoản' || b.payment_method === 'Chuyen Khoan') transfer += amt;
            else cash += amt;
        }
    });
    return { total, transfer, cash, unpaid };
  }, [filteredBills]);

  const sortedDrivers = useMemo(() => sortData(drivers, driverSort), [drivers, driverSort]);
  const sortedSales = useMemo(() => sortData(sales, saleSort), [sales, saleSort]);

  const deleteBill = async (id) => {
    if (window.confirm(`Xóa Hóa Đơn ${id}?`)) {
      await axios.delete(`/api/admin/bills/${id}`);
      loadBills();
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredBills.length / billPageSize));
  const pagedBills = filteredBills.slice((billPage - 1) * billPageSize, billPage * billPageSize);

  const totalDriverPages = Math.max(1, Math.ceil(sortedDrivers.length / driverPageSize));
  const pagedDrivers = sortedDrivers.slice((driverPage - 1) * driverPageSize, driverPage * driverPageSize);

  const billFormTotal = useMemo(() => {
    return Object.entries(billForm.services).reduce((sum, [code, qty]) => {
        const p = products.find(prod => prod.code === code);
        return sum + (Number(qty) * (p?.unit_price || 0));
    }, 0);
  }, [billForm.services, products]);

  const API_BASE = axios.defaults.baseURL || '';

  return (
    <Page>
      <Header>
        <Title>{user?.username || 'Admin'}</Title>
        <LogoutBtn onClick={onLogout}><FaSignOutAlt /> Đăng Xuất</LogoutBtn>
      </Header>

      <TabRow>
        <TabBtn $active={activeTab === Tabs.bills} onClick={() => setActiveTab(Tabs.bills)}><FaFileInvoice /><span>Doanh Thu</span></TabBtn>
        <TabBtn $active={activeTab === Tabs.inventory} onClick={() => setActiveTab(Tabs.inventory)}><FaBoxes /><span>Kho Hàng</span></TabBtn>
        <TabBtn $active={activeTab === Tabs.drivers} onClick={() => setActiveTab(Tabs.drivers)}><FaIdCard /><span>Tài Xế</span></TabBtn>
        <TabBtn $active={activeTab === Tabs.sales} onClick={() => setActiveTab(Tabs.sales)}><FaUsers /><span>Sale</span></TabBtn>
      </TabRow>

      <Body>
        {message && <Card><Small style={{color: '#0a66c2', fontWeight: 700, padding: '5px 0'}}>{message}</Small></Card>}

        {activeTab === Tabs.bills && (
          <>
            <div style={{marginBottom: 10}}>
                <Btn onClick={() => {
                    setBillForm(prev => ({ ...prev, sale_username: user.username, htx: htxOptions[0] || '' }));
                    setShowBillModal(true);
                }} style={{marginRight: 10}}><FaPlus /> Tạo Hóa Đơn</Btn>
                <Btn $secondary onClick={() => {
                  const ws = XLSX.utils.json_to_sheet(filteredBills);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "Bills");
                  XLSX.writeFile(wb, "doanh-thu.xlsx");
                }}>Xuất Excel</Btn>
            </div>

            <FilterGrid>
                <InputGroup><Small>HTX</Small><Select value={billFilterHtx} onChange={e => setBillFilterHtx(e.target.value)}><option value="">Tất Cả HTX</option>{htxOptions.map(h => <option key={h} value={h}>{h}</option>)}</Select></InputGroup>
                <InputGroup><Small>Sale</Small><Select value={billFilterSale} onChange={e => setBillFilterSale(e.target.value)}><option value="">Tất Cả Sale</option>{sales.map(s => <option key={s.username} value={s.username}>{s.full_name || s.username}</option>)}</Select></InputGroup>
                <InputGroup><Small>Loại Sản Phẩm</Small><Select value={billFilterProduct} onChange={e => setBillFilterProduct(e.target.value)}><option value="">Tất Cả Loại</option>{products.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}</Select></InputGroup>
                <InputGroup><Small>Trạng Thái TT</Small><Select value={billFilterStatus} onChange={e => setBillFilterStatus(e.target.value)}><option value="">Tất Cả</option><option value="Chuyen Khoan">Chuyển Khoản</option><option value="Tien Mat">Tiền Mặt</option><option value="Chua TT">Chưa TT</option></Select></InputGroup>
                <InputGroup><Small>Từ Ngày</Small><DateInput type="date" value={billDateFrom} onChange={e => setBillDateFrom(e.target.value)} /></InputGroup>
                <InputGroup><Small>Đến Ngày</Small><DateInput type="date" value={billDateTo} onChange={e => setBillDateTo(e.target.value)} /></InputGroup>
                <Btn onClick={loadBills} style={{height: 42, padding: '0 25px'}}>Lọc</Btn>
            </FilterGrid>

            <SummaryBox>
                <SummaryItem><SummaryLabel>Tổng Doanh Thu</SummaryLabel><SummaryValue>{formatMoneyInput(summary.total)}</SummaryValue></SummaryItem>
                <SummaryItem><SummaryLabel>Chuyển Khoản</SummaryLabel><SummaryValue $color="#ff6a2a">{formatMoneyInput(summary.transfer)}</SummaryValue></SummaryItem>
                <SummaryItem><SummaryLabel>Tiền Mặt</SummaryLabel><SummaryValue $color="#0a66c2">{formatMoneyInput(summary.cash)}</SummaryValue></SummaryItem>
                <SummaryItem><SummaryLabel>Chưa TT</SummaryLabel><SummaryValue $color="#dc3545">{formatMoneyInput(summary.unpaid)}</SummaryValue></SummaryItem>
            </SummaryBox>

            <Card>
              <div style={{ overflowX: 'auto' }}>
                <Table style={{ minWidth: 1600, fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <Th onClick={() => handleSort('bills', 'id')}>STT <SortIcon sort={billSort} field="id" /></Th>
                      <Th onClick={() => handleSort('bills', 'htx')}>HTX <SortIcon sort={billSort} field="htx" /></Th>
                      <Th onClick={() => handleSort('bills', 'sale_username')}>SALE <SortIcon sort={billSort} field="sale_username" /></Th>
                      <Th onClick={() => handleSort('bills', 'driver_name')}>HỌ & TÊN <SortIcon sort={billSort} field="driver_name" /></Th>
                      <Th onClick={() => handleSort('bills', 'phone')}>SĐT <SortIcon sort={billSort} field="phone" /></Th>
                      <Th onClick={() => handleSort('bills', 'license_plate')}>BIỂN SỐ XE <SortIcon sort={billSort} field="license_plate" /></Th>
                      <Th style={{background: '#ddd'}} onClick={() => handleSort('bills', 'payment_method')}>THANH TOÁN <SortIcon sort={billSort} field="payment_method" /></Th>
                      <Th style={{background: '#ddd'}} onClick={() => handleSort('bills', 'transfer_date')}>NGÀY CK <SortIcon sort={billSort} field="transfer_date" /></Th>
                      <Th onClick={() => handleSort('bills', 'total_amount')}>SỐ TIỀN <SortIcon sort={billSort} field="total_amount" /></Th>
                      {activeProducts.map(p => <Th key={p.code} style={{background: '#ddd'}}>{p.name.toUpperCase()} <SortIcon sort={billSort} field={p.code} /></Th>)}
                      <Th>GHI CHÚ</Th><Th>THAO TÁC</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedBills.map((b, i) => (
                      <tr key={b.id}>
                        <Td>{(billPage - 1) * billPageSize + i + 1}</Td>
                        <Td><HtxPill {...getHtxPillStyle(b.htx)}>{b.htx}</HtxPill></Td>
                        <Td><Small>{b.sale_username?.toUpperCase()}</Small></Td>
                        <Td><strong>{b.driver_name}</strong></Td>
                        <Td>{b.phone}</Td>
                        <Td>{b.license_plate}</Td>
                        <Td style={{
                            background: '#ddd', 
                            cursor: (b.payment_method?.includes('Chuyển Khoản') || b.payment_method?.includes('Chuyen Khoan') || b.bill_image_path) ? 'pointer' : 'default', 
                            color: (b.payment_method?.includes('Chuyển Khoản') || b.payment_method?.includes('Chuyen Khoan') || b.bill_image_path) ? '#007bff' : 'inherit', 
                            textDecoration: (b.payment_method?.includes('Chuyển Khoản') || b.payment_method?.includes('Chuyen Khoan') || b.bill_image_path) ? 'underline' : 'none'
                        }} onClick={() => {
                            if (b.payment_method?.includes('Chuyển Khoản') || b.payment_method?.includes('Chuyen Khoan')) {
                                setPreviewImage(b.bill_image_path || 'NO_IMAGE');
                            } else if (b.bill_image_path) {
                                setPreviewImage(b.bill_image_path);
                            }
                        }}>
                            {b.payment_method === 'Chưa TT' ? <span style={{color: '#dc3545', fontWeight: 'bold'}}>{b.payment_method}</span> : b.payment_method} 
                            {b.status === 'Chưa TT' && b.payment_method !== 'Chưa TT' && <span style={{color:'#dc3545', fontWeight:'bold'}}>(Chưa TT)</span>} 
                            {b.bill_image_path && <FaCamera style={{marginLeft: 4, verticalAlign: 'middle'}} />}
                        </Td>
                        <Td style={{background: '#ddd'}}><Small>{b.transfer_date || '-'}</Small></Td>
                        <Td><strong>{formatMoneyInput(b.total_amount)}</strong></Td>
                        {activeProducts.map(p => <Td key={p.code} style={{background: '#ddd'}}>{b.item_details?.[p.code] || 0}</Td>)}
                        <Td><Small>{b.details || b.note}</Small></Td>
                        <Td><ActionRow>
                            <IconBtn title="Xem/In" onClick={() => navigate(`/bill/${b.id}`)}><FaCamera /></IconBtn>
                            <IconBtn title="Sửa" onClick={() => openEditBill(b)}><FaEdit /></IconBtn>
                            <IconBtn title="Xóa" onClick={() => deleteBill(b.id)}><FaTrashAlt /></IconBtn>
                        </ActionRow></Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <PagerRow>
                <Small style={{whiteSpace: 'nowrap'}}>Hiển thị {pagedBills.length} / {filteredBills.length} đơn hàng</Small>
                <div style={{display: 'flex', alignItems: 'center', gap: 15, flexWrap: 'nowrap'}}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}><Small>Số dòng:</Small><select value={billPageSize} onChange={e => { setBillPageSize(Number(e.target.value)); setBillPage(1); }} style={{ padding: '2px 4px', borderRadius: 4, border: '1px solid #ced6e8', fontSize: '0.75rem' }}>{[50, 100, 150, 200].map(sz => <option key={sz} value={sz}>{sz}</option>)}</select></div>
                    <div style={{display: 'flex', gap: 5}}><PageBtn disabled={billPage === 1} onClick={() => setBillPage(p => p - 1)}>&lt;</PageBtn>{[...Array(totalPages)].map((_, i) => <PageBtn key={i} $active={billPage === i + 1} onClick={() => setBillPage(i + 1)}>{i + 1}</PageBtn>)}<PageBtn disabled={billPage === totalPages} onClick={() => setBillPage(p => p + 1)}>&gt;</PageBtn></div>
                </div>
              </PagerRow>
            </Card>
          </>
        )}

        {activeTab === Tabs.inventory && (
          <>
            <Card><div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><HtxTitle style={{border: 'none', margin: 0}}>Cài Đặt Sản Phẩm & Giá Theo HTX</HtxTitle><Btn onClick={() => setShowProductModal(true)}><FaPlus /> Thêm Loại SP</Btn></div></Card>
            <Card><Table><thead><tr><Th style={{ width: 50 }}>Hiện</Th><Th>Sản Phẩm</Th><Th>Mã</Th><Th>Giá Gốc</Th><Th>Thao Tác</Th></tr></thead><tbody>{products.map((p) => (<tr key={p.id}><Td><input type="checkbox" checked={!!p.is_active} onChange={e => axios.put(`/api/admin/products/${p.id}`, {...p, is_active: e.target.checked}).then(loadInventory)} /></Td><Td><strong>{p.name}</strong></Td><Td><Small>{p.code}</Small></Td><Td>{formatMoneyInput(p.unit_price)}</Td><Td><ActionRow><IconBtn onClick={() => { setEditingProduct(p); setProductForm({name: p.name, unit_price: p.unit_price, sort_order: p.sort_order}); setShowProductModal(true); }}><FaEdit /></IconBtn><IconBtn onClick={() => !p.is_core && axios.delete(`/api/admin/products/${p.id}`).then(loadInventory)}><FaTrashAlt /></IconBtn></ActionRow></Td></tr>))}</tbody></Table></Card>
            <Card style={{position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}><CenterRow><Btn style={{width: '100%', maxWidth: 400}} onClick={() => { const tasks = Object.entries(inventoryDraft).map(([htx, data]) => axios.put('/api/admin/inventory', { htx, stocks: data.stocks, prices: data.prices })); Promise.all(tasks).then(() => { loadInventory(); setMessage('Đã Cập Nhật Kho Hàng & Giá Riêng.'); }); }}>LƯU TẤT CẢ GIÁ & TỒN KHO HTX</Btn></CenterRow></Card>
            <InventoryGrid>{inventoryRows.map(htx => (<Card key={htx.name}><HtxTitle>{htx.name}</HtxTitle>{activeProducts.map(p => (<StockItemBox key={p.code}><StockItemHeader>{p.name}</StockItemHeader><StockInputs><InputGroup><Small>Giá Riêng (VNĐ)</Small><Input value={formatMoneyInput(inventoryDraft[htx.name]?.prices[p.code]).replace('đ', '')} onChange={e => { const val = parseMoneyInput(e.target.value); setInventoryDraft(prev => ({ ...prev, [htx.name]: { ...prev[htx.name], prices: { ...prev[htx.name].prices, [p.code]: val } } })); }} /></InputGroup><InputGroup><Small>Tồn Kho</Small><StockEditWrap><Btn $secondary onClick={() => { const val = Math.max(0, (inventoryDraft[htx.name]?.stocks[p.code] || 0) - 1); setInventoryDraft(prev => ({ ...prev, [htx.name]: { ...prev[htx.name], stocks: { ...prev[htx.name].stocks, [p.code]: val } } })); }}>-</Btn><Input value={inventoryDraft[htx.name]?.stocks[p.code] || 0} onChange={e => { const val = Number(e.target.value || 0); setInventoryDraft(prev => ({ ...prev, [htx.name]: { ...prev[htx.name], stocks: { ...prev[htx.name].stocks, [p.code]: val } } })); }} /><Btn $secondary onClick={() => { const val = (inventoryDraft[htx.name]?.stocks[p.code] || 0) + 1; setInventoryDraft(prev => ({ ...prev, [htx.name]: { ...prev[htx.name], stocks: { ...prev[htx.name].stocks, [p.code]: val } } })); }}>+</Btn></StockEditWrap></InputGroup></StockInputs></StockItemBox>))}</Card>))}</InventoryGrid>
          </>
        )}

        {activeTab === Tabs.drivers && (
          <>
            <Card><Row><InputGroup><Small>Lọc Theo HTX</Small><Select value={driverFilterHtx} onChange={e => setDriverFilterHtx(e.target.value)}><option value="">Tất Cả HTX</option>{htxOptions.map(h => <option key={h} value={h}>{h}</option>)}</Select></InputGroup><InputGroup><Small>Tìm Nhanh (Biển Số / Tên / Số Điện Thoại)</Small><div style={{display: 'flex', gap: 5}}><Input placeholder="Nhập Từ Khóa..." value={driverQuery} onChange={e => setDriverQuery(e.target.value)} /><Btn onClick={loadDrivers}><FaSearch /></Btn></div></InputGroup></Row></Card>
            <Card><Table><thead><tr><Th>STT</Th><Th onClick={() => handleSort('drivers', 'driver_name')}>Tên Tài Xế <SortIcon sort={driverSort} field="driver_name" /></Th><Th onClick={() => handleSort('drivers', 'license_plate')}>Biển Số <SortIcon sort={driverSort} field="license_plate" /></Th><Th onClick={() => handleSort('drivers', 'phone')}>SĐT <SortIcon sort={driverSort} field="phone" /></Th><Th onClick={() => handleSort('drivers', 'htx')}>HTX <SortIcon sort={driverSort} field="htx" /></Th><Th>Thao Tác</Th></tr></thead><tbody>{pagedDrivers.map((d, i) => (<tr key={i}><Td>{(driverPage - 1) * driverPageSize + i + 1}</Td><Td><strong>{d.driver_name || 'N/A'}</strong></Td><Td>{d.license_plate}</Td><Td>{d.phone}</Td><Td><HtxPill {...getHtxPillStyle(d.htx)}>{d.htx}</HtxPill></Td><Td><ActionRow><IconBtn><FaTrashAlt /></IconBtn></ActionRow></Td></tr>))}{pagedDrivers.length === 0 && <tr><Td colSpan="6" style={{textAlign: 'center'}}>Chưa tìm thấy tài xế nào</Td></tr>}</tbody></Table><PagerRow><Small style={{whiteSpace: 'nowrap'}}>Hiển thị {pagedDrivers.length} / {sortedDrivers.length} tài xế</Small><div style={{display: 'flex', alignItems: 'center', gap: 15, flexWrap: 'nowrap'}}><div style={{ display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}><Small>Số dòng:</Small><select value={driverPageSize} onChange={e => { setDriverPageSize(Number(e.target.value)); setDriverPage(1); }} style={{ padding: '2px 4px', borderRadius: 4, border: '1px solid #ced6e8', fontSize: '0.75rem' }}>{[50, 100, 150, 200].map(sz => <option key={sz} value={sz}>{sz}</option>)}</select></div><div style={{display: 'flex', gap: 5}}><PageBtn disabled={driverPage === 1} onClick={() => setDriverPage(p => p - 1)}>&lt;</PageBtn>{[...Array(totalDriverPages)].map((_, i) => <PageBtn key={i} $active={driverPage === i + 1} onClick={() => setDriverPage(i + 1)}>{i + 1}</PageBtn>)}<PageBtn disabled={driverPage === totalDriverPages} onClick={() => setDriverPage(p => p + 1)}>&gt;</PageBtn></div></div></PagerRow></Card>
          </>
        )}

        {activeTab === Tabs.sales && (
          <>
             <Card><HtxTitle>Thêm Sale</HtxTitle><div style={{display: 'flex', gap: 10, alignItems: 'end', marginBottom: 15, flexWrap: 'nowrap', overflowX: 'auto'}}><InputGroup style={{flex: 1, minWidth: 150}}><Small>Tên Đăng Nhập</Small><Input value={saleForm.username} onChange={e => setSaleForm({...saleForm, username: e.target.value})} /></InputGroup><InputGroup style={{flex: 1, minWidth: 150}}><Small>Mật Khẩu</Small><Input value={saleForm.password} onChange={e => setSaleForm({...saleForm, password: e.target.value})} /></InputGroup><InputGroup style={{flex: 1, minWidth: 150}}><Small>Tên Sale</Small><Input value={saleForm.full_name} onChange={e => setSaleForm({...saleForm, full_name: e.target.value})} /></InputGroup><InputGroup style={{flex: 1, minWidth: 150}}><Small>Số Điện Thoại</Small><Input value={saleForm.phone} onChange={e => setSaleForm({...saleForm, phone: e.target.value})} /></InputGroup><Btn onClick={handleCreateSale} style={{height: 42, whiteSpace: 'nowrap'}}><FaPlus /> Thêm Sale</Btn></div></Card>
             <Card><Table><thead><tr><Th onClick={() => handleSort('sales', 'id')}>ID <SortIcon sort={saleSort} field="id" /></Th><Th onClick={() => handleSort('sales', 'username')}>Tên Đăng Nhập <SortIcon sort={saleSort} field="username" /></Th><Th>Mật Khẩu</Th><Th onClick={() => handleSort('sales', 'full_name')}>Tên <SortIcon sort={saleSort} field="full_name" /></Th><Th onClick={() => handleSort('sales', 'phone')}>SĐT <SortIcon sort={saleSort} field="phone" /></Th><Th>Thao Tác</Th></tr></thead><tbody>{sortedSales.map(s => (<tr key={s.id}><Td>{s.id}</Td><Td><strong>{s.username}</strong></Td><Td>{s.password || '123456'}</Td><Td>{s.full_name}</Td><Td>{s.phone}</Td><Td><ActionRow><IconBtn><FaEdit /></IconBtn><IconBtn onClick={() => deleteSale(s.id)}><FaTrashAlt /></IconBtn></ActionRow></Td></tr>))}</tbody></Table></Card>
          </>
        )}
      </Body>

      {/* BILL MODAL */}
      {showBillModal && (
        <ModalOverlay onClick={() => { setShowBillModal(false); setEditingBillId(null); }}>
            <ModalCard onClick={e => e.stopPropagation()} style={{ width: 650 }}>
                <ModalTitle>{editingBillId ? 'Cập Nhật Hóa Đơn' : 'Tạo Hóa Đơn'}</ModalTitle>
                <ModalText>Nhập thông tin hóa đơn. Nếu CK vui lòng chọn ngày và upload bill.</ModalText>
                
                <FormGrid2>
                    <InputGroup><Small>Họ & Tên</Small><Input value={billForm.driver_name} onChange={e => setBillForm({...billForm, driver_name: e.target.value})} /></InputGroup>
                    <InputGroup><Small>HTX</Small><Select value={billForm.htx} onChange={e => setBillForm({...billForm, htx: e.target.value})}>{htxOptions.map(h => <option key={h} value={h}>{h}</option>)}</Select></InputGroup>
                </FormGrid2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 10 }}>
                    <InputGroup><Small>SĐT</Small><Input value={billForm.phone} onChange={e => setBillForm({...billForm, phone: e.target.value})} /></InputGroup>
                    <InputGroup><Small>Biển Số</Small><Input value={billForm.license_plate} onChange={e => setBillForm({...billForm, license_plate: e.target.value})} /></InputGroup>
                    <InputGroup><Small>Sale</Small><Select value={billForm.sale_username} onChange={e => setBillForm({...billForm, sale_username: e.target.value})}>{sales.map(s => <option key={s.username} value={s.username}>{s.full_name || s.username}</option>)}</Select></InputGroup>
                </div>

                <FormGrid2 style={{ marginTop: 15 }}>
                    {activeProducts.map(p => (
                        <InputGroup key={p.code}><Small>{p.name}</Small><Input type="number" value={billForm.services[p.code] || 0} onChange={e => setBillForm({ ...billForm, services: { ...billForm.services, [p.code]: Number(e.target.value) } })} /></InputGroup>
                    ))}
                </FormGrid2>

                <div style={{ marginTop: 15 }}>
                    <Small>Thanh Toán</Small>
                    <div style={{ display: 'flex', gap: 20, marginTop: 5 }}>
                        {['Chuyển Khoản', 'Tiền Mặt', 'Chưa TT'].map(m => (
                            <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}><input type="radio" checked={billForm.payment_method === m} onChange={() => setBillForm({...billForm, payment_method: m})} /> {m}</label>
                        ))}
                    </div>
                </div>

                {billForm.payment_method === 'Chuyển Khoản' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 15 }}>
                        <InputGroup><Small>Ngày Chuyển Khoản</Small><DateInput type="date" value={billForm.transfer_date} onChange={e => setBillForm({...billForm, transfer_date: e.target.value})} /></InputGroup>
                        <InputGroup><Small>Upload Bill (Ảnh)</Small><label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px', border: '1px dashed #ced6e8', borderRadius: 10, cursor: 'pointer', background: '#f8fafc', justifyContent: 'center' }}><FaUpload /> {billForm.bill_image ? 'Đã chọn' : 'Chọn ảnh'}<input type="file" accept="image/*" style={{display: 'none'}} onChange={e => setBillForm({...billForm, bill_image: e.target.files[0]})} /></label></InputGroup>
                    </div>
                )}

                <div style={{ marginTop: 15 }}><Small>Tổng Tiền Tạm Tính</Small><Input value={formatMoneyInput(billFormTotal)} disabled style={{ background: '#f8fafc', textAlign: 'center', fontSize: '1.1rem', color: '#1f2d47' }} /></div>
                <div style={{ marginTop: 15 }}><Small>Ghi Chú</Small><TextArea value={billForm.note} onChange={e => setBillForm({...billForm, note: e.target.value})} placeholder="Chi tiết..." /></div>

                <ModalActions>
                    <Btn $secondary onClick={() => { setShowBillModal(false); setEditingBillId(null); }}>Hủy</Btn>
                    <Btn onClick={handleSaveBill}>{editingBillId ? 'Cập Nhật' : 'Tạo'}</Btn>
                </ModalActions>
            </ModalCard>
        </ModalOverlay>
      )}

      {/* PREVIEW IMAGE MODAL */}
      {previewImage && (
        <ModalOverlay onClick={() => setPreviewImage(null)}>
            <ModalCard onClick={e => e.stopPropagation()} style={{ width: 'fit-content', textAlign: 'center', minWidth: 300 }}>
                <ModalTitle>Ảnh Chuyển Khoản</ModalTitle>
                {previewImage === 'NO_IMAGE' ? (
                    <div style={{ padding: '30px 10px', color: '#dc3545', fontWeight: 'bold', fontSize: '1rem' }}>
                        Không có hình ảnh chuyển khoản
                    </div>
                ) : (
                    <img src={previewImage.startsWith('http') ? previewImage : `${API_BASE}${previewImage}`} alt="Bill" style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8, marginTop: 10 }} />
                )}
                <ModalActions><Btn onClick={() => setPreviewImage(null)}>Đóng</Btn></ModalActions>
            </ModalCard>
        </ModalOverlay>
      )}

      {/* PRODUCT MODAL */}
      {showProductModal && (
        <ModalOverlay onClick={() => setShowProductModal(false)}>
          <ModalCard onClick={e => e.stopPropagation()}>
            <ModalTitle>{editingProduct ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</ModalTitle>
            <div style={{ marginBottom: 12 }}><Small>Tên Sản Phẩm</Small><Input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} /></div>
            <div style={{ marginBottom: 12 }}><Small>Giá Gốc</Small><Input value={formatMoneyInput(productForm.unit_price).replace('đ', '')} onChange={e => setProductForm({...productForm, unit_price: parseMoneyInput(e.target.value)})} /></div>
            <div style={{ marginBottom: 12 }}><Small>Thứ Tự</Small><Input type="number" value={productForm.sort_order} onChange={e => setProductForm({...productForm, sort_order: e.target.value})} /></div>
            <ModalActions><Btn $secondary onClick={() => setShowProductModal(false)}>Hủy</Btn><Btn onClick={() => { if (editingProduct) { axios.put(`/api/admin/products/${editingProduct.id}`, { ...editingProduct, ...productForm }).then(() => { loadInventory(); setShowProductModal(false); setMessage('Đã Lưu Sản Phẩm.'); }); } else { axios.post('/api/admin/products', productForm).then(() => { loadInventory(); setShowProductModal(false); setMessage('Đã Lưu Sản Phẩm.'); }); } }}>Lưu Thay Đổi</Btn></ModalActions>
          </ModalCard>
        </ModalOverlay>
      )}
    </Page>
  );
}

export default SaleAdminPanel;
