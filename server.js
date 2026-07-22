const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// In-memory store untuk simulasi database transaksi
const transactions = new Map();

/**
 * Fungsi pembantu untuk evaluasi matematika yang aman tanpa eval() standar
 */
function safeEvaluate(expression) {
  // Membersihkan karakter yang tidak valid (hanya mengizinkan angka, operator +, -, *, /, desimal, kurung, dan spasi)
  const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
  if (!sanitized || sanitized.trim() === '') {
    throw new Error('Ekspresi matematika tidak valid');
  }

  // Menggunakan Function constructor yang terisolasi untuk evaluasi ekspresi bersih
  try {
    const func = new Function(`"use strict"; return (${sanitized});`);
    const val = func();
    if (typeof val !== 'number' || !isFinite(val)) {
      throw new Error('Hasil bukan angka terdefinisi (misal: pembagian dengan nol)');
    }
    // Pembulatan presisi desimal jika perlu
    return Math.round(val * 1e10) / 1e10;
  } catch (err) {
    throw new Error('Gagal menghitung ekspresi matematika');
  }
}

/**
 * Endpoint 1: Buat Transaksi Pembayaran saat user menekan "="
 */
app.post('/api/create-payment', (req, res) => {
  try {
    const { expression } = req.body;
    if (!expression || typeof expression !== 'string') {
      return res.status(400).json({ success: false, message: 'Ekspresi hitung diperlukan' });
    }

    // Validasi ekspresi terlebih dahulu
    try {
      safeEvaluate(expression);
    } catch (evalErr) {
      return res.status(400).json({ success: false, message: evalErr.message });
    }

    // Buat ID transaksi acak yang unik
    const transactionId = 'TRX-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    
    const transactionData = {
      transactionId,
      expression,
      amount: 1000,
      currency: 'IDR',
      status: 'PENDING', // PENDING, PAID, CANCELLED
      createdAt: new Date().toISOString()
    };

    transactions.set(transactionId, transactionData);

    res.json({
      success: true,
      transactionId,
      amount: 1000,
      currency: 'IDR',
      expression,
      message: 'Matematika itu mahal! Bayar Rp1.000 untuk melihat jawabannya.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
});

/**
 * Endpoint 2: Proses / Simulasi Pembayaran
 */
app.post('/api/process-payment', (req, res) => {
  try {
    const { transactionId } = req.body;
    if (!transactionId || !transactions.has(transactionId)) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
    }

    const transaction = transactions.get(transactionId);
    
    if (transaction.status === 'PAID') {
      return res.json({
        success: true,
        message: 'Transaksi sudah dibayar sebelumnya',
        result: transaction.result,
        status: 'PAID'
      });
    }

    // Hitung jawaban akhir secara presisi
    const calculatedResult = safeEvaluate(transaction.expression);
    
    // Update status transaksi
    transaction.status = 'PAID';
    transaction.result = calculatedResult;
    transaction.paidAt = new Date().toISOString();

    transactions.set(transactionId, transaction);

    res.json({
      success: true,
      transactionId,
      status: 'PAID',
      amount: transaction.amount,
      expression: transaction.expression,
      result: calculatedResult,
      message: 'Pembayaran berhasil! Jawaban telah dibuka.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Gagal memproses pembayaran' });
  }
});

/**
 * Endpoint 3: Cek Status Transaksi
 */
app.get('/api/payment-status/:id', (req, res) => {
  const transactionId = req.params.id;
  if (!transactions.has(transactionId)) {
    return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
  }
  const trx = transactions.get(transactionId);
  res.json({
    success: true,
    transactionId: trx.transactionId,
    status: trx.status,
    amount: trx.amount
  });
});

// Fallback route ke index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Jalankan Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Server Kalkulator Paywall Berjalan!`);
  console.log(`🌐 Akses Aplikasi: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
