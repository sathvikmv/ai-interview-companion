export function parseResume(text:string){

 const skills=[
  "Python",
  "Java",
  "React",
  "Machine Learning",
  "TensorFlow",
  "Node.js"
 ]

 const detected=skills.filter(skill=>
  text.toLowerCase().includes(skill.toLowerCase())
 )

 return{
  skills:detected
 }

}