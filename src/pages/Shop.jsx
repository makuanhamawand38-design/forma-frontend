import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { Coin } from '../components/Icons'

const categoryLabels = {
  subscription: 'Prenumeration',
  program: 'Program',
  cosmetic: 'Kosmetiskt',
}

export default function Shop() {
  const { user, refreshProfile } = useAuth()
  const [items, setItems] = useState([])
  const [transactions, setTransactions] = useState([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(null)
  const [message, setMessage] = useState(null)
  const [txTotal, setTxTotal] = useState(0)
  const [txOffset, setTxOffset] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [shopItems, coinData] = await Promise.all([
        api.getShopItems(),
        api.getCoins(10, 0),
      ])
      setItems(shopItems)
      setBalance(coinData.balance)
      setTransactions(coinData.transactions)
      setTxTotal(coinData.total)
      setTxOffset(10)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (itemId) => {
    setBuying(itemId)
    setMessage(null)
    try {
      const result = await api.purchaseItem(itemId)
      setMessage({ type: 'success', text: result.message })
      setBalance(result.new_balance)
      // Refresh items and profile
      const [shopItems, coinData] = await Promise.all([
        api.getShopItems(),
        api.getCoins(10, 0),
      ])
      setItems(shopItems)
      setTransactions(coinData.transactions)
      setTxTotal(coinData.total)
      setTxOffset(10)
      if (refreshProfile) refreshProfile()
    } catch (e) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setBuying(null)
    }
  }

  const loadMoreTx = async () => {
    try {
      const coinData = await api.getCoins(10, txOffset)
      setTransactions(prev => [...prev, ...coinData.transactions])
      setTxOffset(prev => prev + 10)
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) {
    return (
      <>
        <Nav />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" />
        </div>
      </>
    )
  }

  const categories = ['subscription', 'program', 'cosmetic']

  return (
    <>
      <Nav />
      <div style={{ minHeight: '100vh', padding: '80px 24px 96px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700, letterSpacing: -1, marginBottom: 12 }}>
              Coin Shop
            </h1>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px',
              background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)',
              borderRadius: 999, fontSize: 20, fontWeight: 700, color: '#FFD700',
            }}>
              <Coin size={24} /> {balance} coins
            </div>
            {user?.login_streak > 1 && (
              <p style={{ color: 'var(--ts)', fontSize: 14, marginTop: 8 }}>
                {user.login_streak} dagars streak
              </p>
            )}
          </div>

          {/* Message */}
          {message && (
            <div style={{
              padding: '12px 20px', borderRadius: 12, marginBottom: 24, fontSize: 14, fontWeight: 500,
              background: message.type === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
              color: message.type === 'success' ? '#22c55e' : '#ef4444',
              border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
              {message.text}
            </div>
          )}

          {/* Shop items by category */}
          {categories.map(cat => {
            const catItems = items.filter(i => i.category === cat)
            if (!catItems.length) return null
            return (
              <div key={cat} style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: 'var(--t)' }}>
                  {categoryLabels[cat]}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                  {catItems.map(item => (
                    <div key={item.id} style={{
                      background: 'var(--c)', border: '1px solid var(--br)', borderRadius: 16,
                      padding: 24, display: 'flex', flexDirection: 'column', gap: 12,
                      transition: 'border-color 0.2s',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 28 }}>{item.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--t)' }}>{item.name}</div>
                          <div style={{ fontSize: 13, color: 'var(--ts)' }}>{item.description}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#FFD700', fontWeight: 700, fontSize: 16 }}>
                          <Coin size={18} /> {item.price}
                        </div>
                        <button
                          onClick={() => handlePurchase(item.id)}
                          disabled={buying === item.id || !item.can_afford}
                          style={{
                            padding: '8px 18px', borderRadius: 10, border: 'none', cursor: item.can_afford ? 'pointer' : 'not-allowed',
                            fontWeight: 600, fontSize: 13, fontFamily: 'var(--f)',
                            background: item.can_afford ? 'var(--a)' : 'var(--br)',
                            color: item.can_afford ? '#fff' : 'var(--ts)',
                            opacity: buying === item.id ? 0.6 : 1,
                            transition: 'opacity 0.2s',
                          }}
                        >
                          {buying === item.id ? 'Köper...' : item.can_afford ? 'Köp' : `Saknar ${item.coins_needed}`}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Transaction history */}
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: 'var(--t)' }}>
              Transaktionshistorik
            </h2>
            {transactions.length === 0 ? (
              <p style={{ color: 'var(--ts)', fontSize: 14 }}>Inga transaktioner ännu.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {transactions.map(tx => (
                  <div key={tx.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', background: 'var(--c)', border: '1px solid var(--br)',
                    borderRadius: 12, fontSize: 14,
                  }}>
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--t)' }}>{tx.description || tx.type}</div>
                      <div style={{ fontSize: 12, color: 'var(--ts)', marginTop: 2 }}>
                        {new Date(tx.created_at).toLocaleDateString('sv-SE')}
                      </div>
                    </div>
                    <div style={{
                      fontWeight: 700, fontSize: 15,
                      color: tx.amount > 0 ? '#22c55e' : '#ef4444',
                    }}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </div>
                  </div>
                ))}
                {txOffset < txTotal && (
                  <button
                    onClick={loadMoreTx}
                    style={{
                      padding: '10px 20px', borderRadius: 10, border: '1px solid var(--br)',
                      background: 'transparent', color: 'var(--t)', cursor: 'pointer',
                      fontFamily: 'var(--f)', fontSize: 14, fontWeight: 500, marginTop: 8,
                    }}
                  >
                    Visa fler
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
