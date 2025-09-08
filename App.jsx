/*
InternAI Connect — Prototype React Component
Single-file React component (default export) meant for quick local preview in a React app.

Features:
- Student profile form (name, skills, interests, preferred location)
- Built-in sample internships dataset
- Lightweight recommendation engine (content-based scoring by keyword overlap)
- Explanation panel showing why each internship was recommended
- Export result as CSV

How to run locally (quick):
1. Create a React app (Vite recommended):
   npx create-vite@latest internai-proto --template react
   cd internai-proto
2. Replace src/App.jsx with this file's content and run:
   npm install
   npm run dev
3. Tailwind is optional. This component uses Tailwind utility classes. To preview without Tailwind, remove className values or add a CDN link to Tailwind in index.html for quick testing.

Note: This is a frontend-only prototype. The matching logic is client-side and simple for demo purposes; in production move matching to backend and add persistent DB & ML models.
*/
import './App.css';
import React, { useState } from 'react'

const SAMPLE_INTERNSHIPS = [
  {
    id: 1,
    title: 'Frontend Developer Intern',
    org: 'TechBridge Labs',
    skills: ['javascript', 'react', 'css', 'html'],
    location: 'Remote',
    duration: '8 weeks',
    stipend: '10,000 INR'
  },
  {
    id: 2,
    title: 'Data Science Intern',
    org: 'InsightAI Pvt Ltd',
    skills: ['python', 'machine learning', 'pandas', 'nlp'],
    location: 'Bengaluru',
    duration: '12 weeks',
    stipend: '15,000 INR'
  },
  {
    id: 3,
    title: 'Product Research Intern',
    org: 'GovTech Initiatives',
    skills: ['research', 'user research', 'policy', 'writing'],
    location: 'New Delhi',
    duration: '6 weeks',
    stipend: 'Unpaid'
  },
  {
    id: 4,
    title: 'Backend Developer Intern',
    org: 'ScaleStack',
    skills: ['nodejs', 'express', 'sql', 'docker'],
    location: 'Mumbai',
    duration: '8 weeks',
    stipend: '12,000 INR'
  },
  {
    id: 5,
    title: 'AI Ethics Intern',
    org: 'Policy Labs',
    skills: ['ethics', 'nlp', 'policy', 'research'],
    location: 'Remote',
    duration: '10 weeks',
    stipend: '12,000 INR'
  }
]

function tokenize(text) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
}

function scoreMatch(profile, internship) {
  // Simple scoring by keyword overlap between profile skills+interests and internship.skills
  const profileTokens = new Set([
    ...profile.skills.map(s => s.toLowerCase()),
    ...tokenize(profile.interests || ''),
    ...(profile.freeText ? tokenize(profile.freeText) : [])
  ])

  const skillOverlap = internship.skills.filter(s => profileTokens.has(s.toLowerCase())).length

  // location score
  const locScore = (profile.locationPreference === internship.location || profile.locationPreference === 'Any') ? 1 : 0

  // total score = weighted sum
  return {
    score: skillOverlap * 10 + locScore * 2,
    reasons: {
      skillOverlap,
      locScore
    }
  }
}

export default function InternAIPrototype() {
  const [profile, setProfile] = useState({
    name: '',
    skills: [],
    interests: '',
    locationPreference: 'Any',
    freeText: ''
  })

  const [skillInput, setSkillInput] = useState('')
  const [results, setResults] = useState([])
  const [showExplanation, setShowExplanation] = useState(null)

  function addSkill() {
    const s = skillInput.trim()
    if (!s) return
    setProfile(p => ({ ...p, skills: Array.from(new Set([...p.skills, s])) }))
    setSkillInput('')
  }

  function removeSkill(s) {
    setProfile(p => ({ ...p, skills: p.skills.filter(x => x !== s) }))
  }

  function runRecommendation() {
    const scored = SAMPLE_INTERNSHIPS.map(i => {
      const { score, reasons } = scoreMatch(profile, i)
      return { ...i, score, reasons }
    }).sort((a, b) => b.score - a.score)

    setResults(scored)
    setShowExplanation(scored.length ? scored[0].id : null)
  }

  function exportCSV() {
    const header = ['id','title','org','location','duration','stipend','score']
    const rows = results.map(r => [r.id, r.title, r.org, r.location, r.duration, r.stipend, r.score])
    const csv = [header, ...rows].map(r => r.map(cell => '"'+String(cell).replace(/"/g,'""')+'"').join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'intern_recommendations.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 p-6 font-sans">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-2">InternAI Connect — Prototype</h1>
        <p className="text-sm text-slate-600 mb-4">AI-based internship recommendation demo for PM Internship Scheme (Problem Statement 34)</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">Student Profile</h2>
            <label className="text-xs text-slate-600">Name</label>
            <input value={profile.name} onChange={e=>setProfile({...profile, name:e.target.value})} className="w-full border rounded px-2 py-1 mb-2" placeholder="Full name" />

            <label className="text-xs text-slate-600">Skills</label>
            <div className="flex gap-2 mb-2">
              <input value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); addSkill() } }} className="flex-1 border rounded px-2 py-1" placeholder="e.g., Python, React" />
              <button onClick={addSkill} className="px-3 py-1 bg-sky-600 text-white rounded">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {profile.skills.map(s=> (
                <span key={s} className="px-2 py-1 bg-slate-100 rounded flex items-center gap-2">{s} <button onClick={()=>removeSkill(s)} className="text-xs text-red-500">x</button></span>
              ))}
            </div>

            <label className="text-xs text-slate-600">Interests / Domains</label>
            <input value={profile.interests} onChange={e=>setProfile({...profile, interests:e.target.value})} className="w-full border rounded px-2 py-1 mb-2" placeholder="AI, Web, Policy, Data" />

            <label className="text-xs text-slate-600">Location Preference</label>
            <select value={profile.locationPreference} onChange={e=>setProfile({...profile, locationPreference:e.target.value})} className="w-full border rounded px-2 py-1 mb-2">
              <option>Any</option>
              <option>Remote</option>
              <option>Bengaluru</option>
              <option>New Delhi</option>
              <option>Mumbai</option>
            </select>

            <label className="text-xs text-slate-600">Describe yourself (optional)</label>
            <textarea value={profile.freeText} onChange={e=>setProfile({...profile, freeText:e.target.value})} className="w-full border rounded px-2 py-1 mb-2" rows={3} placeholder="e.g., worked on NLP project, open-source contributor"></textarea>

            <div className="flex gap-2 mt-2">
              <button onClick={runRecommendation} className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded">Recommend Internships</button>
              <button onClick={exportCSV} className="bg-slate-200 px-3 py-2 rounded">Export</button>
            </div>
          </div>

          <div className="md:col-span-2 p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">Recommended Internships</h2>
            <p className="text-sm text-slate-500 mb-3">Results are scored by skill overlap and location preference. Click an item to see explanation.</p>

            <div className="grid gap-3">
              {results.length===0 && (
                <div className="text-slate-500">No recommendations yet — fill profile and click <strong>Recommend Internships</strong>.</div>
              )}

              {results.map(r => (
                <div key={r.id} onClick={()=>setShowExplanation(showExplanation===r.id?null:r.id)} className={`p-3 rounded border cursor-pointer ${showExplanation===r.id? 'bg-sky-50 border-sky-200':'bg-white'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-lg font-semibold">{r.title}</div>
                      <div className="text-sm text-slate-600">{r.org} • {r.location} • {r.duration} • {r.stipend}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-700 font-medium">Score: {r.score}</div>
                      <div className="text-xs text-slate-500">Rank #{results.indexOf(r)+1}</div>
                    </div>
                  </div>

                  {showExplanation===r.id && (
                    <div className="mt-3 bg-white p-3 rounded border-t">
                      <div className="text-sm text-slate-700 mb-1"><strong>Why this match?</strong></div>
                      <ul className="list-disc ml-5 text-sm text-slate-600">
                        <li>Skill overlap: <strong>{r.reasons.skillOverlap}</strong> shared skills.</li>
                        <li>Location match: <strong>{r.reasons.locScore ? 'Yes' : 'No'}</strong>.</li>
                      </ul>

                      <div className="mt-2 text-sm text-slate-600"><strong>Suggested next steps:</strong>
                        <ol className="list-decimal ml-5 mt-1">
                          <li>Polish missing skills (if any) with quick online courses.</li>
                          <li>Apply and attach a tailored cover note highlighting matched skills.</li>
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 border-t">
              <h3 className="font-semibold">Sample Internship Dataset</h3>
              <div className="text-sm text-slate-500">(Hardcoded for prototype; replace with API in production)</div>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_INTERNSHIPS.map(i=> (
                  <div key={i.id} className="p-2 border rounded bg-slate-50 text-sm">
                    <div className="font-medium">{i.title} — {i.org}</div>
                    <div className="text-xs text-slate-600">Skills: {i.skills.join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      <footer className="max-w-5xl mx-auto mt-4 text-center text-xs text-slate-500">Prototype — InternAI Connect. Convert to full-stack for production: backend, DB, authentication, ML model, analytics.</footer>
    </div>
  )
}
