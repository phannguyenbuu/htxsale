import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaCamera, FaCheckCircle, FaHome, FaIdCard, FaShareAlt, FaTruck } from 'react-icons/fa';

const Page = styled.div`
  min-height: 100vh;
  background: #e9edf3;
  padding: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
`;

const MobileFrame = styled.div`
  max-width: 480px;
  background: #ffffff;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(16, 24, 40, 0.16);
`;

const PreviewWrap = styled.div`
  max-width: 480px;
  margin: 0 auto;
  position: relative;
`;

const Hero = styled.div`
  background: linear-gradient(145deg, #08254e 0%, #0d3f78 100%);
  color: #ffffff;
  padding: 16px 16px 14px;
`;

const HeroRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
`;

const HeroBackBtn = styled.button`
  width: 38px;
  height: 38px;
  border: 1px solid rgba(255, 255, 255, 0.38);
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  border-radius: 50%;
  padding: 0;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BillIdWrap = styled.div`
  text-align: right;
`;

const SmallLabel = styled.div`
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.78);
`;

const BillId = styled.div`
  margin-top: 4px;
  font-size: 0.86rem;
  font-weight: 500;
  color: #ffd26c;
  white-space: nowrap;
`;

const PaidChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  background: rgba(46, 204, 113, 0.16);
  border: 1px solid rgba(46, 204, 113, 0.42);
  color: #99ffc2;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 5px 10px;
  white-space: nowrap;
`;

const HeroMeta = styled.div`
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
`;

const MetaItem = styled.div`
  min-width: 0;
`;

const MetaValue = styled.div`
  margin-top: 2px;
  font-size: 0.97rem;
  font-weight: 500;
  white-space: ${(props) => (props.nowrap ? 'nowrap' : 'normal')};
`;

const Section = styled.div`
  padding: 14px 14px 8px;
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6f7b91;
  font-size: 0.68rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 10px;
`;

const Card = styled.div`
  background: #f9fbff;
  border: 1px solid #e5ebf4;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 8px;
`;

const FieldLabel = styled.div`
  font-size: 0.68rem;
  color: #7d889d;
  margin-bottom: 2px;
`;

const FieldValue = styled.div`
  font-size: 1.05rem;
  font-weight: 500;
  color: #182234;
  margin-bottom: 8px;
  word-break: break-word;
`;

const TableWrap = styled.div`
  border: 1px solid #e5ebf4;
  border-radius: 12px;
  overflow: hidden;
`;

const THead = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 0.7fr 1fr;
  background: #eef3fb;
  color: #5f6d83;
  font-size: 0.68rem;
  font-weight: 500;
  text-transform: uppercase;
`;

const TRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 0.7fr 1fr;
  border-top: 1px solid #e9edf5;
  align-items: center;
`;

const TCell = styled.div`
  padding: 10px 8px;
  font-size: 0.92rem;
  color: #1f2938;
  white-space: ${(props) => (props.nowrap ? 'nowrap' : 'normal')};
  word-break: ${(props) => (props.nowrap ? 'normal' : 'break-word')};
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 2px 2px;
  font-size: 1.02rem;
  font-weight: 500;
  color: #1b2535;
`;

const THeadCell = styled(TCell)`
  font-size: 0.68rem;
  font-weight: 500;
`;

const FloatingActions = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1200;
`;

const ActionFab = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 999px;
  border: none;
  color: #ffffff;
  background: ${(props) => (props.share ? '#0b8f5f' : '#146bcb')};
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  opacity: ${(props) => (props.disabled ? 0.65 : 1)};
  pointer-events: ${(props) => (props.disabled ? 'none' : 'auto')};
`;

function formatMoney(value) {
  return `${(value || 0).toLocaleString('vi-VN')}đ`;
}

function formatDate(dateValue) {
  const d = dateValue ? new Date(dateValue) : new Date();
  return d.toLocaleString('vi-VN');
}

function BillPreview() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const billRef = useRef(null);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [pricing, setPricing] = useState({ logo_price: 50000, card_price: 50000, tshirt_price: 50000 });

  const searchParams = new URLSearchParams(location.search);
  const isFromAdmin = Boolean(location.state?.fromAdmin) || searchParams.get('from') === 'admin';

  useEffect(() => {
    if (orderId === 'draft') {
      const stateDraft = location.state?.draftBill;
      if (stateDraft) {
        setOrder(stateDraft);
        return;
      }

      const localDraftRaw = localStorage.getItem('draftBill');
      if (localDraftRaw) {
        try {
          setOrder(JSON.parse(localDraftRaw));
          return;
        } catch (e) {
          setError('Bill nháp không hợp lệ.');
          return;
        }
      }

      setError('Không tìm thấy bill nháp.');
      return;
    }

    axios.get(`/api/orders/${orderId}`)
      .then((res) => setOrder(res.data))
      .catch((err) => {
        setError(err?.response?.data?.error || 'Không tải được bill.');
      });
  }, [orderId, location.state]);

  useEffect(() => {
    axios.get('/api/admin/pricing')
      .then((res) => {
        setPricing({
          logo_price: Number(res.data?.logo_price || 50000),
          card_price: Number(res.data?.card_price || 50000),
          tshirt_price: Number(res.data?.tshirt_price || 50000),
        });
      })
      .catch(() => {});
  }, []);

  const items = useMemo(() => {
    if (!order) return [];
    const rows = [];
    if (order.logo_qty > 0) rows.push({ name: 'Logo HTX', unitPrice: Number(pricing.logo_price || 0), qty: order.logo_qty });
    if (order.card_qty > 0) rows.push({ name: 'Thẻ tài xế', unitPrice: Number(pricing.card_price || 0), qty: order.card_qty });
    if (order.tshirt_qty > 0) rows.push({ name: 'Áo thun', unitPrice: Number(pricing.tshirt_price || 0), qty: order.tshirt_qty });
    return rows;
  }, [order, pricing]);

  const total = order ? (order.total_amount || items.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0)) : 0;

  const captureBillBlob = async () => {
    if (!billRef.current) return null;
    setIsCapturing(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(billRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
      return blob;
    } finally {
      setIsCapturing(false);
    }
  };

  const downloadBlob = (blob) => {
    if (!blob) return;
    const fileName = `${(order?.id || 'bill').replace(/[^\w-]/g, '_')}.png`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleCapture = async () => {
    const blob = await captureBillBlob();
    if (!blob) return window.alert('Không chụp được bill.');
    downloadBlob(blob);
  };

  const handleShare = async () => {
    const blob = await captureBillBlob();
    if (!blob) return window.alert('Không chụp được bill để chia sẻ.');

    const fileName = `${(order?.id || 'bill').replace(/[^\w-]/g, '_')}.png`;
    const file = new File([blob], fileName, { type: 'image/png' });

    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Bill HTX Sale', text: `Bill ${order?.id || ''}`.trim() });
        return;
      }
    } catch (err) {}

    downloadBlob(blob);
    window.alert('Thiết bị chưa hỗ trợ chia sẻ file trực tiếp. Đã tải ảnh bill về máy.');
  };

  if (error) {
    return (
      <Page>
        <MobileFrame><Section><Card>{error}</Card></Section></MobileFrame>
      </Page>
    );
  }

  if (!order) {
    return (
      <Page>
        <MobileFrame><Section><Card>Đang tải bill...</Card></Section></MobileFrame>
      </Page>
    );
  }

  return (
    <Page>
      <PreviewWrap>
        <MobileFrame ref={billRef}>
          <Hero>
          <HeroRow>
            <HeroBackBtn onClick={() => navigate(isFromAdmin ? '/sale_admin' : '/')}><FaHome /></HeroBackBtn>
            <BillIdWrap>
              <SmallLabel>Số hóa đơn</SmallLabel>
              <BillId>#{order.id}</BillId>
              <PaidChip><FaCheckCircle /> ĐÃ THANH TOÁN</PaidChip>
            </BillIdWrap>
          </HeroRow>

          <HeroMeta>
            <MetaItem><SmallLabel>Ngày giờ</SmallLabel><MetaValue>{formatDate(order.created_at)}</MetaValue></MetaItem>
            <MetaItem><SmallLabel>Hợp tác xã</SmallLabel><MetaValue>{order.htx}</MetaValue></MetaItem>
            <MetaItem><SmallLabel>Thanh toán</SmallLabel><MetaValue nowrap>{order.payment_method || 'N/A'}</MetaValue></MetaItem>
          </HeroMeta>
        </Hero>

        <Section>
          <SectionTitle><FaIdCard /> Thông tin tài xế</SectionTitle>
          <Card>
            <FieldLabel>Họ và tên</FieldLabel><FieldValue>{order.driver?.name || 'N/A'}</FieldValue>
            <FieldLabel>Biển số xe</FieldLabel><FieldValue>{order.driver?.license_plate || 'N/A'}</FieldValue>
            <FieldLabel>Số điện thoại</FieldLabel><FieldValue>{order.driver?.phone || 'N/A'}</FieldValue>
          </Card>
        </Section>

        <Section>
          <SectionTitle><FaTruck /> Chi tiết sản phẩm</SectionTitle>
          <TableWrap>
            <THead>
              <THeadCell>Sản phẩm</THeadCell>
              <THeadCell nowrap>Đơn giá</THeadCell>
              <THeadCell>SL</THeadCell>
              <THeadCell nowrap>Thành tiền</THeadCell>
            </THead>
            {items.length === 0 && (
              <TRow><TCell nowrap>Không có sản phẩm</TCell><TCell>-</TCell><TCell>0</TCell><TCell>0đ</TCell></TRow>
            )}
            {items.map((item) => (
              <TRow key={item.name}>
                <TCell>{item.name}</TCell>
                <TCell nowrap>{formatMoney(item.unitPrice)}</TCell>
                <TCell>{item.qty}</TCell>
                <TCell nowrap>{formatMoney(item.unitPrice * item.qty)}</TCell>
              </TRow>
            ))}
          </TableWrap>
          <TotalRow><span>Tổng cộng</span><span>{formatMoney(total)}</span></TotalRow>
          {order.details && (
            <Card style={{ marginTop: 10 }}>
              <FieldLabel>Ghi chú</FieldLabel>
              <FieldValue style={{ marginBottom: 0 }}>{order.details}</FieldValue>
            </Card>
          )}
          </Section>
        </MobileFrame>

        <FloatingActions>
          <ActionFab onClick={handleCapture} disabled={isCapturing} title="Chụp bill"><FaCamera /></ActionFab>
          <ActionFab share onClick={handleShare} disabled={isCapturing} title="Chụp và chia sẻ"><FaShareAlt /></ActionFab>
        </FloatingActions>
      </PreviewWrap>
    </Page>
  );
}

export default BillPreview;
