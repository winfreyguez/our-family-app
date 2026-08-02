import { useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [pin, setPin] = useState('')
  const [currentView, setCurrentView] = useState('home') // 'home', 'gallery', 'questions', 'plans', 'gifts'
  const CORRECT_PIN = '1212'

  const handleLogin = (e) => {
    e.preventDefault()
    if (pin === CORRECT_PIN) {
      setIsLoggedIn(true)
    } else {
      alert('Wrong PIN! Try again.')
      setPin('')
    }
  }

  // --- ACTUAL FEATURE FUNCTIONS ---
  const handleGallery = () => setCurrentView('gallery')
  const handleQuestions = () => setCurrentView('questions')
  const handlePlans = () => setCurrentView('plans')
  const handleGifts = () => setCurrentView('gifts')
  const goHome = () => setCurrentView('home')

  // --- LOGIN SCREEN ---
  if (!isLoggedIn) {
    return (
      <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#fff0f5'}}>
        <form onSubmit={handleLogin} style={{background:'white', padding:'2rem', borderRadius:'1rem', boxShadow:'0 4px 12px rgba(0,0,0,0.1)', width:'280px'}}>
          <h2 style={{textAlign:'center', marginBottom:'1rem'}}>Welcome Home 💕</h2>
          <p style={{textAlign:'center', fontSize:'0.9rem', color:'#666', marginBottom:'1rem'}}>Enter your secret PIN</p>
          <input 
            type="password" placeholder="Enter PIN" maxLength="4"
            style={{display:'block', width:'100%', padding:'0.5rem', margin:'0.5rem 0', border:'1px solid #ccc', borderRadius:'0.25rem', textAlign:'center', fontSize:'1.2rem', letterSpacing:'5px'}} 
            value={pin} onChange={(e) => setPin(e.target.value)} 
          />
          <button type="submit" style={{width:'100%', background:'#f43f5e', color:'white', padding:'0.5rem', border:'none', borderRadius:'0.25rem', marginTop:'1rem', cursor:'pointer'}}>Unlock 💕</button>
        </form>
      </div>
    )
  }

  // --- GALLERY VIEW ---
  if (currentView === 'gallery') {
    return (
      <div style={{padding:'2rem', textAlign:'center'}}>
        <h2>📸 Your Shared Gallery</h2>
        <p style={{color:'gray'}}>(Here is where your uploaded photos will appear)</p>
        <button onClick={goHome} style={{marginTop:'2rem', background:'#ddd', padding:'0.5rem 1.5rem', border:'none', borderRadius:'0.25rem', cursor:'pointer'}}>⬅ Back to Home</button>
      </div>
    )
  }

  // --- QUESTIONS VIEW ---
  if (currentView === 'questions') {
    return (
      <div style={{padding:'2rem', textAlign:'center'}}>
        <h2>❓ Past Questions</h2>
        <p style={{color:'gray'}}>Click the button below to get a random memory question!</p>
        <button style={{marginTop:'1rem', background:'#f43f5e', color:'white', padding:'0.5rem 1.5rem', border:'none', borderRadius:'0.25rem', cursor:'pointer'}}>Ask a Question</button>
        <button onClick={goHome} style={{marginTop:'2rem', display:'block', marginLeft:'auto', marginRight:'auto', background:'#ddd', padding:'0.5rem 1.5rem', border:'none', borderRadius:'0.25rem', cursor:'pointer'}}>⬅ Back to Home</button>
      </div>
    )
  }

  // --- PLANS VIEW ---
  if (currentView === 'plans') {
    return (
      <div style={{padding:'2rem', textAlign:'center'}}>
        <h2>📅 Shared Plans</h2>
        <p style={{color:'gray'}}>(Here is where you add your trips and dates)</p>
        <button onClick={goHome} style={{marginTop:'2rem', background:'#ddd', padding:'0.5rem 1.5rem', border:'none', borderRadius:'0.25rem', cursor:'pointer'}}>⬅ Back to Home</button>
      </div>
    )
  }

  // --- GIFTS VIEW ---
  if (currentView === 'gifts') {
    return (
      <div style={{padding:'2rem', textAlign:'center'}}>
        <h2>🎁 Virtual & Real Gifts</h2>
        <p style={{color:'gray'}}>(Send a gift or see what the other sent)</p>
        <button onClick={goHome} style={{marginTop:'2rem', background:'#ddd', padding:'0.5rem 1.5rem', border:'none', borderRadius:'0.25rem', cursor:'pointer'}}>⬅ Back to Home</button>
      </div>
    )
  }

  // --- HOME DASHBOARD ---
  return (
    <div style={{padding:'2rem', textAlign:'center', fontFamily:'sans-serif'}}>
      <h1 style={{color:'#f43f5e', marginBottom:'2rem'}}>Welcome to your Family Hub 💕</h1>
      
      <div style={{display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'1rem', marginTop:'1rem'}}>
        <div onClick={handleGallery} style={{padding:'1.5rem', background:'white', borderRadius:'1rem', boxShadow:'0 2px 8px rgba(0,0,0,0.1)', width:'150px', cursor:'pointer', transition:'0.2s'}}>
          📸 <br/><b>Gallery</b>
        </div>
        <div onClick={handleQuestions} style={{padding:'1.5rem', background:'white', borderRadius:'1rem', boxShadow:'0 2px 8px rgba(0,0,0,0.1)', width:'150px', cursor:'pointer', transition:'0.2s'}}>
          ❓ <br/><b>Questions</b>
        </div>
        <div onClick={handlePlans} style={{padding:'1.5rem', background:'white', borderRadius:'1rem', boxShadow:'0 2px 8px rgba(0,0,0,0.1)', width:'150px', cursor:'pointer', transition:'0.2s'}}>
          📅 <br/><b>Plans</b>
        </div>
        <div onClick={handleGifts} style={{padding:'1.5rem', background:'white', borderRadius:'1rem', boxShadow:'0 2px 8px rgba(0,0,0,0.1)', width:'150px', cursor:'pointer', transition:'0.2s'}}>
          🎁 <br/><b>Gifts</b>
        </div>
      </div>

      <button onClick={() => setIsLoggedIn(false)} style={{marginTop:'2.5rem', background:'#ef4444', color:'white', padding:'0.5rem 1.5rem', border:'none', borderRadius:'0.25rem', cursor:'pointer'}}>Log Out</button>
    </div>
  )
}
export default App
