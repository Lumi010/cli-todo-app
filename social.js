const reactions={chai:'Chai ke baghair degree valid nahi hoti.',cry:'Result pending. Overthinking: submitted.',cool:'Confidence 100. Plan: loading…',party:'Ab asli assignment: life.'};
document.querySelectorAll('[data-mood]').forEach(b=>b.addEventListener('click',()=>document.querySelector('.mood-response').textContent=reactions[b.dataset.mood]));
const photoDialog=document.getElementById('photo-dialog');
document.querySelectorAll('[data-memory]').forEach(b=>b.addEventListener('click',()=>{const img=b.querySelector('img');document.getElementById('full-photo').src=img.src;document.getElementById('full-photo').alt=img.alt;document.getElementById('full-photo-caption').textContent=b.querySelector('.photo-caption').textContent;photoDialog.showModal();}));
photoDialog.querySelector('.photo-close').onclick=()=>photoDialog.close();
const endpoint=window.FAREWELL_CONFIG?.apiUrl || '';
const online=/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint);
const $=id=>document.getElementById(id);
async function api(action,payload={}) {
  const response=await fetch(endpoint,{method:'POST',body:JSON.stringify({action,...payload}),headers:{'Content-Type':'text/plain;charset=utf-8'},redirect:'follow',signal:AbortSignal.timeout(20000)});
  if(!response.ok) throw Error('Connection failed. Please try again.');
  const data=await response.json();if(!data.ok)throw Error(data.error||'Please try again.');return data;
}
function localBoard(){try{return JSON.parse(localStorage.getItem('cs-rush-board')||'[]');}catch{return [];}}
function renderBoard(rows){$('leaderboard-list').replaceChildren();$('board-empty').hidden=rows.length>0;rows.slice(0,20).forEach((r,i)=>{const li=document.createElement('li'),person=document.createElement('span'),points=document.createElement('b');person.textContent=`${i+1}. ${r.player}`;points.textContent=Number(r.score).toLocaleString();li.append(person,points);$('leaderboard-list').append(li);});}
async function refreshBoard(){try{if(online){const data=await api('board');renderBoard(data.rows);document.querySelectorAll('[name=senderName]').forEach(field=>field.disabled=data.commentVersion!==2);}else renderBoard(localBoard());}catch(e){$('board-caption').textContent='Leaderboard unavailable. Tap refresh to retry.';}}
$('refresh-board').onclick=refreshBoard;
if(online){$('connection-status').textContent='Shared CS leaderboard';$('board-caption').textContent='Best runs from everyone playing. Refresh for new scores.';document.querySelectorAll('.message-status').forEach(n=>n.textContent='Your identity is not requested. Please keep it kind.');}
refreshBoard();
// Keep the event leaderboard current while visitors have the page open.
let boardPolling = false;
setInterval(async () => {
  if (!online || document.hidden || boardPolling) return;
  boardPolling = true;
  try { await refreshBoard(); } finally { boardPolling = false; }
}, 15000);
const symbols=['🐱','☕','🎓','💻','🍕','🐶','📚','🦆'];
let active=false,session=null,seed=0,events=[],startAt=0,lastTap=0,raf,round=0,ending=false;
const grid=$('reflex-grid');
for(let i=0;i<16;i++){const b=document.createElement('button');b.type='button';b.disabled=true;b.addEventListener('click',()=>tap(i));grid.append(b);}
function paint(){const target=symbols[round%symbols.length],correct=rushRound(seed,round);$('rush-target').textContent=target;[...grid.children].forEach((b,i)=>{const decoys=symbols.filter(s=>s!==target);b.textContent=i===correct?target:decoys[(i+round)%decoys.length];b.setAttribute('aria-label',b.textContent);});}
function tick(){if(!active)return;const ms=performance.now()-startAt;$('rush-time').textContent=Math.max(0,(30-ms/1000)).toFixed(1);if(ms>=30000){finish(false);return;}raf=requestAnimationFrame(tick);}
function tap(cell){const ms=Math.floor(performance.now()-startAt);if(!active||ms>30000||ms-lastTap<80)return;lastTap=ms;events.push({cell,ms});const result=rushEvaluate(seed,events);$('rush-score').textContent=result.score;$('rush-combo').textContent=`×${result.combo}`;round++;paint();}
function finish(abandoned){active=false;cancelAnimationFrame(raf);ending=abandoned;[...grid.children].forEach(b=>b.disabled=true);$('rush-start').disabled=false;$('rush-start').textContent='Play again ↗';$('rush-end').hidden=true;const result=rushEvaluate(seed,events);$('run-result').hidden=false;$('result-heading').textContent=result.score>=7000?'Department menace. Respect.':result.score>=3500?'Cat approves. Mostly.':'Cat is reviewing your performance.';$('result-detail').textContent=`${result.score.toLocaleString()} points · ${result.hits} correct · ${events.length?Math.round(result.hits/events.length*100):0}% accuracy`;$('score-form').hidden=abandoned||!events.length;$('score-status').textContent=abandoned?'Run ended early. Complete 30 seconds to post a score.':online?'Post this run to the shared CS leaderboard.':'Preview mode: posted scores stay on this device.';}
$('rush-start').onclick=async()=>{const button=$('rush-start');button.disabled=true;button.textContent='Getting your challenge…';try{session=online?await api('start'):{seed:Math.floor(Math.random()*2000000000)};seed=session.seed;events=[];round=0;lastTap=0;ending=false;$('rush-score').textContent='0';$('rush-combo').textContent='×0';$('run-result').hidden=true;$('rush-end').hidden=false;active=true;[...grid.children].forEach(b=>b.disabled=false);paint();startAt=performance.now();tick();button.textContent='Run in progress…';}catch(e){button.disabled=false;button.textContent='Start a 30-second run ↗';$('score-status').textContent=e.message;$('run-result').hidden=false;$('score-form').hidden=true;}};
$('rush-end').onclick=()=>finish(true);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&active)finish(true);});
$('score-form').onsubmit=async e=>{e.preventDefault();if(active||ending||!session)return;const player=$('player-id').value.trim();if(player.length<2){$('score-status').textContent='Use at least two characters.';return;}const button=e.submitter;button.disabled=true;$('score-status').textContent='Saving your run…';try{const result=rushEvaluate(seed,events);if(online){await api('score',{token:session.token,player,events});}else{let rows=localBoard();const old=rows.find(r=>r.player.toLowerCase()===player.toLowerCase());if(!old)rows.push({player,score:result.score});else old.score=Math.max(old.score,result.score);rows.sort((a,b)=>b.score-a.score);localStorage.setItem('cs-rush-board',JSON.stringify(rows.slice(0,100)));}$('score-status').textContent=online?'Score posted. Your next challenge: leave us a note.':'Saved on this device only. Shared leaderboard is not connected yet.';$('score-form').hidden=true;await refreshBoard();}catch(err){$('score-status').textContent=err.message;}finally{button.disabled=false;}};
document.querySelectorAll('.anonymous-form').forEach(form=>form.onsubmit=async e=>{e.preventDefault();const status=form.querySelector('.message-status');if(!online){status.textContent='This inbox is not connected yet. Your message has not been sent.';return;}if(form.elements.website.value)return;const senderName=form.elements.senderName.disabled?'':form.elements.senderName.value.trim();const button=e.submitter;button.disabled=true;status.textContent='Sending…';try{await api('comment',{recipient:form.dataset.recipient,message:form.elements.message.value,senderName,id:(form.dataset.pendingId ||= crypto.randomUUID())});form.reset();delete form.dataset.pendingId;status.textContent='Comment sent. Thank you! ♡';form.querySelector('.after-comment').hidden=false;}catch(err){status.textContent='Could not confirm delivery. Your text is still here; please try again.';}finally{button.disabled=false;}});
function routePerson(){const id=location.hash.slice(1).toLowerCase();document.querySelectorAll('.person-card').forEach(card=>card.classList.toggle('selected-person',card.id===id));if(['momin','ajeet','salman','mubashir'].includes(id))requestAnimationFrame(()=>$(id).scrollIntoView({behavior:'instant',block:'start'}));}
window.addEventListener('hashchange',routePerson);window.addEventListener('load',routePerson);

paint();

