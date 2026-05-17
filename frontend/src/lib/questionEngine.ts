export function generateQuestions(skills:string[]){

 const bank:any={

  Python:[
   "Explain Python decorators",
   "What is list comprehension?"
  ],

  React:[
   "What are React hooks?",
   "Explain virtual DOM"
  ],

  "Machine Learning":[
   "Explain gradient descent",
   "What is overfitting?"
  ]

 }

 let questions:string[]=[]

 skills.forEach(skill=>{
  if(bank[skill]) questions.push(...bank[skill])
 })

 return questions.slice(0,5)

}