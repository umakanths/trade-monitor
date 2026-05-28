import React, { useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function TradingDashboard() {
  const [stocks, setStocks] = useState({
    momentum: [
      { ticker: 'AMD', name: 'Advanced Micro Devices', price: null, lastUpdate: null, status: 'pending' },
      { ticker: 'AAPL', name: 'Apple Inc.', price: null, lastUpdate: null, status: 'pending' },
      { ticker: 'SOUN', name: 'SoundHound AI', price: null, lastUpdate: null, status: 'pending' },
      { ticker: 'SIFY', name: 'Sify Technologies', price: null, lastUpdate: null, status: 'pending' },
    ],
    dividend: [
      { ticker: 'MAIN', name: 'Main Street Capital', price: null, yield: 7.8, lastUpdate: null, status: 'pending' },
      { ticker: 'VICI', name: 'VICI Properties', price: null, yield: 6.39, lastUpdate: null, status: 'pending' },
      { ticker: 'DHT', name: 'DHT Holdings', price: null, yield: 15.02, lastUpdate: null, status: 'pending' },
    ]
  });

  const [trades, setTrades] = useState([]);
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ticker: '',
    entryPrice: '',
    shares: '',
    type: 'momentum',
    notes: ''
  });
  const [budget, setBudget] = useState(50);
  const [invested, setInvested] = useState(0);

  const [recommendations] = useState([
    {
      id: 1,
      ticker: 'AMD',
      name: 'Advanced Micro Devices',
      signal: 'BUY',
      reason: 'RSI 76.1, breakout above 200-day MA, AI data center orders accelerating',
      target: '€520-540',
      stopLoss: '€480',
      confidence: 95
    },
    {
      id: 2,
      ticker: 'MAIN',
      name: 'Main Street Capital',
      signal: 'BUY',
      reason: '7.8% yield, monthly dividends never cut, analyst upgrades',
      target: '€55-57',
      stopLoss: '€48',
      confidence: 70
    },
    {
      id: 3,
      ticker: 'SOUN',
      name: 'SoundHound AI',
      signal: 'BREAKOUT',
      reason: 'MACD bullish cross, recovery from $5.83, AI sector hot',
      target: '€12-14',
      stopLoss: '€7.20',
      confidence: 60
    }
  ]);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const mockPrices = {
        AMD: 501.25,
        AAPL: 311.40,
        SOUN: 8.12,
        SIFY: 15.88,
        MAIN: 51.12,
        VICI: 33.00,
        DHT: 17.02
      };

      setStocks(prev => ({
        momentum: prev.momentum.map(stock => ({
          ...stock,
          price: mockPrices[stock.ticker],
          lastUpdate: new Date().toLocaleTimeString(),
          status: 'loaded'
        })),
        dividend: prev.dividend.map(stock => ({
          ...stock,
          price: mockPrices[stock.ticker],
          lastUpdate: new Date().toLocaleTimeString(),
          status: 'loaded'
        }))
      }));
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrade = () => {
    if (!formData.ticker || !formData.entryPrice || !formData.shares) {
      alert('Please fill in all required fields');
      return;
    }

    const newTrade = {
      id: Date.now(),
      ...formData,
      entryPrice: parseFloat(formData.entryPrice),
      shares: parseFloat(formData.shares),
      dateEntered: new Date().toLocaleString(),
      exitPrice: null,
      profit: null,
      returnPct: null
    };

    setTrades([newTrade, ...trades]);
    setInvested(invested + (newTrade.entryPrice * newTrade.shares));
    setFormData({ ticker: '', entryPrice: '', shares: '', type: 'momentum', notes: '' });
    setShowTradeForm(false);
  };

  const handleCloseTrade = (id, exitPrice) => {
    setTrades(trades.map(trade => {
      if (trade.id === id) {
        const profit = (exitPrice - trade.entryPrice) * trade.shares;
        const returnPct = ((exitPrice - trade.entryPrice) / trade.entryPrice * 100).toFixed(2);
        return { ...trade, exitPrice, profit, returnPct, dateClosed: new Date().toLocaleString() };
      }
      return trade;
    }));
  };

  const handleDeleteTrade = (id) => {
    setTrades(trades.filter(trade => trade.id !== id));
  };

  const totalProfit = trades.reduce((sum, trade) => sum + (trade.profit || 0), 0);
  const openTrades = trades.filter(t => !t.exitPrice);
  const closedTrades = trades.filter(t => t.exitPrice);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: '"Segoe UI", Roboto, sans-serif',
      color: '#e0e0e0'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
              📈 Trading Dashboard
            </h1>
            <p style={{ color: '#999', fontSize: '14px' }}>AI Recommendations | Manual Refresh | eToro Trade Logging</p>
          </div>
          <button
            onClick={fetchPrices}
            disabled={loading}
            style={{
              background: loading ? '#666' : '#2196F3',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Loading...' : 'Refresh Prices'}
          </button>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>

        {/* Portfolio Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{ background: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.3)', padding: '20px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>MONTHLY BUDGET</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#4CAF50' }}>€{budget}</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Remaining: €{(budget - invested).toFixed(2)}</div>
          </div>

          <div style={{ background: 'rgba(33, 150, 243, 0.1)', border: '1px solid rgba(33, 150, 243, 0.3)', padding: '20px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>OPEN POSITIONS</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#2196F3' }}>{openTrades.length}</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Invested: €{invested.toFixed(2)}</div>
          </div>

          <div style={{ background: totalProfit >= 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)', border: totalProfit >= 0 ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid rgba(244, 67, 54, 0.3)', padding: '20px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>TOTAL P&L</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: totalProfit >= 0 ? '#4CAF50' : '#f44336' }}>
              €{totalProfit.toFixed(2)}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>From {closedTrades.length} closed trades</div>
          </div>
        </div>

        {/* AI Recommendations */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#fff' }}>⭐ AI Recommendations</h2>
          {recommendations.map(rec => (
            <div key={rec.id} style={{ background: 'rgba(30, 30, 46, 0.8)', border: '2px solid #FF9800', borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '20px', alignItems: 'start' }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#FF9800' }}>{rec.ticker}</div>
                  <div style={{ fontSize: '12px', color: '#aaa' }}>{rec.name}</div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ background: 'rgba(76, 175, 80, 0.2)', color: '#4CAF50', padding: '6px 12px', borderRadius: '4px', fontWeight: '700' }}>{rec.signal}</div>
                    <div style={{ fontSize: '12px', color: '#FF9800' }}>Confidence: {rec.confidence}%</div>
                  </div>
                  <div style={{ fontSize: '13px', color: '#ccc', marginBottom: '12px' }}>{rec.reason}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div><div style={{ fontSize: '11px', color: '#999' }}>TARGET</div><div style={{ fontSize: '14px', fontWeight: '700', color: '#4CAF50' }}>{rec.target}</div></div>
                    <div><div style={{ fontSize: '11px', color: '#999' }}>STOP LOSS</div><div style={{ fontSize: '14px', fontWeight: '700', color: '#f44336' }}>{rec.stopLoss}</div></div>
                  </div>
                </div>
                <button onClick={() => { setFormData({ ...formData, ticker: rec.ticker }); setShowTradeForm(true); }} style={{ background: '#FF9800', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}>+ Trade</button>
              </div>
            </div>
          ))}
        </section>

        {/* Momentum Stocks */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#fff' }}>🚀 Momentum Plays</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {stocks.momentum.map(stock => (
              <div key={stock.ticker} style={{ background: 'rgba(30, 30, 46, 0.8)', border: '1px solid #2d3561', borderRadius: '8px', padding: '20px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>{stock.ticker}</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>{stock.name}</div>
                </div>
                <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #2d3561' }}>
                  {stock.price ? (
                    <>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#4CAF50' }}>€{stock.price.toFixed(2)}</div>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Updated: {stock.lastUpdate}</div>
                    </>
                  ) : (
                    <div style={{ fontSize: '14px', color: '#999' }}>Click "Refresh Prices"</div>
                  )}
                </div>
                <button onClick={() => { setFormData({ ...formData, ticker: stock.ticker, type: 'momentum' }); setShowTradeForm(true); }} style={{ width: '100%', background: stock.price ? '#4CAF50' : '#555', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }} disabled={!stock.price}>+ Log Trade</button>
              </div>
            ))}
          </div>
        </section>

        {/* Dividend Stocks */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#fff' }}>💰 Dividend Income</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {stocks.dividend.map(stock => (
              <div key={stock.ticker} style={{ background: 'rgba(30, 30, 46, 0.8)', border: '1px solid #2d3561', borderRadius: '8px', padding: '20px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>{stock.ticker}</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>{stock.name}</div>
                </div>
                <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #2d3561' }}>
                  {stock.price ? (
                    <>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#2196F3' }}>€{stock.price.toFixed(2)}</div>
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>Yield: <strong style={{ color: '#4CAF50' }}>{stock.yield}%</strong></div>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Updated: {stock.lastUpdate}</div>
                    </>
                  ) : (
                    <div style={{ fontSize: '14px', color: '#999' }}>Click "Refresh Prices"</div>
                  )}
                </div>
                <button onClick={() => { setFormData({ ...formData, ticker: stock.ticker, type: 'dividend' }); setShowTradeForm(true); }} style={{ width: '100%', background: stock.price ? '#2196F3' : '#555', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }} disabled={!stock.price}>+ Log Trade</button>
              </div>
            ))}
          </div>
        </section>

        {/* Trade Form */}
        {showTradeForm && (
          <div style={{ background: 'rgba(30, 30, 46, 0.95)', border: '1px solid #2d3561', borderRadius: '8px', padding: '24px', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Log Trade from eToro</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
              <input type="text" placeholder="Ticker" value={formData.ticker} readOnly style={{ background: '#1a1f3a', border: '1px solid #2d3561', padding: '10px', borderRadius: '4px', color: '#fff', fontSize: '12px' }} />
              <input type="number" placeholder="Entry Price (€)" value={formData.entryPrice} onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })} style={{ background: '#1a1f3a', border: '1px solid #2d3561', padding: '10px', borderRadius: '4px', color: '#fff', fontSize: '12px' }} />
              <input type="number" placeholder="Shares" value={formData.shares} onChange={(e) => setFormData({ ...formData, shares: e.target.value })} style={{ background: '#1a1f3a', border: '1px solid #2d3561', padding: '10px', borderRadius: '4px', color: '#fff', fontSize: '12px' }} />
            </div>
            <textarea placeholder="Notes (optional)" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} style={{ width: '100%', background: '#1a1f3a', border: '1px solid #2d3561', padding: '10px', borderRadius: '4px', color: '#fff', fontSize: '12px', marginTop: '12px', minHeight: '60px', fontFamily: 'inherit' }} />
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button onClick={handleAddTrade} style={{ background: '#4CAF50', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}>✓ Log Trade</button>
              <button onClick={() => setShowTradeForm(false)} style={{ background: '#555', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}>✕ Cancel</button>
            </div>
          </div>
        )}

        {/* Open Trades */}
        {openTrades.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#fff' }}>Open Positions ({openTrades.length})</h3>
            {openTrades.map(trade => (
              <div key={trade.id} style={{ background: 'rgba(30, 30, 46, 0.8)', border: '1px solid #2d3561', borderRadius: '8px', padding: '16px', marginBottom: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', alignItems: 'center' }}>
                <div><div style={{ fontSize: '12px', color: '#999' }}>TICKER</div><div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>{trade.ticker}</div></div>
                <div><div style={{ fontSize: '12px', color: '#999' }}>ENTRY</div><div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>€{trade.entryPrice.toFixed(2)} ({trade.shares} shares)</div></div>
                <div><div style={{ fontSize: '12px', color: '#999' }}>INVESTED</div><div style={{ fontSize: '16px', fontWeight: '700', color: '#4CAF50' }}>€{(trade.entryPrice * trade.shares).toFixed(2)}</div></div>
                <div><div style={{ fontSize: '12px', color: '#999' }}>ENTERED</div><div style={{ fontSize: '11px', color: '#aaa' }}>{trade.dateEntered}</div></div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { const exitPrice = prompt('Exit Price (€):'); if (exitPrice) handleCloseTrade(trade.id, parseFloat(exitPrice)); }} style={{ background: '#2196F3', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', flex: 1 }}>Close</button>
                  <button onClick={() => handleDeleteTrade(trade.id)} style={{ background: '#f44336', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Closed Trades */}
        {closedTrades.length > 0 && (
          <section>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#fff' }}>Closed Positions ({closedTrades.length})</h3>
            {closedTrades.map(trade => (
              <div key={trade.id} style={{ background: 'rgba(30, 30, 46, 0.6)', border: '1px solid #2d3561', borderRadius: '8px', padding: '16px', marginBottom: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', opacity: 0.8 }}>
                <div><div style={{ fontSize: '12px', color: '#999' }}>TICKER</div><div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>{trade.ticker}</div></div>
                <div><div style={{ fontSize: '12px', color: '#999' }}>TRADE</div><div style={{ fontSize: '12px', color: '#aaa' }}>€{trade.entryPrice.toFixed(2)} → €{trade.exitPrice.toFixed(2)}</div></div>
                <div><div style={{ fontSize: '12px', color: '#999' }}>P&L</div><div style={{ fontSize: '16px', fontWeight: '700', color: trade.profit >= 0 ? '#4CAF50' : '#f44336' }}>€{trade.profit.toFixed(2)} ({trade.returnPct}%)</div></div>
                <div><div style={{ fontSize: '12px', color: '#999' }}>CLOSED</div><div style={{ fontSize: '11px', color: '#aaa' }}>{trade.dateClosed}</div></div>
              </div>
            ))}
          </section>
        )}

        {trades.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
            <p style={{ fontSize: '18px', marginBottom: '16px' }}>No trades logged yet. Click a recommendation to start.</p>
          </div>
        )}
      </div>
    </div>
  );
}
