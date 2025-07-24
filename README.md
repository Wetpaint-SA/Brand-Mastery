# 🧠 Brand Mastery Assessment – How It Works

Welcome to the **Brand Mastery Assessment (BMA)** — a streamlined, data-driven tool designed to evaluate your brand's marketing maturity and deliver a customized performance report in minutes.

This README explains how the assessment works under the hood, from data collection and scoring to real-time feedback and result generation.

---

## 📋 1. Capturing User Information

Upon arrival at the form, user details like **First Name**, **Last Name**, **Company**, and **Email** are captured via URL parameters:

```js
const urlParams = new URLSearchParams(window.location.search);
