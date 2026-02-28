import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaFileInvoiceDollar } from 'react-icons/fa';

const Page = styled.div`
  min-height: 100vh;
  background: #f5f5f7;
  max-width: 480px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
`;

const Header = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  background: #08254e;
  color: #fff;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const BackBtn = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 9px;
  border: 1px solid rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.12);
  color: #fff;
  cursor: pointer;
`;

const Title = styled.div`
  font-size: 1rem;
  font-weight: 700;
`;

const List = styled.div`
  padding: 12px;
`;

const BillCard = styled.button`
  width: 100%;
  text-align: left;
  border: 1px solid #dfe4ee;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 10px;
  padding: 12px;
  cursor: pointer;
`;

const BillId = styled.div`
  font-size: 0.92rem;
  font-weight: 700;
  color: #0d3f78;
  margin-bottom: 4px;
`;

const Meta = styled.div`
  font-size: 0.85rem;
  color: #576176;
  margin-bottom: 2px;
`;

const Empty = styled.div`
  border: 1px dashed #c8d1e0;
  background: #fff;
  border-radius: 12px;
  padding: 18px;
  color: #69758b;
  text-align: center;
`;

function formatDate(dt) {
  const d = dt ? new Date(dt) : new Date();
  return d.toLocaleString('vi-VN');
}

function BillList({ user }) {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`/api/orders?sale_username=${encodeURIComponent(user.username)}`)
      .then((res) => setBills(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err?.response?.data?.error || 'Không tải được danh sách hóa đơn.'));
  }, [user.username]);

  return (
    <Page>
      <Header>
        <BackBtn onClick={() => navigate('/')}>
          <FaArrowLeft />
        </BackBtn>
        <Title>Hóa đơn</Title>
      </Header>

      <List>
        {error && <Empty>{error}</Empty>}
        {!error && bills.length === 0 && <Empty>Chưa có hóa đơn nào.</Empty>}

        {bills.map((bill) => (
          <BillCard key={bill.id} onClick={() => navigate(`/bill/${bill.id}`)}>
            <BillId><FaFileInvoiceDollar style={{ marginRight: 6 }} />{bill.id}</BillId>
            <Meta>HTX: {bill.htx}</Meta>
            <Meta>Thời gian: {formatDate(bill.created_at)}</Meta>
            <Meta>Tổng tiền: {(bill.total_amount || 0).toLocaleString('vi-VN')}đ</Meta>
            <Meta>Sale: {bill.sale_username || bill.sale_name || 'N/A'}</Meta>
          </BillCard>
        ))}
      </List>
    </Page>
  );
}

export default BillList;
