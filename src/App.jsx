import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  // --- APP STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [pin, setPin] = useState('')
  const [currentView, setCurrentView] = useState('home')
  const CORRECT_PIN = '1212'

  // --- FEATURE STATES ---
  const [photos, setPhotos] = useState([])
  const [plans, setPlans] = useState([])
  const [gifts, setGifts] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [answers, setAnswers] = useState([])
  
  // --- INPUT STATES ---
  const [planTitle, setPlanTitle] = useState('')
  const [planDate, setPlanDate] = useState('')
  const [giftMsg, setGiftMsg] = useState('')
  const [answerText, setAnswerText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // --- AUTH ---
  const handleLogin = (e) => {
    e.preventDefault()
    if (pin === CORRECT_PIN) setIsLoggedIn(true)
    else { alert('Wrong PIN!'); setPin('') }
  }

  // --- DATA FETCHING FUNCTIONS ---
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
    setCurrentQuestion(null)
    setAnswers([])
    const { data } = await supabase.from('questions').select('*').order('random()').limit(1).single()
    if (data) {
      setCurrentQuestion(data)
      // Fetch answers for this question if any exist
      const { data: ansData } = await supabase.from('answers').select('*').eq('question_id', data.id)
      if (ansData) setAnswers(ansData)
    }
  }

  // --- ACTION FUNCTIONS ---
  const uploadPhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setIsLoading(true)
    const path = `family_${Date.now()}.jpg`
    const { error } = await supabase.storage.from('gallery').upload(path, file)
    if (!error) {
      const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(path)
      await supabase.from('photos').insert({ storage_path: urlData.publicUrl, caption: 'Our memory ✨' })
      fetchPhotos()
    }
    setIsLoading(false)
  }

  const addPlan = async () => {
    if (!planTitle || !planDate) return alert('Enter a title and date!')
    await supabase.from('plans').insert({ title: planTitle, due_date: planDate })
    setPlanTitle(''); setPlanDate('')
    fetchPlans()
  }

  const togglePlan = async (id, currentStatus) => {
    const newStatus = currentStatus === 'done' ? 'pending' : 'done'
    await supabase.from('plans').update({ status: newStatus }).eq('id', id)
    fetchPlans()
  }

  const sendGift = async () => {
    if (!giftMsg) return alert('Write a message!')
    await supabase.from('gifts').insert({ message: giftMsg })
    setGiftMsg('')
    fetchGifts()
  }

  const submitAnswer = async () => {
    if (!answerText || !currentQuestion) return
    await supabase.from('answers').insert({ question_id: currentQuestion.id, answer: answerText })
    setAnswerText('')
    fetchRandomQuestion() // Refresh to show the new answer
  }

  const goHome = () => setCurrentView('home')

  // --- USE EFFECT TRIGGERS ---
  useEffect(() => { if (currentView === 'gallery') fetchPhotos() }, [currentView])
  useEffect(() => { if (currentView === 'plans') fetchPlans() }, [currentView])
  useEffect(() => { if (currentView === 'gifts') fetchGifts() }, [currentView])
  useEffect(() => { if (currentView === 'questions') fetchRandomQuestion() }, [currentView])

  // --- LOGIN SCREEN ---
  if (!isLoggedIn) {
    return (
      <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#fff0f5'}}>
        <form onSubmit={handleLogin} style={{background:'white', padding:'2rem', borderRadius:'1rem', boxShadow:'0 4px 12px rgba(0,0,0,0.1)', width:'280px'}}>
          <h2 style={{textAlign:'center', marginBottom:'1rem'}}>Welcome Home 💕</h2>
          <p style={{textAlign:'center', fontSize:'0.9rem', color:'#666', marginBottom:'1rem'}}>Enter your secret PIN</p>
          <input type="password" placeholder="1212" maxLength="4" style={{display:'block', width:'100%', padding:'0.5rem', margin:'0.5rem 0', border:'1px solid #ccc', borderRadius:'0.25rem', textAlign:'center', fontSize:'1.2rem', letterSpacing:'5px'}} value={pin} onChange={(e) => setPin(e.target.value)} />
          <button type="submit" style={{width:'100%', background:'#f43f5e', color:'white', padding:'0.5rem', border:'none', borderRadius:'0.25rem', marginTop:'1rem', cursor:'pointer'}}>Unlock 💕</button>
        </form>
      </div>
    )
  }

  // --- VIEWS ---

  // 1. GALLERY
  if (currentView === 'gallery') {
    return (
      <div style={{padding:'2rem', textAlign:'center', fontFamily:'sans-serif'}}>
        <h2 style={{color:'#f43f5e'}}>📸 Shared Gallery</h2>
        <div style={{margin:'1rem 0'}}>
          <input type="file" accept="image/*" onChange={uploadPhoto} disabled={isLoading} style={{display:'none'}} id="upload" />
          <label htmlFor="upload" style={{background:'#f43f5e', color:'white', padding:'0.5rem 1rem', borderRadius:'0.25rem', cursor:'pointer'}}>{isLoading ? 'Uploading...' : 'Upload Photo'}</label>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:'1rem', maxWidth:'800px', margin:'0 auto'}}>
          {photos.map(p => <img key={p.id} src={p.storage_path} alt="memory" style={{width:'100%', height:'150px', objectFit:'cover', borderRadius:'0.5rem', boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}} />)}
        </div>
        <button onClick={goHome} style={{marginTop:'2rem', background:'#ddd', padding:'0.5rem 1.5rem', border:'none', borderRadius:'0.25rem', cursor:'pointer'}}>⬅ Back to Home</button>
      </div>
    )
  }

  // 2. QUESTIONS
  if (currentView === 'questions') {
    return (
      <div style={{padding:'2rem', textAlign:'center', fontFamily:'sans-serif'}}>
        <h2 style={{color:'#f43f5e'}}>❓ Past Questions</h2>
        <button onClick={fetchRandomQuestion} style={{background:'#f43f5e', color:'white', padding:'0.5rem 1.5rem', border:'none', borderRadius:'0.25rem', cursor:'pointer', marginBottom:'1rem'}}>Ask a New Question</button>
        
        {currentQuestion && (
          <div style={{background:'#fff0f5', padding:'1.5rem', borderRadius:'1rem', maxWidth:'500px', margin:'0 auto'}}>
            <p style={{fontWeight:'bold', fontSize:'1.1rem'}}>"{currentQuestion.text}"</p>
            <div style={{marginTop:'1rem'}}>
              <input type="text" placeholder="Type your answer..." value={answerText} onChange={(e) => setAnswerText(e.target.value)} style={{padding:'0.5rem', border:'1px solid #ccc', borderRadius:'0.25rem', width:'70%'}} />
              <button onClick={submitAnswer} style={{marginLeft:'0.5rem', background:'#333', color:'white', padding:'0.5rem 1rem', border:'none', borderRadius:'0.25rem', cursor:'pointer'}}>Answer</button>
            </div>
            <div style={{marginTop:'1rem', textAlign:'left'}}>
              <b>Previous Answers:</b>
              {answers.map(a => <div key={a.id} style={{background:'white', padding:'0.5rem', margin:'0.5rem 0', borderRadius:'0.25rem', border:'1px solid #eee'}}>💬 {a.answer}</div>)}
            </div>
          </div>
        )}
        <button onClick={goHome} style={{marginTop:'2rem', background:'#ddd', padding:'0.5rem 1.5rem', border:'none', borderRadius:'0.25rem', cursor:'pointer'}}>⬅ Back to Home</button>
      </div>
    )
  }

  // 3. PLANS
  if (currentView === 'plans') {
    return (
      <div style={{padding:'2rem', textAlign:'center', fontFamily:'sans-serif'}}>
        <h2 style={{color:'#f43f5e'}}>📅 Shared Plans</h2>
        <div style={{margin:'1rem 0'}}>
          <input type="text" placeholder="Plan title" value={planTitle} onChange={(e) => setPlanTitle(e.target.value)} style={{padding:'0.5rem', border:'1px solid #ccc', borderRadius:'0.25rem'}} />
          <input type="date" value={planDate} onChange={(e) => setPlanDate(e.target.value)} style={{padding:'0.5rem', border:'1px solid #ccc', borderRadius:'0.25rem', marginLeft:'0.5rem'}} />
          <button onClick={addPlan} style={{marginLeft:'0.5rem', background:'#f43f5e', color:'white', padding:'0.5rem 1rem', border:'none', borderRadius:'0.25rem', cursor:'pointer'}}>Add Plan</button>
        </div>
        <div style={{maxWidth:'500px', margin:'0 auto'}}>
          {plans.map(p => (
            <div key={p.id} onClick={() => togglePlan(p.id, p.status)} style={{display:'flex', justifyContent:'space-between', background:'white', padding:'1rem', margin:'0.5rem 0', borderRadius:'0.5rem', boxShadow:'0 2px 4px rgba(0,0,0,0.05)', cursor:'pointer', borderLeft: p.status === 'done' ? '4px solid green' : '4px solid #f43f5e', textDecoration: p.status === 'done' ? 'line-through' : 'none', color: p.status === 'done' ? '#888' : '#000'}}>
              <span><b>{p.title}</b> - {p.due_date}</span>
              <span>{p.status === 'done' ? '✅' : '⬜'}</span>
            </div>
          ))}
        </div>
        <button onClick={goHome} style={{marginTop:'2rem', background:'#ddd', padding:'0.5rem 1.5rem', border:'none', borderRadius:'0.25rem', cursor:'pointer'}}>⬅ Back to Home</button>
      </div>
    )
  }

  // 4. GIFTS
  if (currentView === 'gifts') {
    return (
      <div style={{padding:'2rem', textAlign:'center', fontFamily:'sans-serif'}}>
        <h2 style={{color:'#f43f5e'}}>🎁 Gifts</h2>
        <div style={{margin:'1rem 0'}}>
          <input type="text" placeholder="Write a sweet message..." value={giftMsg} onChange={(e) => setGiftMsg(e.target.value)} style={{padding:'0.5rem', border:'1px solid #ccc', borderRadius:'0.25rem', width:'60%'}} />
          <button onClick={sendGift} style={{marginLeft:'0.5rem', background:'#f43f5e', color:'white', padding:'0.5rem 1rem', border:'none', borderRadius:'0.25rem', cursor:'pointer'}}>Send Gift</button>
        </div>
        <div style={{maxWidth:'500px', margin:'0 auto'}}>
          {gifts.map(g => (
            <div key={g.id} style={{background:'#fff0f5', padding:'1rem', margin:'0.5rem 0', borderRadius:'0.5rem', border:'1px solid #fce4ec'}}>
              💝 {g.message}
            </div>
          ))}
        </div>
        <button onClick={goHome} style={{marginTop:'2rem', background:'#ddd', padding:'0.5rem 1.5rem', border:'none', borderRadius:'0.25rem', cursor:'pointer'}}>⬅ Back to Home</button>
      </div>
    )
  }

  // --- HOME DASHBOARD ---
  return (
    <div style={{padding:'2rem', textAlign:'center', fontFamily:'sans-serif'}}>
      <h1 style={{color:'#f43f5e', marginBottom:'2rem'}}>Welcome to your Family Hub 💕</h1>
      <div style={{display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'1rem', marginTop:'1rem'}}>
        <div onClick={() => setCurrentView('gallery')} style={{padding:'1.5rem', background:'white', borderRadius:'1rem', boxShadow:'0 2px 8px rgba(0,0,0,0.1)', width:'150px', cursor:'pointer', transition:'0.2s'}}>📸 <br/><b>Gallery</b></div>
        <div onClick={() => setCurrentView('questions')} style={{padding:'1.5rem', background:'white', borderRadius:'1rem', boxShadow:'0 2px 8px rgba(0,0,0,0.1)', width:'150px', cursor:'pointer', transition:'0.2s'}}>❓ <br/><b>Questions</b></div>
        <div onClick={() => setCurrentView('plans')} style={{padding:'1.5rem', background:'white', borderRadius:'1rem', boxShadow:'0 2px 8px rgba(0,0,0,0.1)', width:'150px', cursor:'pointer', transition:'0.2s'}}>📅 <br/><b>Plans</b></div>
        <div onClick={() => setCurrentView('gifts')} style={{padding:'1.5rem', background:'white', borderRadius:'1rem', boxShadow:'0 2px 8px rgba(0,0,0,0.1)', width:'150px', cursor:'pointer', transition:'0.2s'}}>🎁 <br/><b>Gifts</b></div>
      </div>
      <button onClick={() => setIsLoggedIn(false)} style={{marginTop:'2.5rem', background:'#ef4444', color:'white', padding:'0.5rem 1.5rem', border:'none', borderRadius:'0.25rem', cursor:'pointer'}}>Log Out</button>
    </div>
  )
}
export default App
