import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

// --- APP CONFIG ---
const START_DATE = new Date('2024-01-01') // Change this to your actual anniversary!
const CORRECT_PIN = '1212'
const GIFT_EMOJIS = ['❤️', '🌹', '🌟', '💌', '🎉']

function App() {
  // --- STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [pin, setPin] = useState('')
  const [currentView, setCurrentView] = useState('home')
  const [toast, setToast] = useState(null) // { message, type }
  
  // --- DATA STATE ---
  const [photos, setPhotos] = useState([])
  const [plans, setPlans] = useState([])
  const [gifts, setGifts] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [answers, setAnswers] = useState([])
  
  // --- INPUT STATE ---
  const [planTitle, setPlanTitle] = useState('')
  const [planDate, setPlanDate] = useState('')
  const [giftMsg, setGiftMsg] = useState('')
  const [giftEmoji, setGiftEmoji] = useState('❤️')
  const [answerText, setAnswerText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // --- TOAST NOTIFICATIONS ---
  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // --- AUTH ---
  const handleLogin = (e) => {
    e.preventDefault()
    if (pin === CORRECT_PIN) setIsLoggedIn(true)
    else { showToast('Wrong PIN!', 'error'); setPin('') }
  }

  // --- DATA FETCHING ---
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
  const fetchRandomQuestion = async () => {
    setCurrentQuestion(null); setAnswers([])
    const { data } = await supabase.from('questions').select('*').order('random()').limit(1).single()
    if (data) {
      setCurrentQuestion(data)
      const { data: ansData } = await supabase.from('answers').select('*').eq('question_id', data.id)
      if (ansData) setAnswers(ansData)
    } else {
      showToast('No questions in database!', 'error')
    }
  }

  // --- ACTIONS ---
  const uploadPhoto = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setIsLoading(true)
    const path = `family_${Date.now()}.jpg`
    const { error } = await supabase.storage.from('gallery').upload(path, file)
    if (!error) {
      const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(path)
      await supabase.from('photos').insert({ storage_path: urlData.publicUrl, caption: 'Our memory ✨' })
      fetchPhotos(); showToast('Photo uploaded! 💕')
    } else showToast('Upload failed', 'error')
    setIsLoading(false)
  }
  const deletePhoto = async (id) => {
    await supabase.from('photos').delete().eq('id', id)
    fetchPhotos(); showToast('Photo deleted')
  }

  const addPlan = async () => {
    if (!planTitle || !planDate) return showToast('Fill in title & date!', 'error')
    await supabase.from('plans').insert({ title: planTitle, due_date: planDate })
    setPlanTitle(''); setPlanDate('')
    fetchPlans(); showToast(`Plan "${planTitle}" added! 📅`)
  }
  const togglePlan = async (id, currentStatus) => {
    const newStatus = currentStatus === 'done' ? 'pending' : 'done'
    await supabase.from('plans').update({ status: newStatus }).eq('id', id)
    fetchPlans()
  }
  const deletePlan = async (id) => {
    await supabase.from('plans').delete().eq('id', id)
    fetchPlans(); showToast('Plan deleted')
  }

  const sendGift = async () => {
    if (!giftMsg) return showToast('Write a message!', 'error')
    await supabase.from('gifts').insert({ message: `${giftEmoji} ${giftMsg}` })
    setGiftMsg('')
    fetchGifts(); showToast(`Gift sent! ${giftEmoji}`)
  }
  const deleteGift = async (id) => {
    await supabase.from('gifts').delete().eq('id', id)
    fetchGifts(); showToast('Gift removed')
  }

  const submitAnswer = async () => {
    if (!answerText || !currentQuestion) return
    await supabase.from('answers').insert({ question_id: currentQuestion.id, answer: answerText })
    setAnswerText('')
    fetchRandomQuestion(); showToast('Answer saved! ❤️')
  }

  // --- USE EFFECTS ---
  useEffect(() => { if (currentView === 'gallery') fetchPhotos() }, [currentView])
  useEffect(() => { if (currentView === 'plans') fetchPlans() }, [currentView])
  useEffect(() => { if (currentView === 'gifts') fetchGifts() }, [currentView])
  useEffect(() => { if (currentView === 'questions') fetchRandomQuestion() }, [currentView])

  // --- CALCULATE DAYS TOGETHER ---
  const daysTogether = Math.floor((new Date() - START_DATE) / (1000 * 60 * 60 * 24))

  // --- LOGIN SCREEN ---
  if (!isLoggedIn) {
    return (
      <>
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#fff0f5', fontFamily:'"Inter", sans-serif'}}>
          <div style={{background:'white', padding:'3rem 2.5rem', borderRadius:'2rem', boxShadow:'0 20px 40px rgba(244, 63, 94, 0.15)', textAlign:'center', maxWidth:'350px', width:'100%'}}>
            <h1 style={{color:'#f43f5e', fontSize:'2rem', fontWeight:'700', marginBottom:'0.5rem'}}>Welcome Home</h1>
            <p style={{color:'#f43f5e', fontSize:'1.5rem', marginBottom:'1.5rem'}}>💕</p>
            <p style={{color:'#6b7280', fontSize:'0.9rem', marginBottom:'1.5rem'}}>Enter your secret PIN</p>
            <input type="password" placeholder="1212" maxLength="4" value={pin} onChange={(e) => setPin(e.target.value)} style={{width:'100%', padding:'1rem', fontSize:'1.5rem', textAlign:'center', border:'2px solid #fce4ec', borderRadius:'1rem', outline:'none', marginBottom:'1.5rem', letterSpacing:'8px', background:'#fff0f5'}} />
            <button onClick={handleLogin} style={{width:'100%', background:'#f43f5e', color:'white', padding:'1rem', border:'none', borderRadius:'1rem', fontSize:'1rem', fontWeight:'600', cursor:'pointer', transition:'0.2s', boxShadow:'0 4px 12px rgba(244, 63, 94, 0.3)'}} onMouseOver={(e) => e.target.style.transform='scale(1.02)'} onMouseOut={(e) => e.target.style.transform='scale(1)'}>Unlock 💕</button>
          </div>
        </div>
      </>
    )
  }

  // --- VIEWS ---

  if (currentView === 'gallery') {
    return (
      <ViewWrapper title="📸 Shared Gallery" goHome={() => setCurrentView('home')}>
        <div style={{marginBottom:'1.5rem'}}>
          <input type="file" accept="image/*" onChange={uploadPhoto} disabled={isLoading} style={{display:'none'}} id="upload" />
          <label htmlFor="upload" style={{display:'inline-block', background:'#f43f5e', color:'white', padding:'0.75rem 2rem', borderRadius:'2rem', cursor:'pointer', fontWeight:'600', fontSize:'0.95rem', transition:'0.2s', boxShadow:'0 4px 8px rgba(244, 63, 94, 0.2)'}}>{isLoading ? 'Uploading...' : 'Add Memory 🖼️'}</label>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'1.5rem'}}>
          {photos.map(p => (
            <div key={p.id} style={{position:'relative', borderRadius:'1rem', overflow:'hidden', boxShadow:'0 4px 12px rgba(0,0,0,0.08)', transition:'0.3s', aspectRatio:'1', background:'#f3f4f6'}}>
              <img src={p.storage_path} alt="memory" style={{width:'100%', height:'100%', objectFit:'cover'}} />
              <button onClick={() => deletePhoto(p.id)} style={{position:'absolute', top:'8px', right:'8px', background:'rgba(0,0,0,0.6)', color:'white', border:'none', borderRadius:'50%', width:'28px', height:'28px', cursor:'pointer', fontWeight:'bold', fontSize:'14px', display:'flex', justifyContent:'center', alignItems:'center'}}>✕</button>
            </div>
          ))}
        </div>
      </ViewWrapper>
    )
  }

  if (currentView === 'questions') {
    return (
      <ViewWrapper title="❓ Past Questions" goHome={() => setCurrentView('home')}>
        <button onClick={fetchRandomQuestion} style={{background:'#f43f5e', color:'white', padding:'0.75rem 2rem', border:'none', borderRadius:'2rem', fontSize:'1rem', fontWeight:'600', cursor:'pointer', marginBottom:'2rem', boxShadow:'0 4px 8px rgba(244, 63, 94, 0.2)'}}>Surprise Me! ✨</button>
        {currentQuestion ? (
          <div style={{background:'white', padding:'2rem', borderRadius:'1.5rem', boxShadow:'0 8px 20px rgba(0,0,0,0.05)', maxWidth:'600px', margin:'0 auto'}}>
            {/* ABSOLUTELY PARSER-SAFE TEMPLATE LITERAL */}
            <p style={{fontSize:'1.2rem', fontWeight:'600', color:'#1f2937', marginBottom:'1.5rem', lineHeight:'1.6'}> {`"${currentQuestion.text}"`} </p>
            <div style={{display:'flex', gap:'0.5rem', marginBottom:'1.5rem'}}>
              <input type="text" placeholder="Write your memory..." value={answerText} onChange={(e) => setAnswerText(e.target.value)} style={{flex:'1', padding:'0.75rem 1rem', border:'1px solid #e5e7eb', borderRadius:'0.75rem', outline:'none'}} />
              <button onClick={submitAnswer} style={{background:'#1f2937', color:'white', padding:'0.75rem 1.5rem', border:'none', borderRadius:'0.75rem', cursor:'pointer', fontWeight:'600'}}>Reply</button>
            </div>
            <div style={{textAlign:'left'}}>
              <p style={{fontSize:'0.9rem', color:'#6b7280', fontWeight:'600', marginBottom:'0.75rem'}}>Your shared memories:</p>
              {answers.length === 0 && <p style={{fontSize:'0.9rem', color:'#9ca3af'}}>No answers yet. Be the first!</p>}
              {answers.map(a => <div key={a.id} style={{background:'#f9fafb', padding:'1rem', borderRadius:'0.75rem', marginBottom:'0.75rem', borderLeft:'4px solid #f43f5e'}}>💬 {a.answer}</div>)}
            </div>
          </div>
        ) : <p style={{color:'#9ca3af'}}>Click "Surprise Me" to get a question!</p>}
      </ViewWrapper>
    )
  }

  if (currentView === 'plans') {
    return (
      <ViewWrapper title="📅 Shared Plans" goHome={() => setCurrentView('home')}>
        <div style={{display:'flex', flexWrap:'wrap', gap:'0.75rem', justifyContent:'center', marginBottom:'2rem'}}>
          <input type="text" placeholder="Plan title..." value={planTitle} onChange={(e) => setPlanTitle(e.target.value)} style={{padding:'0.75rem 1rem', border:'1px solid #e5e7eb', borderRadius:'0.75rem', outline:'none', width:'200px'}} />
          <input type="date" value={planDate} onChange={(e) => setPlanDate(e.target.value)} style={{padding:'0.75rem 1rem', border:'1px solid #e5e7eb', borderRadius:'0.75rem', outline:'none'}} />
          <button onClick={addPlan} style={{background:'#f43f5e', color:'white', padding:'0.75rem 1.5rem', border:'none', borderRadius:'0.75rem', fontWeight:'600', cursor:'pointer'}}>Add Plan</button>
        </div>
        <div style={{maxWidth:'600px', margin:'0 auto'}}>
          {plans.map(p => {
            const isOverdue = new Date(p.due_date) < new Date() && p.status !== 'done'
            return (
              <div key={p.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', background:'white', padding:'0.75rem 1.5rem', margin:'0.75rem 0', borderRadius:'1rem', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', borderLeft: isOverdue ? '6px solid #ef4444' : p.status === 'done' ? '6px solid #22c55e' : '6px solid #f43f5e', opacity: p.status === 'done' ? '0.7' : '1'}}>
                <span onClick={() => togglePlan(p.id, p.status)} style={{cursor:'pointer', flex:'1', textDecoration: p.status === 'done' ? 'line-through' : 'none', color: isOverdue && p.status !== 'done' ? '#ef4444' : '#1f2937'}}>
                  <b>{p.title}</b> <span style={{fontSize:'0.85rem', color:'#6b7280'}}>({new Date(p.due_date).toLocaleDateString('en-US', { month:'short', day:'numeric' })})</span>
                </span>
                <div style={{display:'flex', gap:'0.75rem', alignItems:'center'}}>
                  <span style={{fontSize:'1.2rem'}}>{p.status === 'done' ? '✅' : (isOverdue ? '⚠️' : '⬜')}</span>
                  <button onClick={() => deletePlan(p.id)} style={{background:'none', border:'none', color:'#9ca3af', cursor:'pointer', fontSize:'1rem', transition:'0.2s'}} onMouseOver={(e) => e.target.style.color='#ef4444'} onMouseOut={(e) => e.target.style.color='#9ca3af'}>🗑️</button>
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
        <div style={{display:'flex', flexWrap:'wrap', gap:'0.75rem', justifyContent:'center', marginBottom:'2rem'}}>
          <select value={giftEmoji} onChange={(e) => setGiftEmoji(e.target.value)} style={{padding:'0.75rem', border:'1px solid #e5e7eb', borderRadius:'0.75rem', fontSize:'1.2rem', outline:'none'}}>
            {GIFT_EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <input type="text" placeholder="Write a message..." value={giftMsg} onChange={(e) => setGiftMsg(e.target.value)} style={{flex:'1', padding:'0.75rem 1rem', border:'1px solid #e5e7eb', borderRadius:'0.75rem', outline:'none', minWidth:'200px'}} />
          <button onClick={sendGift} style={{background:'#f43f5e', color:'white', padding:'0.75rem 1.5rem', border:'none', borderRadius:'0.75rem', fontWeight:'600', cursor:'pointer'}}>Send Gift</button>
        </div>
        <div style={{maxWidth:'600px', margin:'0 auto'}}>
          {gifts.map(g => (
            <div key={g.id} style={{display:'flex', justifyContent:'space-between', background:'#fff0f5', padding:'1rem 1.5rem', margin:'0.75rem 0', borderRadius:'1rem', border:'1px solid #fce4ec'}}>
              <span style={{fontSize:'1.1rem', fontWeight:'500'}}>{g.message}</span>
              <button onClick={() => deleteGift(g.id)} style={{background:'none', border:'none', color:'#9ca3af', cursor:'pointer', fontSize:'1rem'}} onMouseOver={(e) => e.target.style.color='#ef4444'} onMouseOut={(e) => e.target.style.color='#9ca3af'}>🗑️</button>
            </div>
          ))}
        </div>
      </ViewWrapper>
    )
  }

  // --- HOME DASHBOARD ---
  return (
    <div style={{fontFamily:'"Inter", sans-serif', minHeight:'100vh', background:'#fff0f5', padding:'2rem 1rem'}}>
      <div style={{maxWidth:'800px', margin:'0 auto'}}>
        <div style={{background:'white', borderRadius:'2rem', padding:'3rem 2rem', boxShadow:'0 20px 40px rgba(244, 63, 94, 0.1)', textAlign:'center', marginBottom:'2rem'}}>
          <div style={{fontSize:'4rem', marginBottom:'0.5rem'}}>💕</div>
          <h1 style={{color:'#f43f5e', fontSize:'2.2rem', fontWeight:'700', marginBottom:'0.5rem'}}>Family Hub</h1>
          <div style={{fontSize:'0.95rem', color:'#6b7280'}}>
            <span style={{fontWeight:'600', color:'#f43f5e'}}>{daysTogether}</span> beautiful days together 💫
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'1rem'}}>
          <MenuCard icon="📸" title="Gallery" action={() => setCurrentView('gallery')} />
          <MenuCard icon="❓" title="Questions" action={() => setCurrentView('questions')} />
          <MenuCard icon="📅" title="Plans" action={() => setCurrentView('plans')} />
          <MenuCard icon="🎁" title="Gifts" action={() => setCurrentView('gifts')} />
        </div>
        
        <button onClick={() => setIsLoggedIn(false)} style={{display:'block', margin:'3rem auto 0', background:'#ef4444', color:'white', padding:'0.75rem 2.5rem', border:'none', borderRadius:'2rem', fontSize:'0.95rem', cursor:'pointer', fontWeight:'500'}}>Log Out</button>
      </div>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div style={{position:'fixed', bottom:'2rem', left:'50%', transform:'translateX(-50%)', background: toast.type === 'error' ? '#ef4444' : '#22c55e', color:'white', padding:'1rem 2rem', borderRadius:'2rem', boxShadow:'0 10px 25px rgba(0,0,0,0.15)', fontWeight:'500', zIndex:1000, animation:'fadeIn 0.3s'}}>
          {toast.message}
        </div>
      )}
    </div>
  )
}

// --- REUSABLE COMPONENTS ---

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
