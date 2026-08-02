import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (!supabase) return; // Don't run if keys are missing
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null))
  }, [])

  const login = async (e) => {
    e.preventDefault()
    if (!supabase) { alert('Keys missing!'); return; }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert('Wrong email/password!')
  }

  const signUp = async (e) => {
    e.preventDefault()
    if (!supabase) { alert('Keys missing!'); return; }
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      alert(error.message)
    } else {
      alert('Account created! Check email to confirm.')
    }
  }

  // THIS saves you from the blank white screen!
  if (!supabase) {
    return (
      <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#ffcccc', padding:'1rem', textAlign:'center', fontFamily:'sans-serif'}}>
        <div>
          <h1>🔑 Supabase Keys Missing</h1>
          <p>Please make sure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> are saved in your Render Environment Variables.</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#fff0f5'}}>
        <form style={{background:'white', padding:'2rem', borderRadius:'1rem', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}>
          <h2 style={{textAlign:'center', marginBottom:'1rem'}}>Welcome Home 💕</h2>
          <input type="email" placeholder="Email" style={{display:'block', width:'100%', padding:'0.5rem', margin:'0.5rem 0', border:'1px solid #ccc', borderRadius:'0.25rem'}} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" style={{display:'block', width:'100%', padding:'0.5rem', margin:'0.5rem 0', border:'1px solid #ccc', borderRadius:'0.25rem'}} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={login} style={{width:'100%', background:'#f43f5e', color:'white', padding:'0.5rem', border:'none', borderRadius:'0.25rem', marginBottom:'0.5rem'}}>Sign In</button>
          <button onClick={signUp} style={{width:'100%', background:'#e5e7eb', padding:'0.5rem', border:'none', borderRadius:'0.25rem'}}>Create Account</button>
        </form>
      </div>
    )
  }

  return (
    <div style={{padding:'2rem', textAlign:'center'}}>
      <h1>Hello {user.email} 💕</h1>
      <p>Your app is live! Now you can start building your gallery, plans, and gifts.</p>
      <button onClick={() => supabase.auth.signOut()} style={{marginTop:'1rem', background:'#ef4444', color:'white', padding:'0.5rem 1rem', border:'none', borderRadius:'0.25rem'}}>Log Out</button>
    </div>
  )
}
export default App
