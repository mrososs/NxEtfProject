import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-500',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-page">
      <div class="error-container">
        <div class="error-icon">🚫</div>
        <h1 class="error-title">خطأ في المصادقة</h1>
        <p class="error-message">
          يجب التسجيل أولاً في
          <a
            href="http://etf.itechpro-eg.com/"
            class="union-link"
            target="_blank"
            >صفحة الاتحاد الرسمية</a
          >
          للذهاب إلى موقع الكورسات
        </p>
        <a
          href="http://etf.itechpro-eg.com/"
          class="auth-button"
          target="_blank"
        >
          الذهاب إلى صفحة الاتحاد الرسمية
        </a>
      </div>
    </div>
  `,
  styles: [
    `
      .error-page {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        color: #333;
      }

      .error-container {
        background: white;
        border-radius: 20px;
        padding: 40px;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        max-width: 500px;
        width: 90%;
      }

      .error-icon {
        font-size: 80px;
        color: #e74c3c;
        margin-bottom: 20px;
      }

      .error-title {
        font-size: 28px;
        color: #2c3e50;
        margin-bottom: 15px;
        font-weight: bold;
      }

      .error-message {
        font-size: 18px;
        color: #7f8c8d;
        margin-bottom: 30px;
        line-height: 1.6;
      }

      .auth-button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 25px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-block;
      }

      .auth-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
      }

      .union-link {
        color: #3498db;
        text-decoration: none;
        font-weight: bold;
      }

      .union-link:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class Error500Component {
  constructor() {}
}
