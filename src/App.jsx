import { useState } from 'react'

// NOTE: The supabase import is still here if you want to add photos later!
import { supabase } from './supabaseClient'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [pin, setPin] = useState('')
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

  // --- LOGIN SCREEN ---
  if (!isLoggedIn) {
    return (
      <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#fff0f5'}}>
        <form onSubmit={handleLogin} style={{background:'white', padding:'2rem', borderRadius:'1rem', boxShadow:'0 4px 12px rgba(0,0,0,0.1)', width:'280px'}}>
          <h2 style={{textAlign:'center', marginBottom:'1rem'}}>Welcome Home 💕</h2>
          <p style={{textAlign:'center', fontSize:'0.9rem', color:'#666', marginBottom:'1rem'}}>Enter your secret PIN</p>
          <input 
            type="password" 
            placeholder="Enter PIN" 
            maxLength="4"
            style={{display:'block', width:'100%', padding:'0.5rem', margin:'0.5rem 0', border:'1px solid #ccc', borderRadius:'0.25rem', textAlign:'center', fontSize:'1.2rem', letterSpacing:'5px'}} 
            value={pin}
            onChange={(e) => setPin(e.target.value)} 
          />
          <button 
            type="submit"
            style={{width:'100%', background:'#f43f5e', color:'white', padding:'0.5rem', border:'none', borderRadius:'0.25rem', marginTop:'1rem', cursor:'pointer'}}>
            Unlock 💕
          </button>
        </form>
      </div>
    )
  }

  // --- MAIN APP DASHBOARD ---
  return (
    <div style={{padding:'2rem', textAlign:'center', fontFamily:'sans-serif'}}>
      <h1 style={{color:'#f43f5e'}}>Welcome to your Family Hub 💕</h1>
      
      <div style={{display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'1rem', marginTop:'2rem'}}>
        <div style={{padding:'1rem', background:'white', borderRadius:'1rem', boxShadow:'0 2px 8px rgba(0,0,0,0.1)', width:'150px'}}>
          📸 <br/><b>Gallery</b>
        </div>
        <div style={{padding:'1rem', background:'white', borderRadius:'1rem', boxShadow:'0 2px 8px rgba(0,0,0,0.1)', width:'150px'}}>
          ❓ <br/><b>Questions</b>
        </div>
        <div style={{padding:'1rem', background:'white', borderRadius:'1rem', boxShadow:'0 2px 8px rgba(0,0,0,0.1)', width:'150px'}}>
          📅 <br/><b>Plans</b>
        </div>
        <div style={{padding:'1rem', background:'white', borderRadius:'1rem', boxShadow:'0 2px 8px rgba(0,0,0,0.1)', width:'150px'}}>
          🎁 <br/><b>Gifts</b>
        </div>
      </div>

      <button 
        onClick={() => setIsLoggedIn(false)} 
        style={{marginTop:'2rem', background:'#ef4444', color:'white', padding:'0.5rem 1.5rem', border:'none', borderRadius:'0.25rem', cursor:'pointer'}}>
        Log Out
      </button>
    </div>
  )
}

export default App
