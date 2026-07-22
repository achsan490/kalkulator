/**
 * PAYCALC V1.0 - LOGIKA KALKULATOR WINDOWS 95 RETRO EDITION
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Calculator Display & Controls
  const displayExpression = document.getElementById('displayExpression');
  const displayMain = document.getElementById('displayMain');
  const lockStatus = document.getElementById('lockStatus');
  const paywallBanner = document.getElementById('paywallBanner');
  const btnEquals = document.getElementById('btnEquals');
  const btnClear = document.getElementById('btnClear');
  const btnBackspace = document.getElementById('btnBackspace');
  const btnSoundToggle = document.getElementById('btnSoundToggle');
  const soundIcon = document.getElementById('soundIcon');
  const soundText = document.getElementById('soundText');
  const win95Clock = document.getElementById('win95Clock');

  // DOM Elements - Paywall Modal Dialog
  const paywallModal = document.getElementById('paywallModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalExpression = document.getElementById('modalExpression');
  const btnSimulatePay = document.getElementById('btnSimulatePay');
  const btnCancelPay = document.getElementById('btnCancelPay');
  const paymentStatusBox = document.getElementById('paymentStatusBox');
  const paymentSpinner = document.getElementById('paymentSpinner');
  const paymentSuccessBox = document.getElementById('paymentSuccessBox');
  const modalFooter = document.getElementById('modalFooter');

  // Calculator State
  let currentExpression = '';
  let pendingTransactionId = null;
  let isAnswerUnlocked = false;
  let isSoundEnabled = true;

  // Real-time Windows 95 Taskbar Clock
  function updateWin95Clock() {
    if (!win95Clock) return;
    const now = new Date();
    win95Clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  updateWin95Clock();
  setInterval(updateWin95Clock, 1000);

  // Web Audio API Synthesizer Context for 8-Bit PC Speaker Sound Effects
  let audioCtx = null;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  /**
   * Sound FX: 8-Bit PC Speaker Bleeps & Windows Chimes
   */
  function playRetroSound(type = 'click') {
    if (!isSoundEnabled) return;
    try {
      initAudioContext();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'click') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'clear') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(200, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'equals') {
        // Windows alert chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.setValueAtTime(880, now + 0.06); // A5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'success') {
        // Win95 Ta-da / Success chime
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const oscSeq = audioCtx.createOscillator();
          const gainSeq = audioCtx.createGain();
          oscSeq.connect(gainSeq);
          gainSeq.connect(audioCtx.destination);

          const startTime = now + (idx * 0.07);
          oscSeq.type = 'triangle';
          oscSeq.frequency.setValueAtTime(freq, startTime);
          gainSeq.gain.setValueAtTime(0.12, startTime);
          gainSeq.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
          oscSeq.start(startTime);
          oscSeq.stop(startTime + 0.1);
        });
      }
    } catch (e) {
      // Audio fallback
    }
  }

  // Sound SFX Toggle
  btnSoundToggle.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    if (isSoundEnabled) {
      soundIcon.className = 'fa-solid fa-volume-high';
      soundText.textContent = 'SFX';
      playRetroSound('click');
    } else {
      soundIcon.className = 'fa-solid fa-volume-xmark';
      soundText.textContent = 'MUTED';
    }
  });

  /**
   * Format Display Expression
   */
  function formatExpressionForDisplay(expr) {
    if (!expr) return '0';
    return expr
      .replace(/\*/g, ' × ')
      .replace(/\//g, ' ÷ ')
      .replace(/\+/g, ' + ')
      .replace(/\-/g, ' - ');
  }

  /**
   * Update Display
   */
  function updateDisplay() {
    if (isAnswerUnlocked) {
      lockStatus.className = 'status-tag';
      lockStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> UNLOCKED';
      paywallBanner.classList.add('hidden');
    } else {
      lockStatus.className = 'status-tag';
      lockStatus.innerHTML = '<i class="fa-solid fa-shield"></i> READY';
    }

    displayMain.textContent = currentExpression ? formatExpressionForDisplay(currentExpression) : '0';
  }

  /**
   * Handle Input
   */
  function handleInput(char) {
    playRetroSound('click');

    if (isAnswerUnlocked) {
      if (['+', '-', '*', '/'].includes(char)) {
        isAnswerUnlocked = false;
      } else {
        currentExpression = '';
        isAnswerUnlocked = false;
      }
    }

    paywallBanner.classList.add('hidden');

    const lastChar = currentExpression.slice(-1);
    const isOperator = ['+', '-', '*', '/'].includes(char);
    const isLastOperator = ['+', '-', '*', '/'].includes(lastChar);

    if (isOperator && isLastOperator) {
      currentExpression = currentExpression.slice(0, -1) + char;
      updateDisplay();
      return;
    }

    if (isOperator && !currentExpression && char !== '-') return;

    if (char === '.') {
      const parts = currentExpression.split(/[\+\-\*\/]/);
      const currentNum = parts[parts.length - 1];
      if (currentNum.includes('.')) return;
    }

    currentExpression += char;
    updateDisplay();
  }

  /**
   * Clear Calculator
   */
  function clearCalculator() {
    playRetroSound('clear');
    currentExpression = '';
    pendingTransactionId = null;
    isAnswerUnlocked = false;
    displayExpression.textContent = '0';
    displayMain.textContent = '0';
    paywallBanner.classList.add('hidden');
    lockStatus.innerHTML = '<i class="fa-solid fa-shield"></i> READY';
  }

  /**
   * Backspace
   */
  function backspace() {
    playRetroSound('click');
    if (isAnswerUnlocked) {
      clearCalculator();
      return;
    }
    currentExpression = currentExpression.slice(0, -1);
    updateDisplay();
  }

  /**
   * TRIGGER PAYWALL MODAL PROMPT ON "=" PRESS
   */
  async function triggerPaywall() {
    if (!currentExpression || currentExpression.trim() === '') return;

    playRetroSound('equals');

    if (['+', '-', '*', '/'].includes(currentExpression.slice(-1))) {
      currentExpression = currentExpression.slice(0, -1);
    }

    try {
      btnEquals.disabled = true;

      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression: currentExpression })
      });

      const data = await response.json();
      btnEquals.disabled = false;

      if (!data.success) {
        alert(data.message || 'Ekspresi matematika tidak valid!');
        return;
      }

      pendingTransactionId = data.transactionId;
      modalExpression.textContent = formatExpressionForDisplay(data.expression);

      openModal();

      paywallBanner.classList.remove('hidden');
      lockStatus.innerHTML = '<i class="fa-solid fa-lock"></i> PAYMENT REQ';

    } catch (error) {
      btnEquals.disabled = false;
      console.error('Server error:', error);
      alert('Gagal terhubung dengan server Express.js.');
    }
  }

  function openModal() {
    paymentStatusBox.classList.add('hidden');
    paymentSpinner.classList.remove('hidden');
    paymentSuccessBox.classList.add('hidden');
    modalFooter.classList.remove('hidden');

    paywallModal.classList.remove('hidden');
    paywallModal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    playRetroSound('click');
    paywallModal.classList.add('hidden');
    paywallModal.setAttribute('aria-hidden', 'true');
  }

  /**
   * PROCESS PAYMENT SIMULATION
   */
  async function processPaymentSimulation() {
    if (!pendingTransactionId) {
      alert('Transaksi tidak ditemukan!');
      closeModal();
      return;
    }

    playRetroSound('click');

    modalFooter.classList.add('hidden');
    paymentStatusBox.classList.remove('hidden');
    paymentSpinner.classList.remove('hidden');
    paymentSuccessBox.classList.add('hidden');

    try {
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: pendingTransactionId })
      });

      const data = await response.json();

      if (!data.success) {
        alert(data.message || 'Gagal memproses pembayaran!');
        modalFooter.classList.remove('hidden');
        paymentStatusBox.classList.add('hidden');
        return;
      }

      setTimeout(() => {
        paymentSpinner.classList.add('hidden');
        paymentSuccessBox.classList.remove('hidden');

        playRetroSound('success');

        setTimeout(() => {
          closeModal();

          displayExpression.textContent = formatExpressionForDisplay(data.expression) + ' =';
          currentExpression = String(data.result);
          isAnswerUnlocked = true;
          pendingTransactionId = null;

          updateDisplay();

        }, 1200);

      }, 800);

    } catch (err) {
      console.error('Payment error:', err);
      alert('Terjadi kesalahan jaringan.');
      modalFooter.classList.remove('hidden');
      paymentStatusBox.classList.add('hidden');
    }
  }

  /* ==========================================================================
     EVENT BINDINGS & KEYBOARD SUPPORT
     ========================================================================== */

  document.querySelectorAll('.btn-num').forEach(btn => {
    btn.addEventListener('click', () => handleInput(btn.dataset.num));
  });

  document.querySelectorAll('.btn-op').forEach(btn => {
    btn.addEventListener('click', () => handleInput(btn.dataset.op));
  });

  btnClear.addEventListener('click', clearCalculator);
  btnBackspace.addEventListener('click', backspace);
  btnEquals.addEventListener('click', triggerPaywall);

  btnSimulatePay.addEventListener('click', processPaymentSimulation);
  btnCancelPay.addEventListener('click', closeModal);
  modalCloseBtn.addEventListener('click', closeModal);

  paywallModal.addEventListener('click', (e) => {
    if (e.target === paywallModal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (!paywallModal.classList.contains('hidden')) {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'Enter') processPaymentSimulation();
      return;
    }

    if (e.key >= '0' && e.key <= '9') handleInput(e.key);
    if (e.key === '.' || e.key === ',') handleInput('.');
    if (e.key === '+') handleInput('+');
    if (e.key === '-') handleInput('-');
    if (e.key === '*') handleInput('*');
    if (e.key === '/') handleInput('/');
    if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      triggerPaywall();
    }
    if (e.key === 'Backspace') backspace();
    if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') clearCalculator();
  });

});
