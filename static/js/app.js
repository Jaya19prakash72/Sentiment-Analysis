let chartCanvas;
const samples = [
  "I absolutely love this product. The quality is excellent and the service is fantastic!",
  "This is terrible. The app is slow, frustrating and completely useless.",
  "The package was delivered today and contains three items."
];

function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active-page"));
  document.getElementById(id).classList.add("active-page");
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.target===id));
  if(id==="history") loadStats();
}
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.target)));

async function analyze(text){
  const res=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text})});
  return await res.json();
}
async function analyzeMain(){
  const text=document.getElementById("mainText").value.trim();
  if(!text){alert("Please enter some text.");return;}
  const result=await analyze(text);
  renderResult(result);
  loadStats();
}
function renderResult(r){
  document.getElementById("emptyResult").classList.add("hidden");
  document.getElementById("fullResult").classList.remove("hidden");
  const pill=document.getElementById("resultPill");
  pill.textContent=r.sentiment.toUpperCase();
  pill.style.background=r.sentiment==="Positive"?"#e7faef":r.sentiment==="Negative"?"#ffe9ec":"#fff5db";
  pill.style.color=r.sentiment==="Positive"?"#1c9a5e":r.sentiment==="Negative"?"#d94c5c":"#bd8410";
  document.getElementById("confidence").textContent=r.confidence+"%";
  ["pos","neg","neu"].forEach((x,i)=>{
    const key=["Positive","Negative","Neutral"][i];
    document.getElementById(x+"Bar").style.width=r.scores[key]+"%";
    document.getElementById(x+"Score").textContent=r.scores[key]+"%";
  });
}
async function quickAnalyze(){
  const text=document.getElementById("quickText").value.trim();
  if(!text){alert("Enter a sentence first.");return;}
  const r=await analyze(text);
  const el=document.getElementById("quickResult");
  el.classList.remove("hidden");
  el.textContent=r.sentiment+" • "+r.confidence+"% confidence";
  el.style.background=r.sentiment==="Positive"?"#e7faef":r.sentiment==="Negative"?"#ffe9ec":"#fff5db";
  el.style.color=r.sentiment==="Positive"?"#1c9a5e":r.sentiment==="Negative"?"#d94c5c":"#bd8410";
  loadStats();
}
function useSample(i){document.getElementById("mainText").value=samples[i];updateCount()}
function updateCount(){document.getElementById("charCount").textContent=document.getElementById("mainText").value.length+" / 2000"}
document.getElementById("mainText").addEventListener("input",updateCount);

function drawChart(c){
  const canvas=document.getElementById("sentimentChart");
  const ctx=canvas.getContext("2d"); canvas.width=210;canvas.height=210;
  ctx.clearRect(0,0,210,210);
  const vals=[c.Positive||0,c.Negative||0,c.Neutral||0], total=vals.reduce((a,b)=>a+b,0);
  let start=-Math.PI/2;
  const colors=["#7658e8","#ed5364","#d69616"];
  if(!total){ctx.beginPath();ctx.arc(105,105,85,0,Math.PI*2);ctx.strokeStyle="#eeeef4";ctx.lineWidth=25;ctx.stroke();}
  else vals.forEach((v,i)=>{let end=start+(v/total)*Math.PI*2;ctx.beginPath();ctx.arc(105,105,85,start,end);ctx.strokeStyle=colors[i];ctx.lineWidth=25;ctx.stroke();start=end});
  ctx.fillStyle="#202235";ctx.font="700 22px Segoe UI";ctx.textAlign="center";ctx.fillText(total,105,101);
  ctx.fillStyle="#999bad";ctx.font="11px Segoe UI";ctx.fillText("analyses",105,120);
}
async function loadStats(){
  const r=await fetch("/api/stats"); const d=await r.json();
  document.getElementById("total").textContent=d.total;
  document.getElementById("positive").textContent=d.counts.Positive||0;
  document.getElementById("negative").textContent=d.counts.Negative||0;
  document.getElementById("neutral").textContent=d.counts.Neutral||0;
  drawChart(d.counts);
  const body=document.getElementById("historyBody");
  if(body){
    body.innerHTML=d.history.length?d.history.map(x=>`<tr><td>${x.timestamp.replace("T"," ")}</td><td>${escapeHtml(x.text)}</td><td><b>${x.sentiment}</b></td><td>${x.confidence}%</td></tr>`).join(""):`<tr><td colspan="4">No analyses yet.</td></tr>`;
  }
}
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
loadStats();
