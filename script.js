
      /* ------------------------------------------------
          1. Utility Functions
      ------------------------------------------------ */
      function clickSound() {
        const s = document.getElementById("clickSound");
        if (s) s.play().catch(() => {});
      }

      function speak(text) {
        if (!("speechSynthesis" in window)) return;
        if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1;
        window.speechSynthesis.speak(utter);
      }

      /* ------------------------------------------------
          2. Grading Logic
      ------------------------------------------------ */
      function getGradeAndGP(marks) {
        if (marks >= 95) return ["A+", 4.00];
        if (marks >= 86) return ["A", 4.00];
        if (marks >= 80) return ["A-", 3.70];
        if (marks >= 76) return ["B+", 3.30];
        if (marks >= 72) return ["B", 3.00];
        if (marks >= 68) return ["B-", 2.70];
        if (marks >= 64) return ["C+", 2.30];
        if (marks >= 60) return ["C", 2.00];
        if (marks >= 57) return ["C-", 1.70];
        if (marks >= 54) return ["D+", 1.30];
        if (marks >= 50) return ["D", 1.00];
        return ["F", 0.00];
      }

      /* ------------------------------------------------
          3. Main Calculation Logic
      ------------------------------------------------ */
      function calculateResults() {
        clickSound();
        const name = document.getElementById("studentName").value.trim();
        if (!name) {
          // Subtle shake animation if name is missing
          const ns = document.querySelector('.name-section input');
          ns.style.borderColor = '#ff4b1f';
          setTimeout(() => ns.style.borderColor = '', 1000);
          return;
        }

        const rows = document.querySelectorAll("#gradesTable tbody tr");
        let currentSemPoints = 0;
        let currentSemCredits = 0;

        rows.forEach(row => {
          const marksInput = row.querySelector(".marks");
          const credInput = row.querySelector(".credits");
          const gradeCell = row.querySelector(".grade");
          const gpCell = row.querySelector(".gp");

          const marks = parseFloat(marksInput.value);
          const credits = parseFloat(credInput.value);

          if (!isNaN(marks) && !isNaN(credits)) {
            const [grade, gp] = getGradeAndGP(marks);
            gradeCell.textContent = grade;
            gpCell.textContent = gp.toFixed(2);
            
            // Color code grades
            gradeCell.style.color = gp >= 3.0 ? '#00f260' : (gp >= 2.0 ? '#fbc2eb' : '#ff4b1f');

            currentSemPoints += (gp * credits);
            currentSemCredits += credits;
          } else {
            gradeCell.textContent = "-";
            gpCell.textContent = "-";
            gradeCell.style.color = '';
          }
        });

        const sgpa = currentSemCredits > 0 ? (currentSemPoints / currentSemCredits).toFixed(2) : "0.00";

        const prevCGPA = parseFloat(document.getElementById("prevCGPA").value) || 0;
        const prevCredits = parseFloat(document.getElementById("prevCredits").value) || 0;

        let cgpa = "0.00";
        const totalPoints = (prevCGPA * prevCredits) + currentSemPoints;
        const totalCredits = prevCredits + currentSemCredits;

        if (totalCredits > 0) {
          cgpa = (totalPoints / totalCredits).toFixed(2);
        }

        // Update UI
        const displayValue = totalCredits > 0 ? cgpa : sgpa;
        const label = totalCredits > currentSemCredits ? "CGPA" : "SGPA";
        
        document.getElementById("progressValue").textContent = displayValue;
        document.getElementById("progressLabel").textContent = label;
        animateProgress(parseFloat(displayValue));

        const resultText = document.getElementById("result");
        const sgpaText = document.getElementById("sgpaDisplay");
        const remarkText = document.getElementById("remark");

        resultText.innerHTML = `Hi ${name}, Result Calculated!`;
        
        let breakdown = `SGPA: <span style="color:#4facfe">${sgpa}</span>`;
        if (prevCredits > 0 || prevCGPA > 0) {
            breakdown += ` &nbsp;|&nbsp; CGPA: <span style="color:#00f260">${cgpa}</span>`;
        }
        sgpaText.innerHTML = breakdown;

        const val = parseFloat(displayValue);
        let msg = "";
        if (val >= 3.5) msg = "Outstanding Performance! 🌟";
        else if (val >= 3.0) msg = "Great Job! Keep it up. 🚀";
        else if (val >= 2.0) msg = "Good, but aim higher! 💪";
        else msg = "You need to work harder. 📚";
        
        remarkText.textContent = msg;
        speak(`${name}, your SGPA is ${sgpa}. ${msg}`);
      }

      function animateProgress(value) {
        const circle = document.getElementById("progressCircle");
        const degree = (value / 4) * 360; 
        
        // Dynamic gradient based on score
        let color = '#ff4b1f'; // Red for low
        if(value >= 2.0) color = '#fbc2eb'; // Pink/Purple for mid
        if(value >= 3.0) color = '#00f260'; // Green for high
        if(value >= 3.7) color = '#4facfe'; // Blue for Top

        circle.style.background = `conic-gradient(${color} ${degree}deg, rgba(255,255,255,0.1) ${degree}deg)`;
        circle.style.boxShadow = `0 0 30px ${color}66`; // 66 = 40% opacity
      }

      /* ------------------------------------------------
          4. Add/Remove Subjects
      ------------------------------------------------ */
      function addSubject() {
        const tbody = document.querySelector("#gradesTable tbody");
        const count = tbody.rows.length + 1;
        const newRow = tbody.insertRow(-1);
        newRow.innerHTML = `
          <td><input type="text" class="subject" placeholder="Subject ${count}" /></td>
          <td><input type="number" min="0" max="100" class="marks" placeholder="0-100" /></td>
          <td><input type="number" min="1" max="5" class="credits" placeholder="1-5" /></td>
          <td class="grade">-</td>
          <td class="gp">-</td>`;
        clickSound();
      }

      function removeSubject() {
        const tbody = document.querySelector("#gradesTable tbody");
        if (tbody.rows.length > 1) {
          tbody.deleteRow(-1);
        } else {
           // Reset first row if it's the only one
           const inputs = tbody.rows[0].querySelectorAll('input');
           inputs.forEach(i => i.value = '');
           tbody.rows[0].querySelector('.grade').textContent = '-';
           tbody.rows[0].querySelector('.gp').textContent = '-';
        }
        clickSound();
      }

      /* ------------------------------------------------
          5. Toggles
      ------------------------------------------------ */
      function toggleGradingScale() {
        const el = document.getElementById("gradingScale");
        const btn = document.getElementById("scaleBtn");
        const isHidden = el.classList.contains("hidden");
        if(isHidden) {
          el.classList.remove("hidden");
          btn.textContent = "Hide Scale";
        } else {
          el.classList.add("hidden");
          btn.textContent = "Grading Scale";
        }
        clickSound();
      }

      function toggleConverter() {
        const modal = document.getElementById("converterModal");
        modal.style.display = modal.style.display === "flex" ? "none" : "flex";
        clickSound();
      }
      
      // Converter
      document.getElementById('convGrade').addEventListener('input', function() {
          const map = { "A+": "95-100", "A": "86-94", "A-": "80-85", "B+": "76-79", "B": "72-75", "B-": "68-71", "C+": "64-67", "C": "60-63", "D": "50-56", "F": "<50" };
          const g = this.value.toUpperCase();
          document.getElementById('convMarks').value = ''; 
          document.getElementById('convResult').textContent = map[g] ? `Range: ${map[g]}` : "";
      });

      document.getElementById('convMarks').addEventListener('input', function() {
          const m = parseFloat(this.value);
          document.getElementById('convGrade').value = '';
          if(!isNaN(m)) {
             const [g, gp] = getGradeAndGP(m);
             document.getElementById('convResult').textContent = `Grade: ${g} (${gp})`;
          }
      });

      /* ------------------------------------------------
          6. Background Animation (Extracted from 2nd code)
      ------------------------------------------------ */
      const canvas = document.getElementById("bgCanvas");
      const ctx = canvas.getContext?.("2d");
      let width = 0, height = 0;
      let rafId = null;
      let currentBgType = "particles";
      let particles = [];

      function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        if (canvas) {
          canvas.width = width;
          canvas.height = height;
        }
      }

      window.addEventListener("resize", () => {
        resizeCanvas();
        initBackground(currentBgType);
      });

      function initBackground(type) {
        if (!ctx) return;
        currentBgType = type || "particles";
        particles = [];
        resizeCanvas();
        for (let i = 0; i < 60; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 4 + 2,
            dx: (Math.random() - 0.5) * 4, // FASTER (was 1.2)
            dy: (Math.random() - 0.5) * 4, // FASTER (was 1.2)
            hue: Math.random() * 360
          });
        }
        if (rafId) cancelAnimationFrame(rafId);
        loop();
      }

      function drawParticles() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
          grad.addColorStop(0, `hsla(${p.hue},80%,60%,0.8)`);
          grad.addColorStop(1, "transparent");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
          ctx.fill();
          p.x += p.dx; p.y += p.dy;
          if (p.x < -50) p.x = width + 50;
          if (p.x > width + 50) p.x = -50;
          if (p.y < -50) p.y = height + 50;
          if (p.y > height + 50) p.y = -50;
        });
      }

      function loop() {
        if (!ctx) return;
        drawParticles();
        rafId = requestAnimationFrame(loop);
      }

      resizeCanvas();
      initBackground("particles");

      /* ------------------------------------------------
          7. Theme Toggle
      ------------------------------------------------ */
      function toggleMode() {
        document.body.classList.toggle("light");
      }
  
