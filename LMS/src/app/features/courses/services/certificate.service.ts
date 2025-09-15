import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface CertificateData {
  userName: string;
  courseName: string;
  completionDate: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class CertificateService {
  constructor() {}

  /**
   * Generate and download certificate PDF
   * @param data Certificate data
   */
  async generateCertificate(data: CertificateData): Promise<void> {
    try {
      // Create a temporary div element for the certificate
      const certificateElement = this.createCertificateElement(data);
      document.body.appendChild(certificateElement);

      // Convert to canvas
      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      // Remove temporary element
      document.body.removeChild(certificateElement);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');

      // Calculate dimensions to fit the page
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = (pdfHeight - imgHeight * ratio) / 2;

      pdf.addImage(
        imgData,
        'PNG',
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );

      // Download the PDF
      pdf.save(
        `شهادة_إتمام_${data.courseName.replace(
          /\s+/g,
          '_'
        )}_${data.userName.replace(/\s+/g, '_')}.pdf`
      );
    } catch (error) {
      console.error('Error generating certificate:', error);
      throw new Error('فشل في إنشاء الشهادة');
    }
  }

  /**
   * Create certificate HTML element
   * @param data Certificate data
   * @returns HTML element
   */
  private createCertificateElement(data: CertificateData): HTMLElement {
    const certificateDiv = document.createElement('div');
    certificateDiv.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 1200px;
      height: 800px;
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
      font-family: 'Arial', sans-serif;
      direction: rtl;
      text-align: center;
      padding: 60px;
      box-sizing: border-box;
      border: 8px solid #f7931d;
      border-radius: 20px;
    `;

    certificateDiv.innerHTML = `
      <!-- Header -->
      <div style="margin-bottom: 40px;">
        <img src="assets/img/logo.png" alt="Logo" style="height: 80px; margin-bottom: 20px;">
        <h1 style="color: #2c3e50; font-size: 36px; font-weight: bold; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">
          شهادة إتمام الدورة
        </h1>
        <div style="width: 200px; height: 4px; background: linear-gradient(90deg, #f7931d, #ff6b35); margin: 20px auto; border-radius: 2px;"></div>
      </div>

      <!-- Main Content -->
      <div style="margin: 60px 0;">
        <p style="font-size: 24px; color: #34495e; margin: 20px 0; line-height: 1.6;">
          هذه الشهادة تثبت أن
        </p>
        <h2 style="color: #f7931d; font-size: 32px; font-weight: bold; margin: 30px 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">
          ${data.userName}
        </h2>
        <p style="font-size: 24px; color: #34495e; margin: 20px 0; line-height: 1.6;">
          قد أتم بنجاح دورة
        </p>
        <h3 style="color: #2c3e50; font-size: 28px; font-weight: bold; margin: 30px 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">
          ${data.courseName}
        </h3>
        <p style="font-size: 20px; color: #7f8c8d; margin: 30px 0; line-height: 1.6; font-style: italic;">
          ${data.message}
        </p>
      </div>

      <!-- Footer -->
      <div style="margin-top: 60px; display: flex; justify-content: space-between; align-items: center;">
        <div style="text-align: center;">
          <p style="font-size: 18px; color: #7f8c8d; margin: 0;">التاريخ</p>
          <p style="font-size: 20px; color: #2c3e50; font-weight: bold; margin: 5px 0 0 0;">${
            data.completionDate
          }</p>
        </div>
        <div style="text-align: center;">
          <p style="font-size: 18px; color: #7f8c8d; margin: 0;">شهادة رقم</p>
          <p style="font-size: 20px; color: #2c3e50; font-weight: bold; margin: 5px 0 0 0;">${this.generateCertificateNumber()}</p>
        </div>
      </div>

      <!-- Decorative Elements -->
      <div style="position: absolute; top: 40px; left: 40px; width: 60px; height: 60px; border: 3px solid #f7931d; border-radius: 50%; opacity: 0.3;"></div>
      <div style="position: absolute; top: 40px; right: 40px; width: 60px; height: 60px; border: 3px solid #f7931d; border-radius: 50%; opacity: 0.3;"></div>
      <div style="position: absolute; bottom: 40px; left: 40px; width: 60px; height: 60px; border: 3px solid #f7931d; border-radius: 50%; opacity: 0.3;"></div>
      <div style="position: absolute; bottom: 40px; right: 40px; width: 60px; height: 60px; border: 3px solid #f7931d; border-radius: 50%; opacity: 0.3;"></div>
    `;

    return certificateDiv;
  }

  /**
   * Generate unique certificate number
   * @returns Certificate number
   */
  private generateCertificateNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CERT-${timestamp.slice(-6)}-${random}`;
  }

  /**
   * Get current date in Arabic format
   * @returns Formatted date string
   */
  getCurrentDateInArabic(): string {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: 'gregory',
    };

    const dateStr = now.toLocaleDateString('ar-SA', options);
    return dateStr;
  }
}

