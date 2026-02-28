import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FaBoxes, FaEdit, FaFileInvoice, FaIdCard, FaPlus, FaSearch, FaSignOutAlt, FaTrashAlt, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Page = styled.div`
  min-height: 100vh;
  max-width: 980px;
  margin: 0 auto;
  background: #f4f6fb;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
`;

const Header = styled.div`
  background: #08254e;
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

const TripleRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
`;

const Input = styled.input`
  width: 100%;
  border: 1px solid #ced6e8;
  border-radius: 10px;
  padding: 8px 10px;
  text-align: center;
  font-weight: 700;
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
`;

const Td = styled.td`
  border-bottom: 1px solid #edf1f8;
  padding: 8px 6px;
  color: #1f2d47;
`;

const ClickableTr = styled.tr`
  cursor: pointer;
  &:hover {
    background: #f5f9ff;
  }
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
  width: min(92vw, 360px);
  background: #fff;
  border: 1px solid #dfe5f1;
  border-radius: 14px;
  padding: 14px;
`;

const ModalTitle = styled.div`
  font-size: 1rem;
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
`;

const CenterRow = styled.div`
  display: flex;
  justify-content: center;
`;

const SearchInline = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
`;

const SearchLabel = styled.div`
  font-size: 0.84rem;
  color: #5f6f8f;
  white-space: nowrap;
  margin-bottom: 6px;
`;

const SearchInput = styled(Input)`
  flex: 1;
  min-width: 0;
`;

const InventoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 10px;
`;

const HtxTitle = styled.div`
  font-weight: 700;
  color: #1f2d47;
  margin-bottom: 10px;
`;

const StockRow = styled.div`
  display: grid;
  grid-template-columns: 110px 1fr;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const StockLabel = styled.div`
  font-size: 0.88rem;
  color: #5f6f8f;
`;

const StockEdit = styled.div`
  display: grid;
  grid-template-columns: 36px 1fr 36px;
  gap: 6px;
`;

const Tabs = {
  inventory: 'inventory',
  bills: 'bills',
  drivers: 'drivers',
  sales: 'sales',
};

function SaleAdminPanel({ onLogout, user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(Tabs.inventory);
  const [inventoryRows, setInventoryRows] = useState([]);
  const [inventoryDraft, setInventoryDraft] = useState({});
  const [pricingDraft, setPricingDraft] = useState({ logo_price: 50000, card_price: 50000, tshirt_price: 50000 });

  const [bills, setBills] = useState([]);
  const [billFilterSale, setBillFilterSale] = useState('');
  const [billDateFrom, setBillDateFrom] = useState('');
  const [billDateTo, setBillDateTo] = useState('');

  const [drivers, setDrivers] = useState([]);
  const [driverQuery, setDriverQuery] = useState('');

  const [sales, setSales] = useState([]);
  const [saleForm, setSaleForm] = useState({ username: '', full_name: '', phone: '' });
  const [editingSale, setEditingSale] = useState(null);
  const [pendingDeleteSaleId, setPendingDeleteSaleId] = useState(null);
  const [pendingClearInventory, setPendingClearInventory] = useState(false);
  const [message, setMessage] = useState('');

  const parseMoneyInput = (raw) => {
    const clean = String(raw ?? '').replace(/[^\d]/g, '');
    return Math.max(0, Number(clean || 0));
  };

  const formatMoneyInput = (value) => Number(value || 0).toLocaleString('en-US');

  const saleOptions = useMemo(
    () => sales.map((s) => ({ username: s.username, label: s.full_name || s.username })),
    [sales]
  );

  const billTotals = useMemo(() => {
    const logoPrice = Number(pricingDraft.logo_price || 0);
    const cardPrice = Number(pricingDraft.card_price || 0);
    const tshirtPrice = Number(pricingDraft.tshirt_price || 0);
    const normalizePayment = (value) => String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    return bills.reduce(
      (acc, b) => {
        const logoMoney = (Number(b.logo_qty) || 0) * logoPrice;
        const cardMoney = (Number(b.card_qty) || 0) * cardPrice;
        const tshirtMoney = (Number(b.tshirt_qty) || 0) * tshirtPrice;
        const rowTotal = Number(b.total_amount) || (logoMoney + cardMoney + tshirtMoney);
        acc.total += rowTotal;
        acc.logo += logoMoney;
        acc.card += cardMoney;
        acc.tshirt += tshirtMoney;
        const pm = normalizePayment(b.payment_method);
        if (pm.includes('chuyen khoan')) {
          acc.transfer += rowTotal;
        } else if (pm.includes('tien mat')) {
          acc.cash += rowTotal;
        }
        return acc;
      },
      { total: 0, logo: 0, card: 0, tshirt: 0, transfer: 0, cash: 0 }
    );
  }, [bills, pricingDraft]);

  const loadInventory = async () => {
    const res = await axios.get('/api/admin/inventory');
    const rows = Array.isArray(res.data) ? res.data : [];
    setInventoryRows(rows);
    const draft = {};
    rows.forEach((r) => {
      draft[r.name] = {
        logo_stock: Number(r.logo_stock || 0),
        card_stock: Number(r.card_stock || 0),
        tshirt_stock: Number(r.tshirt_stock || 0),
      };
    });
    setInventoryDraft(draft);
  };

  const loadSales = async () => {
    const res = await axios.get('/api/admin/sale_users');
    setSales(Array.isArray(res.data) ? res.data : []);
  };

  const loadPricing = async () => {
    const res = await axios.get('/api/admin/pricing');
    setPricingDraft({
      logo_price: Number(res.data?.logo_price || 50000),
      card_price: Number(res.data?.card_price || 50000),
      tshirt_price: Number(res.data?.tshirt_price || 50000),
    });
  };

  const loadBills = async () => {
    const params = new URLSearchParams();
    if (billFilterSale) params.set('sale_username', billFilterSale);
    if (billDateFrom) params.set('date_from', billDateFrom);
    if (billDateTo) params.set('date_to', billDateTo);
    const res = await axios.get(`/api/admin/bills?${params.toString()}`);
    setBills(Array.isArray(res.data) ? res.data : []);
  };

  const loadDrivers = async () => {
    const q = encodeURIComponent(driverQuery || '');
    const res = await axios.get(`/api/admin/drivers?query=${q}`);
    setDrivers(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    loadInventory().catch(() => setMessage('Không tải được kho hàng.'));
    loadSales().catch(() => setMessage('Không tải được danh sách sale.'));
    loadPricing().catch(() => setMessage('Không tải được giá sản phẩm.'));
  }, []);

  useEffect(() => {
    if (activeTab === Tabs.bills) {
      loadSales().catch(() => setMessage('Không tải được danh sách sale.'));
      loadPricing().catch(() => setMessage('Không tải được giá sản phẩm.'));
      loadBills().catch(() => setMessage('Không tải được hóa đơn.'));
    }
    if (activeTab === Tabs.drivers) {
      loadDrivers().catch(() => setMessage('Không tải được danh sách tài xế.'));
    }
    if (activeTab === Tabs.sales) {
      loadSales().catch(() => setMessage('Không tải được danh sách sale.'));
    }
  }, [activeTab]);

  const adjustStock = (htxName, key, delta) => {
    setInventoryDraft((prev) => {
      const curr = prev[htxName] || { logo_stock: 0, card_stock: 0, tshirt_stock: 0 };
      const nextVal = Math.max(0, Number(curr[key] || 0) + delta);
      return {
        ...prev,
        [htxName]: {
          ...curr,
          [key]: nextVal,
        },
      };
    });
  };

  const updateAllInventory = async () => {
    await axios.put('/api/admin/pricing', {
      logo_price: Math.max(0, Number(pricingDraft.logo_price || 0)),
      card_price: Math.max(0, Number(pricingDraft.card_price || 0)),
      tshirt_price: Math.max(0, Number(pricingDraft.tshirt_price || 0)),
    });
    const tasks = Object.entries(inventoryDraft).map(([htx, val]) =>
      axios.put('/api/admin/inventory', {
        htx,
        logo_stock: Math.max(0, Number(val.logo_stock || 0)),
        card_stock: Math.max(0, Number(val.card_stock || 0)),
        tshirt_stock: Math.max(0, Number(val.tshirt_stock || 0)),
      })
    );
    await Promise.all(tasks);
    await loadInventory();
    await loadPricing();
    setMessage('Đã cập nhật kho hàng và giá sản phẩm.');
  };

  const clearAllInventory = async () => {
    const tasks = inventoryRows.map((row) =>
      axios.put('/api/admin/inventory', {
        htx: row.name,
        logo_stock: 0,
        card_stock: 0,
        tshirt_stock: 0,
      })
    );
    await Promise.all(tasks);
    await loadInventory();
    setMessage('Đã xóa trống toàn bộ kho hàng.');
  };

  const adjustPricing = (key, delta) => {
    setPricingDraft((prev) => ({
      ...prev,
      [key]: Math.max(0, Number(prev[key] || 0) + delta),
    }));
  };

  const onPricingInputChange = (key, rawValue) => {
    setPricingDraft((prev) => ({
      ...prev,
      [key]: parseMoneyInput(rawValue),
    }));
  };

  const saveSale = async () => {
    if (!saleForm.username.trim()) return;
    if (editingSale) {
      await axios.put(`/api/admin/sale_users/${editingSale.id}`, saleForm);
    } else {
      await axios.post('/api/admin/sale_users', saleForm);
    }
    setSaleForm({ username: '', full_name: '', phone: '' });
    setEditingSale(null);
    await loadSales();
    setMessage('Đã lưu sale.');
  };

  const deleteSale = async (id) => {
    await axios.delete(`/api/admin/sale_users/${id}`);
    await loadSales();
    setMessage('Đã xóa sale.');
  };

  const openEditSale = (sale) => {
    setEditingSale(sale);
    setSaleForm({
      username: sale.username || '',
      full_name: sale.full_name || '',
      phone: sale.phone || '',
    });
  };

  return (
    <Page>
      <Header>
        <Title>{user?.username || 'admin'}</Title>
        <LogoutBtn onClick={onLogout}>
          <FaSignOutAlt /> Logout
        </LogoutBtn>
      </Header>

      <TabRow>
        <TabBtn $active={activeTab === Tabs.bills} onClick={() => setActiveTab(Tabs.bills)}>
          <FaFileInvoice />
          <span style={{ whiteSpace: 'nowrap' }}>Doanh thu</span>
        </TabBtn>
        <TabBtn $active={activeTab === Tabs.inventory} onClick={() => setActiveTab(Tabs.inventory)}>
          <FaBoxes />
          <span>Kho hàng</span>
        </TabBtn>
        <TabBtn $active={activeTab === Tabs.drivers} onClick={() => setActiveTab(Tabs.drivers)}>
          <FaIdCard />
          <span>Tài xế</span>
        </TabBtn>
        <TabBtn $active={activeTab === Tabs.sales} onClick={() => setActiveTab(Tabs.sales)}>
          <FaUsers />
          <span>Sale</span>
        </TabBtn>
      </TabRow>

      <Body>
        {message && (
          <Card>
            <Small>{message}</Small>
          </Card>
        )}

        {activeTab === Tabs.inventory && (
          <>
            <Card>
              <CenterRow>
                <Btn onClick={updateAllInventory}>Lưu kho hàng</Btn>
                <Btn
                  $secondary
                  onClick={() => setPendingClearInventory(true)}
                  style={{ marginLeft: 8 }}
                >
                  Xóa trống kho hàng
                </Btn>
              </CenterRow>
            </Card>

            <Card>
              <HtxTitle>Giá sản phẩm</HtxTitle>
              <StockRow>
                <StockLabel>Giá Logo</StockLabel>
                <StockEdit>
                  <Btn $secondary onClick={() => adjustPricing('logo_price', -1000)}>-</Btn>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={formatMoneyInput(pricingDraft.logo_price)}
                    onChange={(e) => onPricingInputChange('logo_price', e.target.value)}
                  />
                  <Btn $secondary onClick={() => adjustPricing('logo_price', 1000)}>+</Btn>
                </StockEdit>
              </StockRow>
              <StockRow>
                <StockLabel>Giá Thẻ</StockLabel>
                <StockEdit>
                  <Btn $secondary onClick={() => adjustPricing('card_price', -1000)}>-</Btn>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={formatMoneyInput(pricingDraft.card_price)}
                    onChange={(e) => onPricingInputChange('card_price', e.target.value)}
                  />
                  <Btn $secondary onClick={() => adjustPricing('card_price', 1000)}>+</Btn>
                </StockEdit>
              </StockRow>
              <StockRow>
                <StockLabel>Giá Áo thun</StockLabel>
                <StockEdit>
                  <Btn $secondary onClick={() => adjustPricing('tshirt_price', -1000)}>-</Btn>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={formatMoneyInput(pricingDraft.tshirt_price)}
                    onChange={(e) => onPricingInputChange('tshirt_price', e.target.value)}
                  />
                  <Btn $secondary onClick={() => adjustPricing('tshirt_price', 1000)}>+</Btn>
                </StockEdit>
              </StockRow>
            </Card>

            <InventoryGrid>
              {inventoryRows.map((row) => {
                const draft = inventoryDraft[row.name] || { logo_stock: 0, card_stock: 0, tshirt_stock: 0 };
                return (
                  <Card key={row.id || row.name}>
                    <HtxTitle>{row.name}</HtxTitle>
                    <StockRow>
                      <StockLabel>Logo</StockLabel>
                      <StockEdit>
                        <Btn $secondary onClick={() => adjustStock(row.name, 'logo_stock', -1)}>-</Btn>
                        <Input
                          type="number"
                          value={draft.logo_stock}
                          onChange={(e) =>
                            setInventoryDraft((prev) => ({
                              ...prev,
                              [row.name]: {
                                ...draft,
                                logo_stock: Math.max(0, Number(e.target.value || 0)),
                              },
                            }))
                          }
                        />
                        <Btn $secondary onClick={() => adjustStock(row.name, 'logo_stock', 1)}>+</Btn>
                      </StockEdit>
                    </StockRow>
                    <StockRow>
                      <StockLabel>Thẻ</StockLabel>
                      <StockEdit>
                        <Btn $secondary onClick={() => adjustStock(row.name, 'card_stock', -1)}>-</Btn>
                        <Input
                          type="number"
                          value={draft.card_stock}
                          onChange={(e) =>
                            setInventoryDraft((prev) => ({
                              ...prev,
                              [row.name]: {
                                ...draft,
                                card_stock: Math.max(0, Number(e.target.value || 0)),
                              },
                            }))
                          }
                        />
                        <Btn $secondary onClick={() => adjustStock(row.name, 'card_stock', 1)}>+</Btn>
                      </StockEdit>
                    </StockRow>
                    <StockRow>
                      <StockLabel>Áo thun</StockLabel>
                      <StockEdit>
                        <Btn $secondary onClick={() => adjustStock(row.name, 'tshirt_stock', -1)}>-</Btn>
                        <Input
                          type="number"
                          value={draft.tshirt_stock}
                          onChange={(e) =>
                            setInventoryDraft((prev) => ({
                              ...prev,
                              [row.name]: {
                                ...draft,
                                tshirt_stock: Math.max(0, Number(e.target.value || 0)),
                              },
                            }))
                          }
                        />
                        <Btn $secondary onClick={() => adjustStock(row.name, 'tshirt_stock', 1)}>+</Btn>
                      </StockEdit>
                    </StockRow>
                  </Card>
                );
              })}
            </InventoryGrid>
          </>
        )}

        {activeTab === Tabs.bills && (
          <>
            <Card>
              <Row>
                <div>
                  <Small>Lọc theo sale</Small>
                  <Select value={billFilterSale} onChange={(e) => setBillFilterSale(e.target.value)}>
                    <option value="">Tất cả sale</option>
                    {saleOptions.map((s) => (
                      <option key={s.username} value={s.username}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div />
              </Row>
              <Row>
                <div>
                  <Small>Từ ngày</Small>
                  <Input type="date" value={billDateFrom} onChange={(e) => setBillDateFrom(e.target.value)} />
                </div>
                <div>
                  <Small>Đến ngày</Small>
                  <Input type="date" value={billDateTo} onChange={(e) => setBillDateTo(e.target.value)} />
                </div>
              </Row>
              <Btn onClick={loadBills}>Lọc hóa đơn</Btn>
            </Card>
            <Card>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 10 }}>
                <div>
                  <Small>Tổng tiền thu được</Small>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.15, color: '#0a66c2' }}>
                    {billTotals.total.toLocaleString('vi-VN')}đ
                  </div>
                  <Small style={{ marginTop: 4 }}>Tổng tiền</Small>
                </div>
                <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.1 }}>{billTotals.transfer.toLocaleString('vi-VN')}đ</div>
                    <Small>CK</Small>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.1 }}>{billTotals.cash.toLocaleString('vi-VN')}đ</div>
                    <Small>TM</Small>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginTop: 14, textAlign: 'center' }}>
                <div>
                  <Small>Logo</Small>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', lineHeight: 1.15 }}>{billTotals.logo.toLocaleString('vi-VN')}đ</div>
                </div>
                <div>
                  <Small>Thẻ</Small>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', lineHeight: 1.15 }}>{billTotals.card.toLocaleString('vi-VN')}đ</div>
                </div>
                <div>
                  <Small>Áo thun</Small>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', lineHeight: 1.15 }}>{billTotals.tshirt.toLocaleString('vi-VN')}đ</div>
                </div>
              </div>
            </Card>
            <Card>
              <Table>
                <thead>
                  <tr>
                    <Th>Mã bill</Th>
                    <Th>HTX</Th>
                    <Th>Sale</Th>
                    <Th>Ngày giờ</Th>
                    <Th>Tổng</Th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((b) => (
                    <ClickableTr
                      key={b.id}
                      onClick={() => navigate(`/bill/${b.id}?from=admin`, { state: { fromAdmin: true } })}
                    >
                      <Td>{b.id}</Td>
                      <Td>{b.htx}</Td>
                      <Td>{b.sale_name || b.sale_username || 'N/A'}</Td>
                      <Td>{new Date(b.created_at).toLocaleString('vi-VN')}</Td>
                      <Td>{(b.total_amount || 0).toLocaleString('vi-VN')}đ</Td>
                    </ClickableTr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </>
        )}

        {activeTab === Tabs.drivers && (
          <>
            <Card>
              <SearchLabel>Tìm nhanh (biển số / tên / số điện thoại)</SearchLabel>
              <SearchInline>
                <SearchInput value={driverQuery} onChange={(e) => setDriverQuery(e.target.value)} placeholder="Nhập từ khóa..." />
                <Btn onClick={loadDrivers} style={{ whiteSpace: 'nowrap' }}>
                  <FaSearch /> Tìm
                </Btn>
              </SearchInline>
            </Card>
            <Card>
              <Table>
                <thead>
                  <tr>
                    <Th>Tên</Th>
                    <Th>Biển số</Th>
                    <Th>SĐT</Th>
                    <Th>HTX</Th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((d) => (
                    <tr key={d.id}>
                      <Td>{d.name}</Td>
                      <Td>{d.license_plate}</Td>
                      <Td>{d.phone}</Td>
                      <Td>{d.htx}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </>
        )}

        {activeTab === Tabs.sales && (
          <>
            <Card>
              <Row>
                <div>
                  <Small>Username</Small>
                  <Input value={saleForm.username} onChange={(e) => setSaleForm((p) => ({ ...p, username: e.target.value }))} />
                </div>
                <div>
                  <Small>Tên sale</Small>
                  <Input value={saleForm.full_name} onChange={(e) => setSaleForm((p) => ({ ...p, full_name: e.target.value }))} />
                </div>
              </Row>
              <Row>
                <div>
                  <Small>Số điện thoại</Small>
                  <Input value={saleForm.phone} onChange={(e) => setSaleForm((p) => ({ ...p, phone: e.target.value }))} />
                </div>
                <div />
              </Row>
              <Btn onClick={saveSale}>
                <FaPlus /> {editingSale ? 'Cập nhật Sale' : 'Thêm Sale'}
              </Btn>
              {editingSale && (
                <Btn
                  $secondary
                  onClick={() => {
                    setEditingSale(null);
                    setSaleForm({ username: '', full_name: '', phone: '' });
                  }}
                  style={{ marginLeft: 8 }}
                >
                  Hủy sửa
                </Btn>
              )}
            </Card>
            <Card>
              <Table>
                <thead>
                  <tr>
                    <Th>ID</Th>
                    <Th>Username</Th>
                    <Th>Tên</Th>
                    <Th>SĐT</Th>
                    <Th>Thao tác</Th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => (
                    <tr key={s.id}>
                      <Td>{s.id}</Td>
                      <Td>{s.username}</Td>
                      <Td>{s.full_name || '-'}</Td>
                      <Td>{s.phone || '-'}</Td>
                      <Td>
                        <ActionRow>
                          <IconBtn onClick={() => openEditSale(s)} title="Sửa">
                            <FaEdit />
                          </IconBtn>
                          <IconBtn onClick={() => setPendingDeleteSaleId(s.id)} title="Xóa">
                            <FaTrashAlt />
                          </IconBtn>
                        </ActionRow>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </>
        )}
      </Body>

      {pendingDeleteSaleId && (
        <ModalOverlay>
          <ModalCard>
            <ModalTitle>Xác nhận xóa</ModalTitle>
            <ModalText>Bạn có chắc muốn xóa sale này không?</ModalText>
            <ModalActions>
              <Btn $secondary onClick={() => setPendingDeleteSaleId(null)}>Bỏ qua</Btn>
              <Btn
                onClick={async () => {
                  try {
                    await deleteSale(pendingDeleteSaleId);
                  } finally {
                    setPendingDeleteSaleId(null);
                  }
                }}
              >
                Đồng ý
              </Btn>
            </ModalActions>
          </ModalCard>
        </ModalOverlay>
      )}

      {pendingClearInventory && (
        <ModalOverlay>
          <ModalCard>
            <ModalTitle>Cảnh báo</ModalTitle>
            <ModalText>
              Bạn sắp xóa trống toàn bộ tồn kho của tất cả HTX.
              Hành động này có thể gây sai lệch dữ liệu nếu bấm nhầm.
            </ModalText>
            <ModalActions>
              <Btn $secondary onClick={() => setPendingClearInventory(false)}>Bỏ qua</Btn>
              <Btn
                onClick={async () => {
                  try {
                    await clearAllInventory();
                  } finally {
                    setPendingClearInventory(false);
                  }
                }}
              >
                Đồng ý
              </Btn>
            </ModalActions>
          </ModalCard>
        </ModalOverlay>
      )}
    </Page>
  );
}

export default SaleAdminPanel;
