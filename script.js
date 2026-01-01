
        (function() {
            /* ====== Logic ====== */
            const GRADE_MAP = { 'A+':4.0, 'A':4.0, 'A-':3.7, 'B+':3.3, 'B':3.0, 'B-':2.7, 'C+':2.3, 'C':2.0, 'C-':1.7, 'D+':1.3, 'D':1.0, 'F':0.0 };
            const GRADE_RANGES = { 'A+':"95-100", 'A':"86-94", 'A-':"80-85", 'B+':"76-79", 'B':"72-75", 'B-':"68-71", 'C+':"64-67", 'C':"60-63", 'D+':"54-56", 'D':"50-53", 'F':"<50" };

            function getStatsFromMarks(marks) {
                if (marks >= 95) return { grade: 'A+', gp: 4.0 };
                if (marks >= 86) return { grade: 'A', gp: 4.0 };
                if (marks >= 80) return { grade: 'A-', gp: 3.7 };
                if (marks >= 76) return { grade: 'B+', gp: 3.3 };
                if (marks >= 72) return { grade: 'B', gp: 3.0 };
                if (marks >= 68) return { grade: 'B-', gp: 2.7 };
                if (marks >= 64) return { grade: 'C+', gp: 2.3 };
                if (marks >= 60) return { grade: 'C', gp: 2.0 };
                if (marks >= 57) return { grade: 'C-', gp: 1.7 };
                if (marks >= 54) return { grade: 'D+', gp: 1.3 };
                if (marks >= 50) return { grade: 'D', gp: 1.0 };
                return { grade: 'F', gp: 0.0 };
            }

            window.initTable = function() {
                const tbody = document.querySelector("#gradesTable tbody");
                tbody.innerHTML = '';
                for(let i=0; i<1; i++) window.addRow();
            }

            window.addRow = function() {
                const tbody = document.querySelector("#gradesTable tbody");
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><input type="text" class="subject-input" placeholder="Subject"></td>
                    <td><span class="card-label">Marks</span><input type="number" class="marks-input" placeholder="0-100" min="0" max="100" oninput="window.handleInput(this, 'marks')"></td>
                    <td><span class="card-label">Grade</span><input type="text" class="grade-input" placeholder="Grd" oninput="window.handleInput(this, 'grade')"></td>
                    <td><span class="card-label">Credit</span><input type="number" class="credits-input" placeholder="Cr" min="1" max="6"></td>
                    <td><span class="gp-display">-</span></td>
                    <td style="text-align:center; cursor:pointer; color:var(--danger-color); font-weight:bold; font-size:1.2rem;" onclick="window.removeRow(this)">×</td>
                `;
                tbody.appendChild(tr);
            }

            window.removeRow = function(btn) {
                const row = btn.parentNode;
                if(document.querySelectorAll("#gradesTable tbody tr").length > 1) row.remove();
                else { row.querySelectorAll('input').forEach(i => i.value = ''); row.querySelector('.gp-display').textContent = '-'; }
            }

            window.handleInput = function(input, type) {
                const row = input.closest('tr');
                const marksInput = row.querySelector('.marks-input');
                const gradeInput = row.querySelector('.grade-input');
                const gpDisplay = row.querySelector('.gp-display');

                if (type === 'marks') {
                    const m = parseFloat(marksInput.value);
                    if (!isNaN(m)) {
                        const stats = getStatsFromMarks(m);
                        gradeInput.value = stats.grade;
                        gpDisplay.textContent = stats.gp.toFixed(2);
                        gpDisplay.style.color = stats.gp >= 3 ? 'var(--success-color)' : (stats.gp < 2 ? 'var(--danger-color)' : 'rgba(255,255,255,0.8)');
                    } else {
                        gradeInput.value = ''; gpDisplay.textContent = '-';
                    }
                } else if (type === 'grade') {
                    const g = gradeInput.value.toUpperCase().trim();
                    if (GRADE_MAP.hasOwnProperty(g)) {
                        const gp = GRADE_MAP[g];
                        marksInput.value = ''; 
                        gpDisplay.textContent = gp.toFixed(2);
                        gpDisplay.style.color = gp >= 3 ? 'var(--success-color)' : (gp < 2 ? 'var(--danger-color)' : 'rgba(255,255,255,0.8)');
                    } else {
                        gpDisplay.textContent = '-';
                    }
                }
            }

            window.calculateResult = function() {
                const rows = document.querySelectorAll("#gradesTable tbody tr");
                let totalPoints = 0, totalCredits = 0;

                rows.forEach(row => {
                    const credits = parseFloat(row.querySelector(".credits-input").value);
                    const gp = parseFloat(row.querySelector(".gp-display").textContent);
                    if (!isNaN(credits) && !isNaN(gp)) {
                        totalPoints += (gp * credits);
                        totalCredits += credits;
                    }
                });

                const sgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
                const prevCGPA = parseFloat(document.getElementById("prevCGPA").value) || 0;
                const prevCr = parseFloat(document.getElementById("prevCredits").value) || 0;
                
                let finalGPA = sgpa, label = "SGPA";
                if (prevCr > 0) {
                    finalGPA = ((prevCGPA * prevCr + totalPoints) / (prevCr + totalCredits)).toFixed(2);
                    label = "CGPA";
                }
                updateUI(finalGPA, label, sgpa);
            }

            function animateValue(obj, start, end, duration) {
                let startTimestamp = null;
                const step = (timestamp) => {
                    if (!startTimestamp) startTimestamp = timestamp;
                    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                    obj.innerHTML = (progress * (end - start) + start).toFixed(2);
                    if (progress < 1) window.requestAnimationFrame(step);
                };
                window.requestAnimationFrame(step);
            }

            function updateUI(gpa, label, sgpa) {
                const displayVal = document.getElementById("displayGPA");
                const ring = document.getElementById("progressRing");
                const endVal = parseFloat(gpa);
                
                animateValue(displayVal, parseFloat(displayVal.textContent), endVal, 800);
                document.getElementById("displayLabel").textContent = label;

                const degree = (endVal / 4) * 360;
                let color = 'var(--danger-color)';
                if (endVal >= 2.0) color = 'var(--warning-color)';
                if (endVal >= 3.0) color = 'var(--success-color)';
                if (endVal >= 3.5) color = 'var(--primary-color)';

                ring.style.background = `conic-gradient(${color} ${degree}deg, rgba(255,255,255,0.05) ${degree}deg)`;
                ring.style.boxShadow = `0 0 40px ${color}60, inset 0 0 20px rgba(0,0,0,0.5)`;
                ring.style.transform = 'scale(1.05)';
                setTimeout(() => ring.style.transform = 'scale(1)', 200);

                if (endVal >= 3.5) window.fireConfetti();

                const remark = document.getElementById("remarkText");
                let msg = endVal >= 3.5 ? "Outstanding! 🚀" : (endVal >= 3.0 ? "Great Job! 🌟" : (endVal >= 2.0 ? "Good Effort! 💪" : "Keep Trying! 📚"));
                remark.textContent = msg;
                remark.style.color = color;
                remark.classList.add("show");
                
                document.getElementById("breakdownText").innerHTML = label === "CGPA" ? `SGPA: ${sgpa}` : "";
            }

            window.resetForm = function() {
                document.querySelectorAll('input').forEach(i => i.value = '');
                document.querySelectorAll('.gp-display').forEach(s => { s.textContent = '-'; s.style.color = 'rgba(255,255,255,0.7)'; });
                document.getElementById("progressRing").style.background = `conic-gradient(rgba(255,255,255,0.05) 0deg, rgba(255,255,255,0.05) 0deg)`;
                document.getElementById("displayGPA").textContent = "0.00";
                document.getElementById("remarkText").classList.remove("show");
                document.getElementById("breakdownText").textContent = "";
            }

            window.toggleModal = function(id) {
                const m = document.getElementById(id);
                if(m.classList.contains('active')) { m.classList.remove('active'); setTimeout(()=>m.style.display='none',200); }
                else { m.style.display='flex'; setTimeout(()=>m.classList.add('active'),10); }
            }
            window.onclick = e => { if(e.target.classList.contains('modal')) window.toggleModal(e.target.id); };

            document.getElementById('convGrade').addEventListener('input', function() {
                const g = this.value.toUpperCase().trim();
                document.getElementById('convMarks').value = '';
                document.getElementById('convResult').textContent = GRADE_RANGES[g] ? `Range: ${GRADE_RANGES[g]}` : '';
            });
            document.getElementById('convMarks').addEventListener('input', function() {
                const m = parseFloat(this.value);
                document.getElementById('convGrade').value = '';
                if (!isNaN(m)) {
                    const s = getStatsFromMarks(m);
                    document.getElementById('convResult').textContent = `Grade: ${s.grade} | GP: ${s.gp}`;
                } else document.getElementById('convResult').textContent = '';
            });

            /* Visuals */
            const bgCanvas = document.getElementById("bgCanvas");
            const cfCanvas = document.getElementById("confettiCanvas");
            const bgCtx = bgCanvas.getContext("2d");
            const cfCtx = cfCanvas.getContext("2d");
            let w, h, particles = [], confetti = [];

            // Mouse Interaction Logic
            let mouse = { x: null, y: null };
            window.addEventListener('mousemove', (e) => { 
                mouse.x = e.clientX; 
                mouse.y = e.clientY; 
            });
            window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

            function resize() { w = window.innerWidth; h = window.innerHeight; bgCanvas.width = cfCanvas.width = w; bgCanvas.height = cfCanvas.height = h; }
            class P {
                constructor() { this.x=Math.random()*w; this.y=Math.random()*h; this.vx=(Math.random()-0.5)*2; this.vy=(Math.random()-0.5)*2; this.s=Math.random()*2+1; }
                up() { this.x+=this.vx; this.y+=this.vy; if(this.x<0||this.x>w)this.vx*=-1; if(this.y<0||this.y>h)this.vy*=-1; }
                draw() { bgCtx.beginPath(); bgCtx.arc(this.x,this.y,this.s,0,Math.PI*2); bgCtx.fillStyle="rgba(76,201,240,0.5)"; bgCtx.fill(); }
            }
            function initP() { particles=[]; for(let i=0;i<80;i++) particles.push(new P()); }
            
            window.fireConfetti = function() {
                confetti=[]; for(let i=0;i<100;i++) confetti.push({x:w/2,y:h/2+100,vx:(Math.random()-0.5)*20,vy:Math.random()*-20,c:`hsl(${Math.random()*360},100%,60%)`});
            }
            function drawConf() {
                cfCtx.clearRect(0,0,w,h);
                for(let i=confetti.length-1;i>=0;i--){
                    let p=confetti[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=0.5;
                    cfCtx.fillStyle=p.c; cfCtx.fillRect(p.x,p.y,6,6);
                    if(p.y>h) confetti.splice(i,1);
                }
            }

            function anim() {
                bgCtx.clearRect(0,0,w,h);
                particles.forEach((p,i) => {
                    p.up(); p.draw();
                    
                    // Particle connections
                    for(let j=i;j<particles.length;j++){
                        let dx=p.x-particles[j].x, dy=p.y-particles[j].y, d=Math.sqrt(dx*dx+dy*dy);
                        if(d<100){ bgCtx.beginPath(); bgCtx.strokeStyle=`rgba(76,201,240,${1-d/100})`; bgCtx.moveTo(p.x,p.y); bgCtx.lineTo(particles[j].x,particles[j].y); bgCtx.stroke(); }
                    }

                    // Mouse Interaction
                    if (mouse.x != null) {
                        let dx = p.x - mouse.x;
                        let dy = p.y - mouse.y;
                        let d = Math.sqrt(dx*dx + dy*dy);
                        if (d < 150) {
                            bgCtx.beginPath();
                            bgCtx.strokeStyle = `rgba(247, 37, 133, ${1 - d/150})`;
                            bgCtx.lineWidth = 0.8;
                            bgCtx.moveTo(p.x, p.y);
                            bgCtx.lineTo(mouse.x, mouse.y);
                            bgCtx.stroke();
                        }
                    }
                });
                if(confetti.length) drawConf();
                requestAnimationFrame(anim);
            }
            window.onresize=()=>{resize();initP();}; resize(); initP(); anim(); window.initTable();
        })();
