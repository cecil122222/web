/* =====================
   전역 상태
===================== */
let currentDate = new Date();
let emotionCalendarDate = new Date();

let selectedEmotion = '';
let selectedEmotionDate = '';
let selectedDiaryDate = '';
let selectedTodoDate = '';

/* 감정 → 색상 */
const emotionColors = {
  '행복': '#FFD93D',
  '보통': '#95D5B2',
  '지루': '#CED4DA',
  '슬픔': '#74C0FC',
  '화남': '#FF6B6B'
};

/* =====================
   유틸
===================== */
function capitalize(s){
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getToday(){
  const y = currentDate.getFullYear();
  const m = String(currentDate.getMonth()+1).padStart(2,'0');
  const d = String(currentDate.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}

function getEmoji(e){
  switch(e){
    case '행복': return '😄';
    case '보통': return '🙂';
    case '지루': return '😐';
    case '슬픔': return '😢';
    case '화남': return '😡';
    default: return '';
  }
}

/* =====================
   메뉴 전환
===================== */
function showSection(section){
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(section).classList.add('active');

  document.querySelectorAll('.menu button').forEach(b => b.classList.remove('active'));
  if(section !== 'calendar'){
    document.getElementById('menu' + capitalize(section)).classList.add('active');
  }

  if(section === 'emotionChange'){
    renderEmotionCalendar();
    renderWeeklyEmotionChart();
  }

  if(section === 'todo'){
    renderTodos(selectedTodoDate || getToday());
  }
}

/* =====================
   날짜 선택기
===================== */
function openDatePicker(callback){
  const input = document.createElement('input');
  input.type = 'date';
  input.style.position = 'fixed';
  input.style.top = '50%';
  input.style.left = '50%';
  input.style.transform = 'translate(-50%, -50%)';
  input.style.zIndex = '9999';

  input.onchange = () => {
    callback(input.value);
    input.remove();
  };

  document.body.appendChild(input);
  input.focus();
}

function pickDate(){
  openDatePicker(date=>{
    selectedEmotionDate = date;
    showToast(`${date} 선택됨`);
  });
}
function pickDiaryDate(){
  openDatePicker(date=>{
    selectedDiaryDate = date;
    showToast(`${date} 선택됨`);
  });
}
function pickTodoDate(){
  openDatePicker(date=>{
    selectedTodoDate = date;
    renderTodos(date);
    showToast(`${date} 선택됨`);
  });
}

/* =====================
   감정
===================== */
function setEmotion(e){
  selectedEmotion = e;
}

function saveEmotion(){
  const date = selectedEmotionDate || getToday();
  if(!selectedEmotion){
    showToast('감정을 선택하세요');
    return;
  }
  localStorage.setItem(date + '_emotion', selectedEmotion);
  renderCalendar();
  showToast('감정이 저장되었습니다 😊');
}

/* =====================
   일기
===================== */
function saveDiary(){
  const date = selectedDiaryDate || getToday();
  const text = document.getElementById('diaryInput').value;
  if(!text){
    showToast('일기를 입력하세요');
    return;
  }
  localStorage.setItem(date + '_diary', text);
  showToast('일기가 저장되었습니다 📝');
}

/* =====================
   할 일
===================== */
function addTodo(){
  const date = selectedTodoDate || getToday();
  const input = document.getElementById('todoInput');
  if(!input.value){
    showToast('할 일을 입력하세요');
    return;
  }

  const todos = JSON.parse(localStorage.getItem(date + '_todos') || '[]');
  todos.push({ text: input.value, checked:false });
  localStorage.setItem(date + '_todos', JSON.stringify(todos));

  input.value = '';
  renderTodos(date);
  renderCalendar();
  showToast('할 일이 추가되었습니다 ✅');
}

function renderTodos(date){
  const list = document.getElementById('todoList');
  const todos = JSON.parse(localStorage.getItem(date + '_todos') || '[]');
  list.innerHTML = '';

  todos.forEach(t=>{
    const li = document.createElement('li');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = t.checked;

    cb.onchange = ()=>{
      t.checked = cb.checked;
      localStorage.setItem(date + '_todos', JSON.stringify(todos));
      renderCalendar();
      renderTodoProgress(date);
    };

    li.appendChild(cb);
    li.appendChild(document.createTextNode(' ' + t.text));
    list.appendChild(li);
  });

  renderTodoProgress(date);
}

/* =====================
   할 일 완료율
===================== */
function renderTodoProgress(date){
  const box = document.getElementById('todoProgressBox');
  const text = document.getElementById('todoProgressText');
  const bar = document.getElementById('todoProgressBar');

  if(!box || !text || !bar) return;

  const todos = JSON.parse(localStorage.getItem(date + '_todos') || '[]');
  if(todos.length === 0){
    box.style.display = 'none';
    return;
  }

  const done = todos.filter(t => t.checked).length;
  const total = todos.length;
  const percent = Math.round((done / total) * 100);

  box.style.display = 'block';
  text.innerText = `오늘 할 일 ${done} / ${total} 완료 (${percent}%)`;
  bar.style.width = percent + '%';
}

/* =====================
   토스트
===================== */
function showToast(message){
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(()=>toast.classList.add('show'),10);
  setTimeout(()=>{
    toast.classList.remove('show');
    setTimeout(()=>toast.remove(),300);
  },1500);
}

/* =====================
   메인 달력
===================== */
function renderCalendar(){
  const calendar = document.getElementById('calendarGrid');
  const monthYear = document.getElementById('monthYear');
  calendar.innerHTML = '';

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  monthYear.innerText = `${year}년 ${month+1}월`;

  const firstDay = new Date(year,month,1).getDay();
  const lastDate = new Date(year,month+1,0).getDate();

  for(let i=0;i<firstDay;i++) calendar.innerHTML += `<div></div>`;

  for(let day=1; day<=lastDate; day++){
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const emotion = localStorage.getItem(key+'_emotion');
    const emoji = emotion ? getEmoji(emotion) : '';
    calendar.innerHTML += `
      <div class="calendar-cell" onclick="openDetail('${key}')">
        ${day} ${emoji}
      </div>`;
  }
}

/* =====================
   감정 변화 달력
===================== */
function renderEmotionCalendar(){
  const grid = document.getElementById('emotionCalendarGrid');
  const title = document.getElementById('emotionMonthYear');
  grid.innerHTML = '';

  const year = emotionCalendarDate.getFullYear();
  const month = emotionCalendarDate.getMonth();
  title.innerText = `${year}년 ${month+1}월`;

  const firstDay = new Date(year,month,1).getDay();
  const lastDate = new Date(year,month+1,0).getDate();

  for(let i=0;i<firstDay;i++) grid.innerHTML += `<div></div>`;

  for(let day=1; day<=lastDate; day++){
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const emotion = localStorage.getItem(key+'_emotion');
    const bg = emotion ? emotionColors[emotion] : 'transparent';

    grid.innerHTML += `
      <div class="calendar-cell"
           style="background-color:${bg}"
           onclick="openDetail('${key}')">
        ${day}
      </div>`;
  }
}

/* =====================
   주간 감정 그래프 + 평균
===================== */
let weeklyChart = null;

function renderWeeklyEmotionChart(){
  const ctx = document.getElementById('weeklyEmotionChart');
  if(!ctx) return;

  const labels = [];
  const data = [];
  const today = new Date();

  for(let i=6;i>=0;i--){
    const d = new Date(today);
    d.setDate(today.getDate()-i);

    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    const key = `${y}-${m}-${day}_emotion`;

    labels.push(`${m}/${day}`);

    const emotion = localStorage.getItem(key);
    if(emotion === '행복') data.push(5);
    else if(emotion === '보통') data.push(4);
    else if(emotion === '지루') data.push(3);
    else if(emotion === '슬픔') data.push(2);
    else if(emotion === '화남') data.push(1);
    else data.push(null);
  }

  if(weeklyChart) weeklyChart.destroy();

  weeklyChart = new Chart(ctx, {
    type:'line',
    data:{ labels, datasets:[{
      data,
      borderColor:'#2d6a4f',
      backgroundColor:'rgba(45,106,79,0.15)',
      tension:0.3,
      fill:true
    }]},
    options:{
      scales:{
        y:{
          min:1,
          max:5,
          ticks:{
            stepSize:1,
            callback:v=>['','😡','😢','😐','🙂','😄'][v]
          }
        }
      },
      plugins:{ legend:{display:false} }
    }
  });

  renderWeeklyEmotionSummary(data);
}

function renderWeeklyEmotionSummary(data){
  const valid = data.filter(v=>v!==null);
  let box = document.getElementById('weeklyEmotionSummary');

  if(!box){
    box = document.createElement('p');
    box.id = 'weeklyEmotionSummary';
    box.style.textAlign = 'center';
    box.style.fontWeight = 'bold';
    document.getElementById('weeklyEmotionChart').after(box);
  }

  if(valid.length === 0){
    box.innerText = '이번 주에 기록된 감정이 없어요.';
    return;
  }

  const avg = valid.reduce((a,b)=>a+b,0) / valid.length;

  if(avg >= 4.5) box.innerText = '😊 이번 주는 전반적으로 매우 좋은 한 주였어요';
  else if(avg >= 3.5) box.innerText = '🙂 이번 주는 비교적 안정적인 감정 상태였어요';
  else if(avg >= 2.5) box.innerText = '😐 감정의 기복이 조금 있었던 한 주였어요';
  else if(avg >= 1.5) box.innerText = '😢 이번 주는 다소 힘든 한 주였어요';
  else box.innerText = '😡 스트레스가 많았던 한 주였어요';
}

/* =====================
   상세 모달
===================== */
function openDetail(dateKey){
  document.getElementById('detailModal').style.display = 'flex';
  document.getElementById('detailDate').innerText = dateKey;

  document.getElementById('detailEmotion').innerText =
    '감정: ' + (localStorage.getItem(dateKey+'_emotion') || '없음');

  document.getElementById('detailDiary').innerText =
    '일기: ' + (localStorage.getItem(dateKey+'_diary') || '없음');

  const todos = JSON.parse(localStorage.getItem(dateKey+'_todos') || '[]');
  const ul = document.getElementById('detailTodos');
  ul.innerHTML = '';

  if(todos.length === 0){
    ul.innerHTML = '<li>없음</li>';
  }else{
    todos.forEach(t=>{
      const li = document.createElement('li');
      li.textContent = `${t.text} [${t.checked?'완료':'미완료'}]`;
      ul.appendChild(li);
    });
  }
}

function closeDetail(){
  document.getElementById('detailModal').style.display = 'none';
}

/* =====================
   달 이동
===================== */
function prevMonth(){
  currentDate.setMonth(currentDate.getMonth()-1);
  renderCalendar();
}
function nextMonth(){
  currentDate.setMonth(currentDate.getMonth()+1);
  renderCalendar();
}
function prevEmotionMonth(){
  emotionCalendarDate.setMonth(emotionCalendarDate.getMonth()-1);
  renderEmotionCalendar();
}
function nextEmotionMonth(){
  emotionCalendarDate.setMonth(emotionCalendarDate.getMonth()+1);
  renderEmotionCalendar();
}

/* =====================
   초기 실행
===================== */
renderCalendar();
