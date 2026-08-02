import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import ParticleGift from './ParticleGift'

const START_DATE = new Date('2024-01-01')
const CORRECT_PIN = '1212'

// --- THE LIVELY GIFT CATALOG WITH PRICES ---
const LIVELY_GIFTS = [
  { label: 'Good Morning ☀️', price: 50, category: 'Daily Love' },
  { label: 'Goodnight 🌙', price: 50, category: 'Daily Love' },
  { label: 'Miss You 💔', price: 100, category: 'Emotions' },
  { label: 'Thinking of You 💭', price: 80, category: 'Emotions' },
  { label: 'Sleepy Time 💤', price: 50, category: 'Daily Love' },
  { label: 'Hugs 🫂', price: 150, category: 'Physical Touch' },
  { label: 'Kisses 💋', price: 200, category: 'Physical Touch' },
  { label: 'Crying On My Shoulder 😢', price: 100, category: 'Emotions' },
  { label: 'Breakfast in Bed 🥞', price: 150, category: 'Food & Drink' },
  { label: 'Romantic Dinner 🍷', price: 250, category: 'Food & Drink' },
  { label: 'Movie Night 🎬', price: 150, category: 'Entertainment' },
  { label: 'Spa Date 🧖', price: 300, category: 'Luxury' },
  { label: 'Road Trip 🚗', price: 300, category: 'Adventure' },
  { label: 'Just Because 🌟', price: 100, category: 'Surprise' },
  { label: 'Celebration 🎉', price: 300, category: 'Luxury' },
  { label: 'Random Hug 🤗', price: 80, category: 'Physical Touch' },
]

const timeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + ' years ago'
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + ' months ago'
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + ' days ago'
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + ' hours ago'
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + ' mins ago'
  return Math.floor(seconds) === 0 ? 'Just now' : Math.floor(seconds) + ' seconds ago'
}

const randomColor = () => {
  const colors = ['#ffe4e6', '#fce7f3', '#f3e8ff', '#ede9fe', '#e0f2fe', '#ccfbf1', '#fef3c7']
  return colors[Math.floor(Math.random() * colors.length)]
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [pin, setPin] = useState('')
  const [currentView, setCurrentView] = useState('home')
  const [toast, setToast] = useState(null)
  
  const [photos, setPhotos] = useState([])
  const [plans, setPlans] = useState([])
  const [gifts, setGifts] = useState([])
  const [timelines, setTimelines] = useState([])
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [messages, setMessages] = useState([])
  
  // --- LOVELY NEW STATES ---
  const [walletBalance, setWalletBalance] = useState(1000) // Starts with 1000 love points
  const [planCategory, setPlanCategory] = useState('General')

  const [planTitle, setPlanTitle] = useState('')
  const [planDate, setPlanDate] = useState('')
  const [giftMsg, setGiftMsg] = useState('')
  const [giftType, setGiftType] = useState('Custom Message')
  const [isUploading, setIsUploading] = useState(false)
  const [tlTitle, setTlTitle] = useState('')
  const [tlDesc, setTlDesc] = useState('')
  const [tlDate, setTlDate] = useState('')
  const [newQuestionText, setNewQuestionText] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  
  const [myName, setMyName] = useState('You') 
  const [chatInput, setChatInput] = useState('')

  const [activeParticleGift, setActiveParticleGift] = useState(null)
  const [openingGift, setOpeningGift] = useState(null)

  // Load wallet from LocalStorage on device boot
  useEffect(() => {
    const saved = localStorage.getItem('love_wallet')
    if (saved) setWalletBalance(parseInt(saved))
    else localStorage.setItem('love_wallet', '1000')
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (pin === CORRECT_PIN) setIsLoggedIn(true)
    else { showToast('Wrong PIN!', 'error'); setPin('') }
  }

  const fetchPhotos = async () => {
    const { data } = await supabase.from('photos').select('*').order('created_at', { ascending: false })
    if (data) setPhotos(data)
  }
  const fetchPlans = async () => {
    const { data } = await supabase.from('plans').select('*').order('due_date', { ascending: true })
    if (data) setPlans(data)
  }
  const fetchGifts = async () => {
    const { data } = await supabase.from('gifts').select('*').order('given_at', { ascending: false })
    if (data) setGifts(data)
  }
  const fetchTimeline = async () => {
    const { data } = await supabase.from('timeline').select('*').order('memory_date', { ascending: false })
    if (data) setTimelines(data)
  }
  const fetchChatMessages = async () => {
    const { data } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: true })
    if (data) setMessages(data)
  }
  const fetchQuestions = async () => {
    const { data } = await supabase.from('questions').select('*').order('created_at', { ascending: false })
    if (data) {
      setQuestions(data)
      data.forEach(async (q) => {
        const { data: ansData } = await supabase.from('answers').select('*').eq('question_id', q.id).order('created_at', { ascending: true })
        if (ansData) setAnswers(prev => ({ ...prev, [q.id]: ansData }))
      })
    }
  }

  // --- ACTIONS ---
  const uploadPhoto = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setIsUploading(true)
    const path = `family_${Date.now()}.${file.name.split('.').pop()}`
    const { error } = await supabase.storage.from('gallery').upload(path, file)
    if (!error) {
      const publicUrl = `https://vnxtrumkvuvsuhhvucjm.supabase.co/storage/v1/object/public/gallery/${path}`
      await supabase.from('photos').insert({ storage_path: publicUrl })
      await fetchPhotos()
      showToast('📸 Media uploaded!')
    } else {
      showToast('Upload failed! Did you run the SQL policy?', 'error')
    }
    setIsUploading(false)
  }
  const deletePhoto = async (id) => {
    await supabase.from('photos').delete().eq('id', id); fetchPhotos(); showToast('Photo deleted')
  }

  const addPlan = async () => {
    if (!planTitle || !planDate) return showToast('Fill in title & date!', 'error')
    await supabase.from('plans').insert({ title: planTitle, due_date: planDate, category: planCategory })
    setPlanTitle(''); setPlanDate(''); fetchPlans(); showToast(`📅 Plan added!`)
  }
  const togglePlan = async (id, currentStatus) => {
    await supabase.from('plans').update({ status: currentStatus === 'done' ? 'pending' : 'done' }).eq('id', id)
    fetchPlans()
  }
  const deletePlan = async (id) => {
    await supabase.from('plans').delete().eq('id', id); fetchPlans(); showToast('Plan deleted')
  }

  // --- THE WALLET & GIFT SENDING LOGIC (VIRTUAL PAYMENT) ---
  const sendGift = async (livelyGift = null) => {
    let finalMessage = giftMsg;
    let finalPrice = 0;
    let finalCategory = 'Custom';

    // If sending a lively gift from the catalog
    if (livelyGift) {
      finalMessage = livelyGift.label;
      finalPrice = livelyGift.price;
      finalCategory = livelyGift.category;
    } else {
      // Handle custom box
      if (!giftMsg) return showToast('Write a message!', 'error')
      finalPrice = 50; // Base price for custom
      finalCategory = giftType === 'Custom Message' ? 'Custom' : 'Luxury';
      if (giftType !== 'Custom Message') {
        const giftEmojis = {
          'Jewelry': '💍', 'Subscription Box': '📦', 'Luxury Weighted Blanket': '🛏️',
          'Spa Package': '🧖', 'Digital Gift Card': '💳'
        };
        finalMessage = `${giftEmojis[giftType] || '🎁'} ${giftType}: ${giftMsg}`;
        finalPrice = 200; // Luxury items are more expensive
      }
    }

    // CHECK THE WALLET
    if (walletBalance < finalPrice) {
      showToast(`Not enough Love Points! Need ${finalPrice - walletBalance} more 💖`, 'error');
      return;
    }

    // DEDUCT FROM WALLET & SAVE TO LOCAL STORAGE
    const newBalance = walletBalance - finalPrice;
    setWalletBalance(newBalance);
    localStorage.setItem('love_wallet', newBalance.toString());

    // SAVE TO DATABASE
    const { error } = await supabase.from('gifts').insert({ 
      message: finalMessage,
      price: finalPrice,
      category: finalCategory,
      is_opened: false
    });

    if (!error) {
      setGiftMsg(''); await fetchGifts(); 
      // Special magic animation if it's a high value gift
      if (finalPrice >= 200) {
        setActiveParticleGift({ message: `🎁 You sent a ${finalPrice} Shilling gift!`, color: '#f43f5e' });
      }
      showToast(`🎁 ${finalMessage} sent! (${finalPrice} Shillings)`);
    } else showToast('Failed to send', 'error');
  }

  const sendHeartGift = async () => {
    const livelyGift = LIVELY_GIFTS.find(g => g.label === 'Celebration 🎉');
    await sendGift(livelyGift);
  }

  const deleteGift = async (id) => {
    await supabase.from('gifts').delete().eq('id', id); fetchGifts(); showToast('Gift removed')
  }

  const openGift = async (gift) => {
    if (openingGift) return;
    setOpeningGift(gift.id)
    setActiveParticleGift({ 
      message: `💝 ${gift.message}`, 
      color: '#f43f5e' 
    })
    await supabase.from('gifts').update({ is_opened: true, opened_at: new Date() }).eq('id', gift.id)
    await fetchGifts()
    setOpeningGift(null)
  }

  const addTimeline = async () => {
    if (!tlTitle || !tlDate) return showToast('Fill in title & date!', 'error')
    await supabase.from('timeline').insert({ title: tlTitle, description: tlDesc || 'A beautiful memory ✨', memory_date: tlDate })
    setTlTitle(''); setTlDesc(''); setTlDate(''); fetchTimeline(); showToast('🗺️ Memory added!')
  }
  const deleteTimeline = async (id) => {
    await supabase.from('timeline').delete().eq('id', id); fetchTimeline(); showToast('Memory removed')
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return
    await supabase.from('chat_messages').insert({ sender_name: myName, message: chatInput })
    setChatInput('')
  }

  const askRandomQuestion = async () => {
    const { data } = await supabase.from('questions').select('*').order('random()').limit(1).single()
    if (data) { setNewQuestionText(''); showToast('📥 Question added!'); fetchQuestions() } 
    else showToast('Run the SQL seed!', 'error')
  }
  const askManualQuestion = async () => {
    if (!newQuestionText) return showToast('Write your own question!', 'error')
    await supabase.from('questions').insert({ text: newQuestionText, category: 'Manual' })
    setNewQuestionText(''); showToast('📥 Your question was sent!'); fetchQuestions()
  }
  const submitReply = async (questionId) => {
    if (!replyText) return showToast('Write a reply!', 'error')
    await supabase.from('answers').insert({ question_id: questionId, answer: replyText })
    setReplyText(''); setReplyingTo(null); fetchQuestions(); showToast('💬 Reply sent!')
  }

  // --- REALTIME SUBSCRIPTIONS ---
  useEffect(() => {
    if (currentView === 'chat') {
      fetchChatMessages()
      const channel = supabase.channel('chat_messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, payload => setMessages(prev => [...prev, payload.new]))
        .subscribe()
      return () => supabase.removeChannel(channel)
    }
  }, [currentView])

  useEffect(() => {
    if (currentView === 'gallery') {
      fetchPhotos()
      const channel = supabase.channel('photos')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos' }, payload => setPhotos(prev => [payload.new, ...prev]))
        .subscribe()
      return () => supabase.removeChannel(channel)
    }
  }, [currentView])

  useEffect(() => {
    if (currentView === 'gifts') {
      fetchGifts()
      const channel = supabase.channel('gifts')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gifts' }, payload => setGifts(prev => [payload.new, ...prev]))
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'gifts' }, payload => {
          setGifts(prev => prev.map(g => g.id === payload.new.id ? payload.new : g))
        })
        .subscribe()
      return () => supabase.removeChannel(channel)
    }
  }, [currentView])

  useEffect(() => {
    if (currentView === 'timeline') {
      fetchTimeline()
      const channel = supabase.channel('timeline')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'timeline' }, payload => setTimelines(prev => [payload.new, ...prev]))
        .subscribe()
      return () => supabase.removeChannel(channel)
    }
  }, [currentView])

  useEffect(() => {
    if (currentView === 'questions') {
      fetchQuestions()
      const qChannel = supabase.channel('questions')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'questions' }, payload => setQuestions(prev => [payload.new, ...prev]))
        .subscribe()
      const aChannel = supabase.channel('answers')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'answers' }, payload => {
          const qId = payload.new.question_id;
          setAnswers(prev => ({ ...prev, [qId]: [...(prev[qId] || []), payload.new] }));
        })
        .subscribe()
      return () => { supabase.removeChannel(qChannel); supabase.removeChannel(aChannel); }
    }
  }, [currentView])

  const daysTogether = Math.floor((new Date() - START_DATE) / (1000 * 60 * 60 * 24))

  if (!isLoggedIn) {
    return (
      <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#fff0f5', fontFamily:'"Inter", sans-serif'}}>
        <div style={{background:'white', padding:'3rem 2.5rem', borderRadius:'2rem', boxShadow:'0 20px 40px rgba(244, 63, 94, 0.15)', textAlign:'center', maxWidth:'350px', width:'100%'}}>
          <h1 style={{color:'#f43f5e', fontSize:'2rem', fontWeight:'700', marginBottom:'0.5rem'}}>Welcome Home</h1>
          <p style={{color:'#f43f5e', fontSize:'1.5rem', marginBottom:'1.5rem'}}>💕</p>
          <p style={{color:'#6b7280', fontSize:'0.9rem', marginBottom:'1.5rem'}}>Enter your secret PIN</p>
          <input type="password" placeholder="1212" maxLength="4" value={pin} onChange={(e) => setPin(e.target.value)} style={{width:'100%', padding:'1rem', fontSize:'1.5rem', textAlign:'center', border:'2px solid #fce4ec', borderRadius:'1rem', outline:'none', marginBottom:'1.5rem', letterSpacing:'8px', background:'#fff0f5'}} />
          <button onClick={handleLogin} style={{width:'100%', background:'#f43f5e', color:'white', padding:'1rem', border:'none', borderRadius:'1rem', fontSize:'1rem', fontWeight:'600', cursor:'pointer', transition:'0.2s', boxShadow:'0 4px 12px rgba(244, 63, 94, 0.3)'}} onMouseOver={(e) => e.target.style.transform='scale(1.02)'} onMouseOut={(e) => e.target.style.transform='scale(1)'}>Unlock 💕</button>
        </div>
      </div>
    )
  }

  if (activeParticleGift) {
    return <ParticleGift message={activeParticleGift.message} color={activeParticleGift.color} onClose={() => setActiveParticleGift(null)} />
  }

  // --- VIEWS ---
  if (currentView === 'gallery') {
    return (
      <ViewWrapper title="📸 Shared Gallery" goHome={() => setCurrentView('home')}>
        <div style={{marginBottom:'1.5rem'}}>
          <input type="file" accept="image/*,video/*" capture="environment" onChange={uploadPhoto} disabled={isUploading} style={{display:'none'}} id="upload" />
          <label htmlFor="upload" style={{display:'inline-block', background:'#f43f5e', color:'white', padding:'0.75rem 2rem', borderRadius:'2rem', cursor:'pointer', fontWeight:'600', fontSize:'0.95rem', transition:'0.2s', boxShadow:'0 4px 8px rgba(244, 63, 94, 0.2)'}}>{isUploading ? 'Uploading...' : '📸 Photo / Video'}</label>
        </div>
        {photos.length === 0 ? (
          <div style={{padding:'3rem 1rem', background:'white', borderRadius:'1rem', color:'#9ca3af', border:'2px dashed #e5e7eb'}}>
            <div style={{fontSize:'3rem'}}>🖼️</div>
            <p>No memories yet. Take a photo together!</p>
          </div>
        ) : (
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'1.5rem'}}>
            {photos.map(p => {
              const isVideo = p.storage_path.endsWith('.mp4') || p.storage_path.endsWith('.mov');
              return (
                <div key={p.id} style={{position:'relative', borderRadius:'1rem', overflow:'hidden', boxShadow:'0 4px 12px rgba(0,0,0,0.08)', transition:'0.3s', aspectRatio:'1', background:'#f3f4f6'}}>
                  {isVideo ? (
                    <video src={p.storage_path} controls style={{width:'100%', height:'100%', objectFit:'cover'}} />
                  ) : (
                    <img src={p.storage_path} alt="memory" style={{width:'100%', height:'100%', objectFit:'cover'}} onError={(e) => { e.target.src = 'https://placehold.co/160x160/fce4ec/f43f5e?text=❤️'; }} />
                  )}
                  <button onClick={() => deletePhoto(p.id)} style={{position:'absolute', top:'8px', right:'8px', background:'rgba(0,0,0,0.6)', color:'white', border:'none', borderRadius:'50%', width:'28px', height:'28px', cursor:'pointer', fontWeight:'bold', fontSize:'14px', display:'flex', justifyContent:'center', alignItems:'center'}}>✕</button>
                </div>
              )
            })}
          </div>
        )}
      </ViewWrapper>
    )
  }

  if (currentView === 'timeline') {
    return (
      <ViewWrapper title="🗺️ History Tree" goHome={() => setCurrentView('home')}>
        <div style={{display:'flex', flexWrap:'wrap', gap:'0.75rem', justifyContent:'center', marginBottom:'2rem'}}>
          <input type="text" placeholder="Memory title..." value={tlTitle} onChange={(e) => setTlTitle(e.target.value)} style={{padding:'0.75rem 1rem', border:'1px solid #e5e7eb', borderRadius:'0.75rem', outline:'none', width:'180px'}} />
          <input type="text" placeholder="Description" value={tlDesc} onChange={(e) => setTlDesc(e.target.value)} style={{padding:'0.75rem 1rem', border:'1px solid #e5e7eb', borderRadius:'0.75rem', outline:'none', width:'180px'}} />
          <input type="date" value={tlDate} onChange={(e) => setTlDate(e.target.value)} style={{padding:'0.75rem 1rem', border:'1px solid #e5e7eb', borderRadius:'0.75rem', outline:'none'}} />
          <button onClick={addTimeline} style={{background:'#f43f5e', color:'white', padding:'0.75rem 1.5rem', border:'none', borderRadius:'0.75rem', fontWeight:'600', cursor:'pointer'}}>Add to Tree</button>
        </div>
        <div style={{maxWidth:'600px', margin:'0 auto', textAlign:'left'}}>
          {timelines.map((t, idx) => (
            <div key={t.id} style={{display:'flex', gap:'1rem', marginBottom:'1.5rem', position:'relative'}}>
              <div style={{background:'#f43f5e', color:'white', borderRadius:'50%', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', zIndex:2, boxShadow:'0 0 0 4px #fff0f5'}}>{idx + 1}</div>
              <div style={{flex:1, background:'white', padding:'1rem', borderRadius:'1rem', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', position:'relative'}}>
                <div style={{fontWeight:'600', fontSize:'1rem'}}>{t.title}</div>
                <div style={{fontSize:'0.9rem', color:'#4b5563'}}>{t.description}</div>
                <div style={{fontSize:'0.8rem', color:'#9ca3af', marginTop:'0.5rem'}}>📅 {new Date(t.memory_date).toLocaleDateString()}</div>
                <button onClick={() => deleteTimeline(t.id)} style={{position:'absolute', top:'8px', right:'8px', background:'none', border:'none', color:'#9ca3af', cursor:'pointer', fontSize:'0.9rem'}}>✕</button>
              </div>
            </div>
          ))}
          {timelines.length === 0 && <p style={{textAlign:'center', color:'#9ca3af', padding:'2rem'}}>Start building your family history tree! 🌳</p>}
        </div>
      </ViewWrapper>
    )
  }

  if (currentView === 'chat') {
    return (
      <div style={{fontFamily:'"Inter", sans-serif', height:'100vh', background:'#f0f2f5', display:'flex', flexDirection:'column', overflow:'hidden'}}>
        <div style={{background:'#f43f5e', color:'white', padding:'1rem 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}}>
          <button onClick={() => setCurrentView('home')} style={{background:'none', border:'none', color:'white', fontSize:'1.2rem', cursor:'pointer'}}>←</button>
          <div style={{fontWeight:'700', fontSize:'1.1rem'}}>💬 Family Chat</div>
          <div style={{width:'24px'}}></div>
        </div>
        <div style={{padding:'0.75rem 1rem', background:'white', borderBottom:'1px solid #e5e7eb', textAlign:'center', fontSize:'0.9rem'}}>
          <span style={{color:'#4b5563'}}>Your name: </span>
          <input type="text" value={myName} onChange={(e) => setMyName(e.target.value)} style={{padding:'0.25rem 0.5rem', border:'1px solid #d1d5db', borderRadius:'0.5rem', outline:'none'}} />
        </div>
        <div style={{flex:1, overflowY:'auto', padding:'1rem 1.5rem', display:'flex', flexDirection:'column', gap:'0.75rem'}}>
          {messages.map((msg) => {
            const isMe = msg.sender_name === myName;
            return (
              <div key={msg.id} style={{display:'flex', flexDirection:'column', alignItems: isMe ? 'flex-end' : 'flex-start'}}>
                <div style={{maxWidth:'75%', background: isMe ? '#f43f5e' : '#ffffff', color: isMe ? 'white' : '#1f2937', padding:'0.75rem 1rem', borderRadius: isMe ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0', boxShadow:'0 1px 2px rgba(0,0,0,0.05)'}}>
                  {isMe ? null : <div style={{fontSize:'0.75rem', fontWeight:'600', marginBottom:'0.2rem', color:'#f43f5e'}}>{msg.sender_name}</div>}
                  <div>{msg.message}</div>
                </div>
                <div style={{fontSize:'0.7rem', color:'#9ca3af', marginTop:'0.25rem'}}>{timeAgo(msg.created_at)}</div>
              </div>
            )
          })}
        </div>
        <div style={{background:'white', padding:'0.75rem 1rem', display:'flex', gap:'0.75rem', borderTop:'1px solid #e5e7eb'}}>
          <input type="text" placeholder="Type a message..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()} style={{flex:1, padding:'0.75rem 1rem', border:'1px solid #e5e7eb', borderRadius:'2rem', outline:'none'}} />
          <button onClick={sendChatMessage} style={{background:'#f43f5e', color:'white', padding:'0.75rem 1.5rem', border:'none', borderRadius:'2rem', fontWeight:'600', cursor:'pointer'}}>Send</button>
        </div>
      </div>
    )
  }

  if (currentView === 'questions') {
    return (
      <ViewWrapper title="📥 Question Inbox" goHome={() => setCurrentView('home')}>
        <div style={{display:'flex', flexWrap:'wrap', gap:'0.75rem', justifyContent:'center', marginBottom:'2rem'}}>
          <input type="text" placeholder="Write your own question..." value={newQuestionText} onChange={(e) => setNewQuestionText(e.target.value)} style={{flex:'1', padding:'0.75rem 1rem', border:'1px solid #e5e7eb', borderRadius:'0.75rem', outline:'none', minWidth:'200px'}} />
          <button onClick={askManualQuestion} style={{background:'#1f2937', color:'white', padding:'0.75rem 1.5rem', border:'none', borderRadius:'0.75rem', fontWeight:'600', cursor:'pointer'}}>Ask Manual</button>
          <button onClick={askRandomQuestion} style={{background:'#f43f5e', color:'white', padding:'0.75rem 1.5rem', border:'none', borderRadius:'0.75rem', fontWeight:'600', cursor:'pointer'}}>Surprise Me ✨</button>
        </div>
        <div style={{maxWidth:'600px', margin:'0 auto'}}>
          {questions.length === 0 ? <p style={{color:'#9ca3af'}}>No questions yet. Click "Surprise Me"!</p> : (
            questions.map(q => (
              <div key={q.id} style={{background:'white', padding:'1.5rem', borderRadius:'1.5rem', marginBottom:'1.5rem', boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
                <div style={{fontWeight:'600', fontSize:'1.1rem', color:'#1f2937', marginBottom:'0.5rem'}}>"{q.text}"</div>
                <div style={{fontSize:'0.8rem', color:'#9ca3af', marginBottom:'1rem'}}>{(answers[q.id] || []).length} replies</div>
                {(answers[q.id] || []).map(a => <div key={a.id} style={{background:'#f9fafb', padding:'0.75rem 1rem', borderRadius:'0.75rem', marginBottom:'0.5rem', borderLeft:'4px solid #f43f5e'}}>💬 {a.answer}</div>)}
                {replyingTo === q.id ? (
                  <div style={{display:'flex', gap:'0.5rem', marginTop:'1rem'}}>
                    <input type="text" placeholder="Write your reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} style={{flex:'1', padding:'0.75rem 1rem', border:'1px solid #e5e7eb', borderRadius:'0.75rem', outline:'none'}} />
                    <button onClick={() => submitReply(q.id)} style={{background:'#1f2937', color:'white', padding:'0.75rem 1.5rem', border:'none', borderRadius:'0.75rem', fontWeight:'600', cursor:'pointer'}}>Reply</button>
                    <button onClick={() => setReplyingTo(null)} style={{background:'none', border:'none', color:'#6b7280', cursor:'pointer'}}>Cancel</button>
                  </div>
                ) : <button onClick={() => setReplyingTo(q.id)} style={{background:'none', border:'none', color:'#f43f5e', cursor:'pointer', fontWeight:'500', fontSize:'0.9rem', marginTop:'0.5rem', padding:'0'}}>Add a reply 💬</button>}
              </div>
            ))
          )}
        </div>
      </ViewWrapper>
    )
  }

  if (currentView === 'plans') {
    return (
      <ViewWrapper title="📅 Shared Plans" goHome={() => setCurrentView('home')}>
        <div style={{display:'flex', flexWrap:'wrap', gap:'0.75rem', justifyContent:'center', marginBottom:'2rem'}}>
          <select value={planCategory} onChange={(e) => setPlanCategory(e.target.value)} style={{padding:'0.75rem 1rem', border:'1px solid #e5e7eb', borderRadius:'0.75rem', outline:'none', background:'white'}}>
            <option value="General">General</option>
            <option value="Date Night">Date Night 💑</option>
            <option value="Family Trip">Family Trip 🚗</option>
            <option value="Home Project">Home Project 🛠️</option>
            <option value="Health & Wellness">Health & Wellness 🧘</option>
          </select>
          <input type="text" placeholder="Plan title..." value={planTitle} onChange={(e) => setPlanTitle(e.target.value)} style={{padding:'0.75rem 1rem', border:'1px solid #e5e7eb', borderRadius:'0.75rem', outline:'none', width:'200px'}} />
          <input type="date" value={planDate} onChange={(e) => setPlanDate(e.target.value)} style={{padding:'0.75rem 1rem', border:'1px solid #e5e7eb', borderRadius:'0.75rem', outline:'none'}} />
          <button onClick={addPlan} style={{background:'#f43f5e', color:'white', padding:'0.75rem 1.5rem', border:'none', borderRadius:'0.75rem', fontWeight:'600', cursor:'pointer'}}>Add Plan</button>
        </div>
        <div style={{maxWidth:'600px', margin:'0 auto'}}>
          {plans.map(p => {
            const isOverdue = new Date(p.due_date) < new Date() && p.status !== 'done'
            const categoryColors = {
              'Date Night': '#fce7f3', 'Family Trip': '#e0f2fe', 'Home Project': '#fef3c7', 'Health & Wellness': '#d1fae5', 'General': '#f3f4f6'
            };
            return (
              <div key={p.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', background: categoryColors[p.category] || '#f3f4f6', padding:'0.75rem 1.5rem', margin:'0.75rem 0', borderRadius:'1rem', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', borderLeft: isOverdue ? '6px solid #ef4444' : p.status === 'done' ? '6px solid #22c55e' : '6px solid #f43f5e', opacity: p.status === 'done' ? '0.7' : '1'}}>
                <span onClick={() => togglePlan(p.id, p.status)} style={{cursor:'pointer', flex:'1', textDecoration: p.status === 'done' ? 'line-through' : 'none', color: isOverdue && p.status !== 'done' ? '#ef4444' : '#1f2937'}}><b>{p.title}</b> <span style={{fontSize:'0.8rem', background:'rgba(0,0,0,0.05)', padding:'0.2rem 0.5rem', borderRadius:'0.5rem', marginLeft:'0.5rem'}}>{p.category}</span> <span style={{fontSize:'0.85rem', color:'#6b7280', marginLeft:'0.5rem'}}>({new Date(p.due_date).toLocaleDateString()})</span></span>
                <div style={{display:'flex', gap:'0.75rem', alignItems:'center'}}>
                  <span style={{fontSize:'1.2rem'}}>{p.status === 'done' ? '✅' : (isOverdue ? '⚠️' : '⬜')}</span>
                  <button onClick={() => deletePlan(p.id)} style={{background:'none', border:'none', color:'#9ca3af', cursor:'pointer', fontSize:'1rem'}} onMouseOver={(e) => e.target.style.color='#ef4444'} onMouseOut={(e) => e.target.style.color='#9ca3af'}>🗑️</button>
                </div>
              </div>
            )
          })}
        </div>
      </ViewWrapper>
    )
  }

  if (currentView === 'gifts') {
    return (
      <ViewWrapper title="🎁 Gifts" goHome={() => setCurrentView('home')}>
        {/* WALLET AND TOP UP */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'white', padding:'0.75rem 1.5rem', borderRadius:'1rem', marginBottom:'1.5rem', boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
          <div><span style={{fontWeight:'bold', color:'#f43f5e'}}>💖 Love Points:</span> <span style={{fontWeight:'700', fontSize:'1.2rem', color:'#1f2937'}}>{walletBalance}</span></div>
          <button onClick={() => { const newBal = walletBalance + 500; setWalletBalance(newBal); localStorage.setItem('love_wallet', newBal.toString()); showToast('500 Love Points Added! 💖'); }} style={{background:'#1f2937', color:'white', padding:'0.5rem 1rem', border:'none', borderRadius:'0.75rem', fontWeight:'600', cursor:'pointer'}}>Boost Love 💖</button>
        </div>

        {/* SEND CUSTOM GIFT */}
        <div style={{display:'flex', flexWrap:'wrap', gap:'0.75rem', justifyContent:'center', marginBottom:'1.5rem'}}>
          <input type="text" placeholder="Custom message..." value={giftMsg} onChange={(e) => setGiftMsg(e.target.value)} style={{flex:'1', padding:'0.75rem 1rem', border:'1px solid #e5e7eb', borderRadius:'0.75rem', outline:'none', minWidth:'150px'}} />
          <button onClick={() => sendGift()} style={{background:'#f43f5e', color:'white', padding:'0.75rem 1.5rem', border:'none', borderRadius:'0.75rem', fontWeight:'600', cursor:'pointer'}}>Send Custom (50💰)</button>
        </div>

        {/* LIVELY GIFT CATALOG */}
        <div style={{marginBottom:'2rem'}}>
          <h3 style={{textAlign:'center', color:'#6b7280', marginBottom:'1rem'}}>✨ Choose a Lively Gift</h3>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'0.75rem'}}>
            {LIVELY_GIFTS.map((g, idx) => (
              <div key={idx} onClick={() => sendGift(g)} style={{background:'white', padding:'0.75rem 1rem', borderRadius:'1rem', textAlign:'center', cursor:'pointer', boxShadow:'0 2px 4px rgba(0,0,0,0.05)', transition:'0.2s', border:'1px solid transparent'}} onMouseOver={(e) => {e.target.style.transform='scale(1.02)'; e.target.style.borderColor='#f43f5e';}} onMouseOut={(e) => {e.target.style.transform='scale(1)'; e.target.style.borderColor='transparent';}}>
                <div style={{fontSize:'1.2rem'}}>{g.label}</div>
                <div style={{fontSize:'0.7rem', color:'#9ca3af'}}>{g.category}</div>
                <div style={{fontSize:'0.8rem', fontWeight:'bold', color:'#10b981', marginTop:'0.25rem'}}>{g.price} Shillings</div>
              </div>
            ))}
          </div>
        </div>

        {/* GIFT LIST */}
        <div style={{maxWidth:'600px', margin:'0 auto'}}>
          {gifts.length === 0 ? <div style={{padding:'2rem', color:'#9ca3af', fontStyle:'italic'}}>Send your first gift!</div> : (
            gifts.map(g => (
              <div key={g.id} onClick={() => !g.is_opened && openGift(g)} style={{cursor: !g.is_opened ? 'pointer' : 'default', margin:'0.75rem 0', transition:'0.3s', animation: 'giftFadeIn 0.5s ease-out'}}>
                <div style={{background: g.is_opened ? '#d1fae5' : randomColor(), padding:'1rem 1.5rem', borderRadius:'1.5rem', borderBottomLeftRadius:'0.5rem', position:'relative', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', textAlign:'left', border: g.is_opened ? '2px solid #10b981' : 'none'}}>
                  
                  {!g.is_opened ? (
                    // The Gift Box
                    <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
                      <div style={{fontSize:'1.5rem'}}>🎁</div>
                      <div>
                        <div style={{fontWeight:'600', fontSize:'1rem', color:'#1f2937'}}>{g.message}</div>
                        <div style={{fontSize:'0.75rem', color:'#6b7280', display:'flex', gap:'0.5rem', alignItems:'center'}}>
                          <span>💌 {timeAgo(g.given_at)}</span> 
                          <span style={{background:'#f43f5e', color:'white', padding:'0.1rem 0.5rem', borderRadius:'1rem', fontSize:'0.65rem', fontWeight:'bold'}}>Click to Open</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // The Opened View
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <div>
                        <div style={{fontWeight:'600', fontSize:'1rem', color:'#065f46'}}>🎉 Opened!</div>
                        <div style={{fontSize:'0.85rem', color:'#4b5563', marginTop:'0.25rem'}}>"{g.message}"</div>
                        <div style={{fontSize:'0.7rem', color:'#6b7280'}}>💌 {timeAgo(g.opened_at || g.given_at)}</div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteGift(g.id); }} style={{background:'none', border:'none', fontSize:'0.9rem', cursor:'pointer', opacity:'0.5', transition:'0.2s', padding:'0'}} onMouseOver={(e) => e.target.style.opacity='1'} onMouseOut={(e) => e.target.style.opacity='0.5'}>🗑️</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        <style>{`
          @keyframes giftFadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </ViewWrapper>
    )
  }

  // --- HOME ---
  return (
    <div style={{fontFamily:'"Inter", sans-serif', minHeight:'100vh', background:'#fff0f5', padding:'2rem 1rem'}}>
      <div style={{maxWidth:'800px', margin:'0 auto'}}>
        <div style={{background:'rgba(255, 255, 255, 0.7)', backdropFilter:'blur(10px)', borderRadius:'2rem', padding:'3rem 2rem', boxShadow:'0 20px 40px rgba(244, 63, 94, 0.1)', textAlign:'center', marginBottom:'2rem'}}>
          <div style={{fontSize:'4rem', marginBottom:'0.5rem'}}>💕</div>
          <h1 style={{color:'#f43f5e', fontSize:'2.2rem', fontWeight:'700', marginBottom:'0.5rem'}}>Family Hub</h1>
          <div style={{fontSize:'0.95rem', color:'#6b7280'}}><span style={{fontWeight:'600', color:'#f43f5e'}}>{daysTogether}</span> beautiful days together 💫</div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'1rem'}}>
          <MenuCard icon="📸" title="Gallery" action={() => setCurrentView('gallery')} />
          <MenuCard icon="🗺️" title="History Tree" action={() => setCurrentView('timeline')} />
          <MenuCard icon="📥" title="Inbox" action={() => setCurrentView('questions')} />
          <MenuCard icon="💬" title="Chat" action={() => setCurrentView('chat')} />
          <MenuCard icon="📅" title="Plans" action={() => setCurrentView('plans')} />
          <MenuCard icon="🎁" title="Gifts" action={() => setCurrentView('gifts')} />
        </div>
        <button onClick={() => setIsLoggedIn(false)} style={{display:'block', margin:'3rem auto 0', background:'#ef4444', color:'white', padding:'0.75rem 2.5rem', border:'none', borderRadius:'2rem', fontSize:'0.95rem', cursor:'pointer', fontWeight:'500'}}>Log Out</button>
      </div>
      {toast && (
        <div style={{position:'fixed', bottom:'2rem', left:'50%', transform:'translateX(-50%)', background: toast.type === 'error' ? '#ef4444' : '#22c55e', color:'white', padding:'1rem 2rem', borderRadius:'2rem', boxShadow:'0 10px 25px rgba(0,0,0,0.15)', fontWeight:'500', zIndex:1000, animation:'fadeIn 0.3s'}}>{toast.message}</div>
      )}
    </div>
  )
}

const ViewWrapper = ({ title, children, goHome }) => (
  <div style={{fontFamily:'"Inter", sans-serif', minHeight:'100vh', background:'#fff0f5', padding:'2rem 1rem', textAlign:'center'}}>
    <div style={{maxWidth:'800px', margin:'0 auto'}}>
      <button onClick={goHome} style={{background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer', color:'#f43f5e', marginBottom:'1.5rem', fontWeight:'600', display:'flex', alignItems:'center', gap:'0.5rem'}}>← Back</button>
      <h2 style={{color:'#1f2937', fontSize:'1.8rem', fontWeight:'700', marginBottom:'2rem'}}>{title}</h2>
      {children}
    </div>
  </div>
)

const MenuCard = ({ icon, title, action }) => (
  <div onClick={action} style={{background:'white', padding:'2rem 1rem', borderRadius:'1.5rem', boxShadow:'0 4px 12px rgba(0,0,0,0.05)', textAlign:'center', cursor:'pointer', transition:'all 0.2s', border:'2px solid transparent'}} onMouseOver={(e) => {e.target.style.transform='translateY(-4px)'; e.target.style.borderColor='#f43f5e';}} onMouseOut={(e) => {e.target.style.transform='translateY(0)'; e.target.style.borderColor='transparent';}}>
    <div style={{fontSize:'2.5rem', marginBottom:'0.5rem'}}>{icon}</div>
    <div style={{fontWeight:'600', color:'#1f2937'}}>{title}</div>
  </div>
)

export default App
