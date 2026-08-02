import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import ParticleGift from './ParticleGift'

// --- LIVELY GIFTS CATALOG (Expanded to 30+!) ---
const LIVELY_GIFTS = [
  { label: 'Good Morning ☀️', price: 50, category: 'Daily Love' },
  { label: 'Goodnight 🌙', price: 50, category: 'Daily Love' },
  { label: 'Miss You 💔', price: 100, category: 'Emotions' },
  { label: 'Thinking of You 💭', price: 80, category: 'Emotions' },
  { label: 'Sleepy Time 💤', price: 50, category: 'Daily Love' },
  { label: 'Hugs 🫂', price: 150, category: 'Physical Touch' },
  { label: 'Kisses 💋', price: 200, category: 'Physical Touch' },
  { label: 'Holding Hands 🤝', price: 80, category: 'Physical Touch' },
  { label: 'Crying On My Shoulder 😢', price: 100, category: 'Emotions' },
  { label: 'Serenade 🎵', price: 250, category: 'Romantic' },
  { label: 'Love Letter 💌', price: 150, category: 'Romantic' },
  { label: 'Star Gazing 🌟', price: 200, category: 'Adventure' },
  { label: 'Sunset Walk 🌅', price: 150, category: 'Adventure' },
  { label: 'Breakfast in Bed 🥞', price: 150, category: 'Food & Drink' },
  { label: 'Picnic 🧺', price: 180, category: 'Food & Drink' },
  { label: 'Coffee Date ☕', price: 100, category: 'Food & Drink' },
  { label: 'Romantic Dinner 🍷', price: 250, category: 'Food & Drink' },
  { label: 'Dancing 💃', price: 150, category: 'Entertainment' },
  { label: 'Movie Night 🎬', price: 150, category: 'Entertainment' },
  { label: 'Spa Day 🧖‍♀️', price: 300, category: 'Luxury' },
  { label: 'Date Night 💑', price: 200, category: 'Luxury' },
  { label: 'Road Trip 🚗', price: 300, category: 'Adventure' },
  { label: 'Just Because 🌟', price: 100, category: 'Surprise' },
  { label: 'Celebration 🎉', price: 300, category: 'Luxury' },
  { label: 'Deep Conversation 🗣️', price: 80, category: 'Emotions' },
  { label: 'Random Hug 🤗', price: 80, category: 'Physical Touch' },
  { label: 'Summer Vibes 🌴', price: 150, category: 'Adventure' },
  { label: 'Cuddle Time 🧸', price: 120, category: 'Physical Touch' },
  { label: 'Pancakes 🥞', price: 100, category: 'Food & Drink' },
  { label: 'Future Dreams 💭', price: 200, category: 'Romantic' },
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
  // --- USER & AUTH STATE (Custom Accounts) ---
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [pin, setPin] = useState('')
  const [loginMode, setLoginMode] = useState('login') // 'login' or 'signup'
  const [signupName, setSignupName] = useState('')
  const [signupPin, setSignupPin] = useState('')
  
  const [userProfile, setUserProfile] = useState(null) // Stores { id, name, wallet, pin }

  // --- APP STATE ---
  const [currentView, setCurrentView] = useState('home')
  const [toast, setToast] = useState(null)
  
  const [photos, setPhotos] = useState([])
  const [plans, setPlans] = useState([])
  const [gifts, setGifts] = useState([])
  const [timelines, setTimelines] = useState([])
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [messages, setMessages] = useState([])
  const [transactions, setTransactions] = useState([]) // Financial Ledger
  
  // --- INPUT STATES ---
  const [planCategory, setPlanCategory] = useState('General')
  const [planPrice, setPlanPrice] = useState('')
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
  
  const [chatInput, setChatInput] = useState('')

  const [activeParticleGift, setActiveParticleGift] = useState(null)
  const [openingGift, setOpeningGift] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // --- CUSTOM AUTH LOGIC ---
  const handleLogin = async (e) => {
    e.preventDefault()
    if (!pin) return showToast('Enter your PIN', 'error')
    const { data, error } = await supabase.from('profiles').select('*').eq('pin', pin).single()
    if (error || !data) {
      showToast('Invalid PIN!', 'error')
    } else {
      setUserProfile(data)
      setIsLoggedIn(true)
      showToast(`Welcome back, ${data.name}! 💕`)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!signupName || !signupPin || signupPin.length !== 4) return showToast('Enter a name and 4-digit PIN!', 'error')
    // Check if pin already exists
    const { data: existing } = await supabase.from('profiles').select('id').eq('pin', signupPin).maybeSingle()
    if (existing) return showToast('PIN already taken! Choose another.', 'error')
    
    const { data, error } = await supabase.from('profiles').insert({ name: signupName, pin: signupPin }).select().single()
    if (error) return showToast('Error creating account', 'error')
    setUserProfile(data)
    setIsLoggedIn(true)
    setSignupName(''); setSignupPin('')
    showToast(`Account created! Welcome, ${data.name}! 💕`)
  }

  // --- FETCHERS ---
  const fetchPhotos = async () => {
    const { data } = await supabase.from('photos').select('*').order('created_at', { ascending: false })
    if (data) setPhotos(data)
  }
  const fetchPlans = async () => {
    const { data } = await supabase.from('plans').select('*').order('due_date', { ascending: true })
    if (data) setPlans(data)
  }
  const fetchGifts = async () => {
    // Fetch all gifts, populate sender/receiver names if possible
    const { data } = await supabase.from('gifts').select('*, sender:profiles!sender_id(name), receiver:profiles!receiver_id(name)').order('given_at', { ascending: false })
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
        const { data: ansData } = await supabase.from('answers').select('*, profile:profiles(name)').eq('question_id', q.id).order('created_at', { ascending: true })
        if (ansData) setAnswers(prev => ({ ...prev, [q.id]: ansData }))
      })
    }
  }
  const fetchTransactions = async () => {
    if (!userProfile) return
    const { data } = await supabase.from('transactions').select('*').eq('profile_id', userProfile.id).order('created_at', { ascending: false })
    if (data) setTransactions(data)
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
    } else showToast('Upload failed!', 'error')
    setIsUploading(false)
  }
  const deletePhoto = async (id) => {
    await supabase.from('photos').delete().eq('id', id); fetchPhotos(); showToast('Photo deleted')
  }

  const addPlan = async () => {
    if (!planTitle || !planDate) return showToast('Fill in title & date!', 'error')
    await supabase.from('plans').insert({ title: planTitle, due_date: planDate, category: planCategory, target_price: parseInt(planPrice) || 0 })
    setPlanTitle(''); setPlanDate(''); setPlanPrice(''); fetchPlans(); showToast(`📅 Plan added!`)
  }
  const togglePlan = async (id, currentStatus) => {
    await supabase.from('plans').update({ status: currentStatus === 'done' ? 'pending' : 'done' }).eq('id', id)
    fetchPlans()
  }
  const deletePlan = async (id) => {
    await supabase.from('plans').delete().eq('id', id); fetchPlans(); showToast('Plan deleted')
  }

  // --- GIFT LOGIC WITH MONTHLY LIMITS & TRANSACTIONS ---
  const sendGift = async (livelyGift = null) => {
    if (!userProfile) return showToast('Please log in', 'error');
    
    // 1. Check Monthly Limit (Max 3 per month)
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const { count } = await supabase.from('gifts').select('id', { count: 'exact', head: true }).eq('sender_id', userProfile.id).gte('given_at', firstDayOfMonth.toISOString());
    if (count >= 3) return showToast('❌ Max 3 gifts per month! Wait until next month.', 'error');

    // 2. Calculate Price & Message
    let finalMessage = giftMsg;
    let finalPrice = 0;
    let finalCategory = 'Custom';
    let animationColor = '#f43f5e';
    let animationMessage = '🎁 You sent a gift!';

    if (livelyGift) {
      finalMessage = livelyGift.label;
      finalPrice = livelyGift.price;
      finalCategory = livelyGift.category;
      // Assign unique animation colors based on category
      if (finalCategory === 'Daily Love') animationColor = '#fbbf24';
      else if (finalCategory === 'Physical Touch') animationColor = '#f43f5e';
      else if (finalCategory === 'Adventure') animationColor = '#06b6d4';
      else if (finalCategory === 'Emotions') animationColor = '#8b5cf6';
      else if (finalCategory === 'Food & Drink') animationColor = '#f59e0b';
      else if (finalCategory === 'Luxury') animationColor = '#ec4899';
      else animationColor = '#3b82f6';
      animationMessage = `💝 ${finalMessage}`;
    } else {
      if (!giftMsg) return showToast('Write a message!', 'error')
      finalPrice = 50;
      finalCategory = 'Custom';
      if (giftType !== 'Custom Message') {
        const giftEmojis = { 'Jewelry': '💍', 'Subscription Box': '📦', 'Luxury Weighted Blanket': '🛏️', 'Spa Package': '🧖', 'Digital Gift Card': '💳' };
        finalMessage = `${giftEmojis[giftType] || '🎁'} ${giftType}: ${giftMsg}`;
        finalPrice = 200;
      }
      animationMessage = `🎁 ${finalMessage}`;
    }

    // 3. Check Wallet
    if (userProfile.wallet < finalPrice) return showToast(`Not enough Love Points! Need ${finalPrice - userProfile.wallet} more 💖`, 'error');

    // 4. Deduct Wallet and Record Transaction
    const newWallet = userProfile.wallet - finalPrice;
    await supabase.from('profiles').update({ wallet: newWallet }).eq('id', userProfile.id);
    setUserProfile(prev => ({ ...prev, wallet: newWallet }));
    await supabase.from('transactions').insert({ profile_id: userProfile.id, amount: -finalPrice, type: 'Sent', description: finalMessage });

    // 5. Save Gift (No receiver ID yet! The other person will "open" it and claim it).
    const { error } = await supabase.from('gifts').insert({ 
      message: finalMessage,
      price: finalPrice,
      category: finalCategory,
      is_opened: false,
      sender_id: userProfile.id
    });

    if (!error) {
      setGiftMsg(''); await fetchGifts(); 
      if (finalPrice >= 150) setActiveParticleGift({ message: animationMessage, color: animationColor });
      showToast(`🎁 ${finalMessage} sent! (${finalPrice} Shillings)`);
    } else showToast('Failed to send', 'error');
  }

  const openGift = async (gift) => {
    if (openingGift || gift.is_opened || !userProfile) return;
    setOpeningGift(gift.id)
    
    // Determine animation
    let animColor = '#f43f5e';
    if (gift.category === 'Daily Love') animColor = '#fbbf24';
    else if (gift.category === 'Physical Touch') animColor = '#f43f5e';
    else if (gift.category === 'Adventure') animColor = '#06b6d4';
    else if (gift.category === 'Emotions') animColor = '#8b5cf6';
    else if (gift.category === 'Food & Drink') animColor = '#f59e0b';
    else if (gift.category === 'Luxury') animColor = '#ec4899';
    
    setActiveParticleGift({ message: `💝 ${gift.message}`, color: animColor })
    
    // Claim the gift for the receiver
    const claimerId = userProfile.id;
    const newWallet = userProfile.wallet + gift.price;
    
    // Update profiles and gifts simultaneously
    await supabase.from('profiles').update({ wallet: newWallet }).eq('id', claimerId);
    setUserProfile(prev => ({ ...prev, wallet: newWallet }));
    await supabase.from('transactions').insert({ profile_id: claimerId, amount: gift.price, type: 'Received', description: `Received ${gift.message} from ${gift.sender?.name || 'Unknown'}` });
    await supabase.from('gifts').update({ is_opened: true, opened_at: new Date(), receiver_id: claimerId }).eq('id', gift.id);
    
    await fetchGifts()
    setOpeningGift(null)
  }

  const deleteGift = async (id) => {
    await supabase.from('gifts').delete().eq('id', id); fetchGifts(); showToast('Gift removed')
  }

  // --- MARK ANSWER AS CORRECT (CREDITS 50 SHILLINGS) ---
  const markCorrect = async (answerId, profileId) => {
    // Prevent double marking
    const { data: existing } = await supabase.from('answers').select('is_correct').eq('id', answerId).single();
    if (existing?.is_correct) return showToast('Already marked correct!', 'info');

    // 1. Mark the answer
    await supabase.from('answers').update({ is_correct: true }).eq('id', answerId);
    
    // 2. Credit the user 50 Shillings
    const { data: answerer } = await supabase.from('profiles').select('wallet').eq('id', profileId).single();
    const newWallet = answerer.wallet + 50;
    await supabase.from('profiles').update({ wallet: newWallet }).eq('id', profileId);
    
    // 3. Log transaction
    await supabase.from('transactions').insert({ profile_id: profileId, amount: 50, type: 'Correct Answer', description: 'Answer marked as correct!' });
    
    // 4. Refetch and update UI
    fetchQuestions();
    if (profileId === userProfile.id) setUserProfile(prev => ({ ...prev, wallet: newWallet }));
    showToast('💬 Answer marked correct! 50 Shillings credited!');
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
    if (!chatInput.trim() || !userProfile) return
    await supabase.from('chat_messages').insert({ sender_name: userProfile.name, message: chatInput })
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
    if (!replyText || !userProfile) return showToast('Write a reply!', 'error')
    await supabase.from('answers').insert({ question_id: questionId, answer: replyText, profile_id: userProfile.id })
    setReplyText(''); setReplyingTo(null); fetchQuestions(); showToast('💬 Reply sent!')
  }

  // --- USE EFFECTS ---
  useEffect(() => { if (currentView === 'gallery') fetchPhotos() }, [currentView])
  useEffect(() => { if (currentView === 'plans') fetchPlans() }, [currentView])
  useEffect(() => { if (currentView === 'gifts') { fetchGifts(); fetchTransactions(); } }, [currentView])
  useEffect(() => { if (currentView === 'timeline') fetchTimeline() }, [currentView])
  useEffect(() => { if (currentView === 'questions') fetchQuestions() }, [currentView])
  useEffect(() => { if (currentView === 'wallet') fetchTransactions() }, [currentView])

  // Chat Realtime
  useEffect(() => {
    if (currentView === 'chat') {
      fetchChatMessages()
      const channel = supabase.channel('chat_messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, payload => setMessages(prev => [...prev, payload.new]))
        .subscribe()
      return () => supabase.removeChannel(channel)
    }
  }, [currentView])

  // Gifts Realtime
  useEffect(() => {
    if (currentView === 'gifts') {
      const gChannel = supabase.channel('gifts')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gifts' }, payload => setGifts(prev => [payload.new, ...prev]))
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'gifts' }, payload => setGifts(prev => prev.map(g => g.id === payload.new.id ? payload.new : g)))
        .subscribe()
      return () => supabase.removeChannel(gChannel)
    }
  }, [currentView])

  // --- 2017 DATE CALCULATION (Years, Days, Hours) ---
  const startDate = new Date('2017-01-01');
  const now = new Date();
  const diffMs = now - startDate;
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const years = Math.floor(totalDays / 365);
  const remainingDays = totalDays % 365;
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  // --- LOGIN & SIGNUP PAGE ---
  if (!isLoggedIn) {
    return (
      <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'linear-gradient(135deg, #fce4ec 0%, #f3e8ff 50%, #e0f2fe 100%)', fontFamily:'"Inter", sans-serif'}}>
        <div style={{background:'rgba(255, 255, 255, 0.85)', backdropFilter:'blur(16px)', padding:'2.5rem 2rem', borderRadius:'2rem', boxShadow:'0 20px 40px rgba(244, 63, 94, 0.25)', textAlign:'center', maxWidth:'400px', width:'100%', border:'1px solid rgba(255,255,255,0.5)'}}>
          <div style={{fontSize:'3.5rem', marginBottom:'0.5rem', animation:'float 3s ease-in-out infinite'}}>💕</div>
          <h1 style={{background:'linear-gradient(135deg, #f43f5e, #8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontWeight:'700', marginBottom:'1rem'}}>Winfrey & George</h1>
          
          {loginMode === 'login' ? (
            <form onSubmit={handleLogin}>
              <p style={{color:'#6b7280', fontSize:'0.9rem', marginBottom:'1rem'}}>Enter your secret PIN</p>
              <input type="password" placeholder="PIN (e.g. 1212)" maxLength="4" value={pin} onChange={(e) => setPin(e.target.value)} style={{width:'100%', padding:'1rem', fontSize:'1.5rem', textAlign:'center', border:'2px solid #fce4ec', borderRadius:'1rem', outline:'none', marginBottom:'1.5rem', letterSpacing:'8px', background:'rgba(255,255,255,0.5)'}} onFocus={(e) => e.target.style.borderColor='#f43f5e'} onBlur={(e) => e.target.style.borderColor='#fce4ec'} />
              <button type="submit" style={{width:'100%', background:'linear-gradient(135deg, #f43f5e, #fb7185)', color:'white', padding:'1rem', border:'none', borderRadius:'1rem', fontSize:'1rem', fontWeight:'600', cursor:'pointer', boxShadow:'0 4px 12px rgba(244, 63, 94, 0.3)'}}>Enter Our World 💕</button>
              <p style={{marginTop:'1rem', fontSize:'0.85rem', color:'#6b7280'}}>New here? <span onClick={() => setLoginMode('signup')} style={{color:'#f43f5e', fontWeight:'600', cursor:'pointer'}}>Create Account</span></p>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <p style={{color:'#6b7280', fontSize:'0.9rem', marginBottom:'1rem'}}>Choose your Name & PIN</p>
              <input type="text" placeholder="Your Name..." value={signupName} onChange={(e) => setSignupName(e.target.value)} style={{width:'100%', padding:'0.75rem 1rem', border:'2px solid #fce4ec', borderRadius:'0.75rem', outline:'none', marginBottom:'0.75rem'}} onFocus={(e) => e.target.style.borderColor='#f43f5e'} onBlur={(e) => e.target.style.borderColor='#fce4ec'} />
              <input type="password" placeholder="4-Digit PIN..." maxLength="4" value={signupPin} onChange={(e) => setSignupPin(e.target.value)} style={{width:'100%', padding:'0.75rem 1rem', border:'2px solid #fce4ec', borderRadius:'0.75rem', outline:'none', marginBottom:'1.5rem', letterSpacing:'5px'}} onFocus={(e) => e.target.style.borderColor='#f43f5e'} onBlur={(e) => e.target.style.borderColor='#fce4ec'} />
              <button type="submit" style={{width:'100%', background:'linear-gradient(135deg, #8b5cf6, #a78bfa)', color:'white', padding:'1rem', border:'none', borderRadius:'1rem', fontSize:'1rem', fontWeight:'600', cursor:'pointer', boxShadow:'0 4px 12px rgba(139, 92, 246, 0.3)'}}>Create Account 💖</button>
              <p style={{marginTop:'1rem', fontSize:'0.85rem', color:'#6b7280'}}>Already have an account? <span onClick={() => setLoginMode('login')} style={{color:'#f43f5e', fontWeight:'600', cursor:'pointer'}}>Sign In</span></p>
            </form>
          )}
        </div>
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    )
  }

  // --- GIFT OVERLAY ---
  if (activeParticleGift) {
    return <ParticleGift message={activeParticleGift.message} color={activeParticleGift.color} onClose={() => setActiveParticleGift(null)} />
  }

  // --- VIEWS ---
  if (currentView === 'gallery') {
    return (
      <ViewWrapper title="📸 Shared Gallery" goHome={() => setCurrentView('home')}>
        <div style={{marginBottom:'1.5rem', display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap'}}>
          <input type="file" accept="image/*,video/*" capture="environment" onChange={uploadPhoto} disabled={isUploading} style={{display:'none'}} id="upload" />
          <label htmlFor="upload" style={{display:'inline-block', background:'linear-gradient(135deg, #f43f5e, #fb7185)', color:'white', padding:'0.75rem 2rem', borderRadius:'2rem', cursor:'pointer', fontWeight:'600', fontSize:'0.95rem', transition:'0.2s', boxShadow:'0 4px 8px rgba(244, 63, 94, 0.2)'}}>{isUploading ? 'Uploading...' : '📸 Choose Media'}</label>
          {isUploading && <button onClick={() => { setIsUploading(false); document.getElementById('upload').value = null; }} style={{background:'#ef4444', color:'white', padding:'0.75rem 1.5rem', border:'none', borderRadius:'2rem', fontWeight:'600', cursor:'pointer'}}>Cancel ✕</button>}
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
      <ViewWrapper title="📖 History Tree" goHome={() => setCurrentView('home')}>
        <div style={{display:'flex', flexWrap:'wrap', gap:'0.75rem', justifyContent:'center', marginBottom:'2rem'}}>
          <input type="text" placeholder="Memory title..." value={tlTitle} onChange={(e) => setTlTitle(e.target.value)} style={{padding:'0.75rem 1rem', border:'1px solid #e5e7eb', borderRadius:'0.75rem', outline:'none', width:'180px'}} />
          <input type="text" placeholder="Description" value={tlDesc} onChange={(e) => setTlDesc(e.target.value)} style={{padding:'0.75rem 1rem', border:'1px solid #e5e7eb', borderRadius:'0.75rem', outline:'none', width:'180px'}} />
          <input type="date" value={tlDate} onChange={(e) => setTlDate(e.target.value)} style={{padding:'0.75rem 1rem', border:'1px solid #e5e7eb', borderRadius:'0.75rem', outline:'none'}} />
          <button onClick={() => { setTlTitle(''); setTlDesc(''); setTlDate(''); }} style={{background:'#6b7280', color:'white', padding:'0.75rem 1.5rem', border:'none', borderRadius:'0.75rem', fontWeight:'600', cursor:'pointer'}}>Cancel</button>
          <button onClick={addTimeline} style={{background:'linear-gradient(135deg, #f43f5e, #fb7185)', color:'white', padding:'0.75rem 1.5rem', border:'none', borderRadius:'0.75rem', fontWeight:'600', cursor:'pointer'}}>Add to Tree</button>
        </div>
        {timelines.length === 0 ? (
          <div style={{padding:'3rem 1rem', background:'rgba(255,255,255,0.5)', borderRadius:'1.5rem', textAlign:'center', border:'2px dashed #fce4ec'}}>
            <div style={{fontSize:'4rem'}}>🌳</div>
            <p style={{color:'#9ca3af', fontSize:'1.1rem'}}>Start building your family history tree!</p>
          </div>
        ) : (
          <div style={{maxWidth:'600px', margin:'0 auto', textAlign:'left', position:'relative'}}>
            <div style={{position:'absolute', left:'15px', top:'0', bottom:'0', width:'4px', background:'linear-gradient(to bottom, #f43f5e, #fb7185, #a78bfa)', borderRadius:'4px'}}></div>
            {timelines.map((t, idx) => (
              <div key={t.id} style={{display:'flex', gap:'1.5rem', marginBottom:'2rem', position:'relative', background:'white', padding:'1rem 1.5rem', borderRadius:'1rem', boxShadow:'0 4px 12px rgba(0,0,0,0.05)', border:'1px solid #fce4ec'}}>
                <div style={{background:'linear-gradient(135deg, #f43f5e, #fb7185)', color:'white', borderRadius:'50%', width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', zIndex:2, boxShadow:'0 0 0 4px #fff0f5', flexShrink:0}}>{idx + 1}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:'700', fontSize:'1.1rem', color:'#1f2937'}}>{t.title}</div>
                  <div style={{fontSize:'0.9rem', color:'#4b5563', marginTop:'0.25rem'}}>{t.description}</div>
                  <div style={{fontSize:'0.8rem', color:'#a78bfa', marginTop:'0.5rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span>📅 {new Date(t.memory_date).toLocaleDateString()}</span>
                    <button onClick={() => deleteTimeline(t.id)} style={{background:'none', border:'none', color:'#9ca3af', cursor:'pointer', fontSize:'0.9rem', fontWeight:'bold'}} onMouseOver={(e) => e.target.style.color='#ef4444'} onMouseOut={(e) => e.target.style.color='#9ca3af'}>🗑️ Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ViewWrapper>
    )
  }

  if (currentView === 'chat') {
    return (
      <div style={{fontFamily:'"Inter", sans-serif', height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden'}}>
        <div style={{background:'linear-gradient(135deg, #f43f5e, #a78bfa)', color:'white', padding:'1rem 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}}>
          <button onClick={() => setCurrentView('home')} style={{background:'none', border:'none', color:'white', fontSize:'1.2rem', cursor:'pointer'}}>←</button>
          <div style={{fontWeight:'700', fontSize:'1.1rem', textAlign:'center'}}>💞 Winfrey & George</div>
          <div style={{width:'24px'}}></div>
        </div>
        <div style={{flex:1, overflowY:'auto', padding:'1rem 1.5rem', display:'flex', flexDirection:'column', gap:'0.75rem', background:'linear-gradient(180deg, #fff0f5, #f3e8ff)'}}>
          {messages.map((msg) => {
            const isMe = msg.sender_name === userProfile.name;
            return (
              <div key={msg.id} style={{display:'flex', flexDirection:'column', alignItems: isMe ? 'flex-end' : 'flex-start', animation:'popIn 0.3s ease-out'}}>
                <div style={{maxWidth:'75%', background: isMe ? 'linear-gradient(135deg, #f43f5e, #fb7185)' : 'linear-gradient(135deg, #8b5cf6, #a78bfa)', color:'white', padding:'0.75rem 1rem', borderRadius: isMe ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0', boxShadow:'0 2px 8px rgba(244, 63, 94, 0.2)'}}>
                  {!isMe && <div style={{fontSize:'0.75rem', fontWeight:'600', marginBottom:'0.2rem', opacity:'0.9'}}>{msg.sender_name}</div>}
                  <div>{msg.message}</div>
                </div>
                <div style={{fontSize:'0.7rem', color:'#a78bfa', marginTop:'0.25rem', fontWeight:'500'}}>{timeAgo(msg.created_at)}</div>
              </div>
            )
          })}
        </div>
        <div style={{background:'white', padding:'0.75rem 1rem', display:'flex', gap:'0.75rem', borderTop:'2px solid #fce4ec'}}>
          <input type="text" placeholder="Type a message..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()} style={{flex:1, padding:'0.75rem 1rem', border:'2px solid #fce4ec', borderRadius:'2rem', outline:'none', transition:'0.3s'}} onFocus={(e) => e.target.style.borderColor='#f43f5e'} onBlur={(e) => e.target.style.borderColor='#fce4ec'} />
          <button onClick={sendChatMessage} style={{background:'linear-gradient(135deg, #f43f5e, #fb7185)', color:'white', padding:'0.75rem 1.5rem', border:'none', borderRadius:'2rem', fontWeight:'600', cursor:'pointer', boxShadow:'0 4px 12px rgba(244, 63, 94, 0.3)'}}>Send</button>
        </div>
        <style>{`
          @keyframes popIn { from { opacity:0; transform: scale(0.9); } to { opacity:1; transform: scale(1); } }
        `}</style>
      </div>
    )
  }

  if (currentView === 'questions') {
    return (
      <ViewWrapper title="📥 Question Inbox" goHome={() => setCurrentView('home')}>
        <div style={{display:'flex', flexWrap:'wrap', gap:'0.75rem', justifyContent:'center', marginBottom:'2rem'}}>
          <input type="text" placeholder="Write your own question..." value={newQuestionText} onChange={(e) => setNewQuestionText(e.target.value)} style={{flex:'1', padding:'0.75rem 1rem', border:'1px solid #e5e7eb', borderRadius:'0.75rem', outline:'none', minWidth:'200px'}} />
          <button onClick={askManualQuestion} style={{background:'#1f2937', color:'white', padding:'0.75rem 1.5rem', border:'none', borderRadius:'0.75rem', fontWeight:'600', cursor:'pointer'}}>Ask Manual</button>
          <button onClick={askRandomQuestion} style={{background:'linear-gradient(135deg, #f43f5e, #fb7185)', color:'white', padding:'0.75rem 1.5rem', border:'none', borderRadius:'0.75rem', fontWeight:'600', cursor:'pointer'}}>Surprise Me ✨</button>
        </div>
        <div style={{maxWidth:'600px', margin:'0 auto'}}>
          {questions.length === 0 ? <p style={{color:'#9ca3af'}}>No questions yet. Click "Surprise Me"!</p> : (
            questions.map(q => (
              <div key={q.id} style={{background:'white', padding:'1.5rem', borderRadius:'1.5rem', marginBottom:'1.5rem', boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
                <div style={{fontWeight:'600', fontSize:'1.1rem', color:'#1f2937', marginBottom:'0.5rem'}}>"{q.text}"</div>
                <div style={{fontSize:'0.8rem', color:'#9ca3af', marginBottom:'1rem'}}>{(answers[q.id] || []).length} replies</div>
                {(answers[q.id] || []).map(a => (
                  <div key={a.id} style={{background:'#f9fafb', padding:'0.75rem 1rem', borderRadius:'0.75rem', marginBottom:'0.5rem', borderLeft:'4px solid #f43f5e', textAlign:'left', position:'relative'}}>
                    <div><span style={{fontWeight:'600', color:'#f43f5e', fontSize:'0.8rem'}}>{a.profile?.name}:</span> 💬 {a.answer}</div>
                    {!a.is_correct && userProfile.id !== a.profile_id && (
                      <button onClick={() => markCorrect(a.id, a.profile_id)} style={{position:'absolute', top:'4px', right:'8px', background:'#10b981', color:'white', border:'none', borderRadius:'0.5rem', padding:'0.2rem 0.5rem', fontSize:'0.6rem', cursor:'pointer', fontWeight:'600'}}>Mark Correct +50💰</button>
                    )}
                    {a.is_correct && <div style={{position:'absolute', top:'4px', right:'8px', color:'#10b981', fontSize:'0.8rem', fontWeight:'bold'}}>✅ Correct</div>}
                  </div>
                ))}
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
          <input type="text" placeholder="Plan title..." value={planTitle} onChange={(e) => setPlanTitle(e.target.value)} style={{padding:'0.75rem 1rem', border:'1px solid #e5e7eb', borderRadius:'0.75rem', outline:'none', width:'160px'}} />
          <input type="text" placeholder="Target Price (KSh)" value={planPrice} onChange={(e) => setPlanPrice(e.target.value)} style={{padding:'0.75rem 1rem', border:'1px solid #e5e7eb', borderRadius:'0.75rem', outline:'none', width:'120px'}} />
          <input type="date" value={planDate} onChange={(e) => setPlanDate(e.target.value)} style={{padding:'0.75rem 1rem', border:'1px solid #e5e7eb', borderRadius:'0.75rem', outline:'none'}} />
          <button onClick={addPlan} style={{background:'linear-gradient(135deg, #f43f5e, #fb7185)', color:'white', padding:'0.75rem 1.5rem', border:'none', borderRadius:'0.75rem', fontWeight:'600', cursor:'pointer'}}>Add Plan</button>
        </div>
        <div style={{maxWidth:'600px', margin:'0 auto'}}>
          {plans.map(p => {
            const isOverdue = new Date(p.due_date) < new Date() && p.status !== 'done'
            const categoryColors = {
              'Date Night': '#fce7f3', 'Family Trip': '#e0f2fe', 'Home Project': '#fef3c7', 'Health & Wellness': '#d1fae5', 'General': '#f3f4f6'
            };
            const displayPrice = p.target_price && p.target_price > 0 ? `${p.target_price} KSh` : null;
            return (
              <div key={p.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', background: categoryColors[p.category] || '#f3f4f6', padding:'0.75rem 1.5rem', margin:'0.75rem 0', borderRadius:'1rem', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', borderLeft: isOverdue ? '6px solid #ef4444' : p.status === 'done' ? '6px solid #22c55e' : '6px solid #f43f5e', opacity: p.status === 'done' ? '0.7' : '1'}}>
                <span onClick={() => togglePlan(p.id, p.status)} style={{cursor:'pointer', flex:'1', textDecoration: p.status === 'done' ? 'line-through' : 'none', color: isOverdue && p.status !== 'done' ? '#ef4444' : '#1f2937'}}>
                  <b>{p.title}</b> 
                  <span style={{fontSize:'0.8rem', background:'rgba(0,0,0,0.05)', padding:'0.2rem 0.5rem', borderRadius:'0.5rem', marginLeft:'0.5rem'}}>{p.category}</span>
                  {displayPrice && <span style={{fontSize:'0.8rem', background:'#fef3c7', padding:'0.2rem 0.5rem', borderRadius:'0.5rem', marginLeft:'0.5rem', fontWeight:'bold', color:'#d97706'}}>{displayPrice}</span>}
                  <span style={{fontSize:'0.85rem', color:'#6b7280', marginLeft:'0.5rem'}}>({new Date(p.due_date).toLocaleDateString()})</span>
                </span>
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
      <ViewWrapper title="🎁 Gifts & Wallet" goHome={() => setCurrentView('home')}>
        {/* WALLET DASHBOARD */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'white', padding:'0.75rem 1.5rem', borderRadius:'1rem', marginBottom:'1.5rem', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', flexWrap:'wrap', gap:'0.5rem'}}>
          <div><span style={{fontWeight:'bold', color:'#f43f5e'}}>💖 {userProfile.name}'s Wallet:</span> <span style={{fontWeight:'700', fontSize:'1.2rem', color:'#1f2937'}}>{userProfile.wallet} Shillings</span></div>
          <div style={{display:'flex', gap:'0.5rem'}}>
            <button onClick={() => setCurrentView('wallet')} style={{background:'#1f2937', color:'white', padding:'0.5rem 1rem', border:'none', borderRadius:'0.75rem', fontWeight:'600', cursor:'pointer', fontSize:'0.9rem'}}>📊 Ledger</button>
            <button onClick={() => { const newBal = userProfile.wallet + 500; setUserProfile(prev => ({...prev, wallet: newBal})); supabase.from('profiles').update({wallet: newBal}).eq('id', userProfile.id); localStorage.setItem('love_wallet', newBal.toString()); showToast('500 Love Points Added! 💖'); }} style={{background:'linear-gradient(135deg, #1f2937, #4b5563)', color:'white', padding:'0.5rem 1rem', border:'none', borderRadius:'0.75rem', fontWeight:'600', cursor:'pointer', fontSize:'0.9rem'}}>Boost 💖</button>
          </div>
        </div>

        <div style={{display:'flex', flexWrap:'wrap', gap:'0.75rem', justifyContent:'center', marginBottom:'1.5rem'}}>
          <input type="text" placeholder="Custom message..." value={giftMsg} onChange={(e) => setGiftMsg(e.target.value)} style={{flex:'1', padding:'0.75rem 1rem', border:'1px solid #e5e7eb', borderRadius:'0.75rem', outline:'none', minWidth:'150px'}} />
          <button onClick={() => sendGift()} style={{background:'linear-gradient(135deg, #f43f5e, #fb7185)', color:'white', padding:'0.75rem 1.5rem', border:'none', borderRadius:'0.75rem', fontWeight:'600', cursor:'pointer'}}>Send Custom (50💰)</button>
        </div>

        <div style={{marginBottom:'2rem'}}>
          <h3 style={{textAlign:'center', color:'#6b7280', marginBottom:'1rem', fontWeight:'600'}}>✨ Choose a Lively Gift (Max 3 per month)</h3>
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

        <div style={{maxWidth:'600px', margin:'0 auto'}}>
          <h4 style={{textAlign:'center', color:'#6b7280', marginBottom:'1rem'}}>Received Gifts (Click to Open)</h4>
          {gifts.length === 0 ? <div style={{padding:'2rem', color:'#9ca3af', fontStyle:'italic', textAlign:'center'}}>Send your first gift!</div> : (
            gifts.map(g => {
              const isReceiver = g.receiver_id === userProfile.id || (!g.is_opened && g.sender_id !== userProfile.id);
              return (
              <div key={g.id} onClick={() => isReceiver && !g.is_opened && openGift(g)} style={{cursor: isReceiver && !g.is_opened ? 'pointer' : 'default', margin:'0.75rem 0', transition:'0.3s', animation: 'giftFadeIn 0.5s ease-out'}}>
                <div style={{background: g.is_opened ? '#d1fae5' : randomColor(), padding:'1rem 1.5rem', borderRadius:'1.5rem', borderBottomLeftRadius:'0.5rem', position:'relative', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', textAlign:'left', border: g.is_opened ? '2px solid #10b981' : 'none'}}>
                  
                  {!g.is_opened ? (
                    <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
                      <div style={{fontSize:'1.5rem'}}>🎁</div>
                      <div>
                        <div style={{fontWeight:'600', fontSize:'1rem', color:'#1f2937'}}>From: {g.sender?.name}</div>
                        <div style={{fontSize:'0.75rem', color:'#6b7280', display:'flex', gap:'0.5rem', alignItems:'center'}}>
                          <span>💌 {timeAgo(g.given_at)}</span> 
                          {isReceiver && <span style={{background:'#f43f5e', color:'white', padding:'0.1rem 0.5rem', borderRadius:'1rem', fontSize:'0.65rem', fontWeight:'bold'}}>Click to Open</span>}
                          {g.sender_id === userProfile.id && <span style={{fontSize:'0.7rem', color:'#9ca3af'}}>Sent</span>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <div>
                        <div style={{fontWeight:'600', fontSize:'1rem', color:'#065f46'}}>🎉 Opened!</div>
                        <div style={{fontSize:'0.85rem', color:'#4b5563', marginTop:'0.25rem'}}>"{g.message}"</div>
                        <div style={{fontSize:'0.7rem', color:'#6b7280'}}>💌 {timeAgo(g.opened_at || g.given_at)}</div>
                      </div>
                      {(g.sender_id === userProfile.id || g.receiver_id === userProfile.id) && <button onClick={(e) => { e.stopPropagation(); deleteGift(g.id); }} style={{background:'none', border:'none', fontSize:'0.9rem', cursor:'pointer', opacity:'0.5', transition:'0.2s', padding:'0'}} onMouseOver={(e) => e.target.style.opacity='1'} onMouseOut={(e) => e.target.style.opacity='0.5'}>🗑️</button>}
                    </div>
                  )}
                </div>
              </div>
            )})
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

  if (currentView === 'wallet') {
    return (
      <ViewWrapper title="💰 Financial Ledger" goHome={() => setCurrentView('home')}>
        <div style={{background:'white', borderRadius:'1rem', padding:'1.5rem', boxShadow:'0 4px 12px rgba(0,0,0,0.05)', maxWidth:'600px', margin:'0 auto'}}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1rem', borderBottom:'1px solid #e5e7eb', paddingBottom:'0.5rem'}}>
            <b>Description</b>
            <b style={{textAlign:'right', minWidth:'80px'}}>Amount</b>
          </div>
          {transactions.length === 0 ? <p style={{textAlign:'center', color:'#9ca3af', padding:'2rem 0'}}>No transactions yet.</p> : (
            transactions
