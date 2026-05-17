export function analyzeBehavior(answer:string){

 let communication=80
 let confidence=85

 if(answer.length<20){
  communication=60
 }

 return{
  communication,
  confidence,
  integrity:90
 }

}