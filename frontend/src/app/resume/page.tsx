"use client"

import {useState} from "react"
import {parseResume} from "@/lib/resumeParser"

export default function Resume(){

 const [text,setText]=useState("")
 const [skills,setSkills]=useState<string[]>([])

 const analyze=()=>{
  const result=parseResume(text)
  setSkills(result.skills)
 }

 return(

 <div className="p-10 text-white bg-slate-950 min-h-screen">

  <textarea
   className="w-full p-4 text-black"
   onChange={e=>setText(e.target.value)}
  />

  <button
   onClick={analyze}
   className="bg-purple-600 px-6 py-3 mt-4"
  >
   Analyze Resume
  </button>

  <p>Detected Skills: {skills.join(", ")}</p>

 </div>

 )

}