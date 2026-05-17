export function calculateScore(data:any){

 const score=
  data.tech*0.4+
  data.coding*0.3+
  data.communication*0.2+
  data.integrity*0.1

 return Math.round(score)

}