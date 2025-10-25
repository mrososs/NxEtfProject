import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { AiAssistantService } from '../../services/ai-assistant.service';
import { Observable, Subject } from 'rxjs';

interface FAQItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ScrollPanelModule,
    OverlayPanelModule,
    AvatarModule,
    BadgeModule,
  ],
  template: `
    <div class="faq-container">
      <!-- FAQ Toggle Button -->
      <button
        class="faq-toggle-btn"
        (click)="toggleFaq()"
        [class.open]="isOpen$ | async"
        title="الأسئلة الشائعة"
      >
        <i
          class="pi pi-question-circle"
          *ngIf="(isOpen$ | async) === false"
        ></i>
        <i class="pi pi-times" *ngIf="isOpen$ | async"></i>
      </button>

      <!-- FAQ Window -->
      <div class="faq-window" [class.show]="isOpen$ | async">
        <!-- FAQ Header -->
        <div class="faq-header">
          <div class="header-content">
            <p-avatar
              icon="pi pi-question-circle"
              shape="circle"
              size="normal"
              styleClass="faq-avatar"
            >
            </p-avatar>
            <div class="header-text">
              <h4>الأسئلة الشائعة</h4>
              <span class="status">اختر سؤالاً للحصول على الإجابة</span>
            </div>
          </div>
          <button class="close-btn" (click)="closeFaq()" title="إغلاق">
            <i class="pi pi-minus"></i>
          </button>
        </div>

        <!-- FAQ Questions -->
        <div class="faq-questions">
          <div class="questions-list">
            <div
              *ngFor="let faq of faqList; let i = index"
              class="faq-item"
              [class.active]="selectedFaqIndex === i"
              (click)="selectFaq(i)"
              (keydown.enter)="selectFaq(i)"
              (keydown.space)="selectFaq(i)"
              tabindex="0"
            >
              <div class="faq-question">
                <i class="pi pi-question-circle"></i>
                <span>{{ faq.question }}</span>
                <i
                  class="pi pi-chevron-down expand-icon"
                  [class.rotated]="selectedFaqIndex === i"
                ></i>
              </div>

              <!-- FAQ Answer -->
              <div
                class="faq-answer"
                *ngIf="selectedFaqIndex === i"
                [innerHTML]="formatAnswer(faq.answer)"
              ></div>
            </div>
          </div>
        </div>

        <!-- Contact Info -->
        <div class="contact-info">
          <h5>لم تجد إجابة لسؤالك؟</h5>
          <p>تواصل معنا مباشرة:</p>
          <div class="contact-buttons">
            <a [href]="'tel:' + contactInfo.phone" class="contact-btn phone">
              <i class="pi pi-phone"></i>
              اتصل بنا
            </a>
            <a [href]="'mailto:' + contactInfo.email" class="contact-btn email">
              <i class="pi pi-envelope"></i>
              بريد إلكتروني
            </a>
            <a
              [href]="'https://wa.me/' + contactInfo.whatsapp"
              class="contact-btn whatsapp"
              target="_blank"
            >
              <i class="pi pi-whatsapp"></i>
              واتساب
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./ai-assistant.component.scss'],
})
export class AiAssistantComponent implements OnInit, OnDestroy {
  private aiService = inject(AiAssistantService);
  private destroy$ = new Subject<void>();

  isOpen$: Observable<boolean> = this.aiService.isOpen$;

  selectedFaqIndex: number | null = null;
  faqList: FAQItem[] = [];
  contactInfo = this.aiService.getContactInfo();

  ngOnInit(): void {
    this.loadFAQList();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFAQList(): void {
    this.faqList = [
      {
        question: 'كيف يمكنني التسجيل في الدورة؟',
        answer:
          'يمكنك التسجيل في الدورة من خلال النقر على زر "سجل في الدورة" في صفحة تفاصيل الدورة. ستحتاج إلى إنشاء حساب أولاً إذا لم تكن مسجلاً.',
      },
      {
        question: 'هل يمكنني الوصول للدورة بعد الانتهاء منها؟',
        answer:
          'نعم، يمكنك الوصول للدورة ومحتواها في أي وقت بعد التسجيل. ستحتفظ بحق الوصول الدائم للمحتوى.',
      },
      {
        question: 'هل توجد شهادة إتمام للدورة؟',
        answer:
          'نعم، ستحصل على شهادة إتمام معتمدة بعد الانتهاء من جميع الوحدات والدروس بنجاح.',
      },
      {
        question: 'كيف يمكنني التواصل مع المدرب؟',
        answer:
          'يمكنك التواصل مع المدرب من خلال منصة التعلم أو عبر البريد الإلكتروني. ستجد معلومات التواصل في صفحة الدورة.',
      },
      {
        question: 'ما هي متطلبات النظام للدورة؟',
        answer:
          'تحتاج إلى اتصال بالإنترنت وجهاز كمبيوتر أو هاتف ذكي. لا توجد متطلبات تقنية خاصة.',
      },
      {
        question: 'هل يمكنني إلغاء التسجيل في الدورة؟',
        answer:
          'نعم، يمكنك إلغاء التسجيل خلال فترة محددة. يرجى التواصل معنا للحصول على مزيد من التفاصيل.',
      },
      {
        question: 'كيف يمكنني دفع رسوم الدورة؟',
        answer:
          'يمكنك الدفع عبر البطاقة الائتمانية أو التحويل البنكي. جميع طرق الدفع آمنة ومشفرة.',
      },
      {
        question: 'هل يمكنني الحصول على استرداد المبلغ؟',
        answer:
          'نعم، يمكنك الحصول على استرداد كامل خلال 30 يوماً من تاريخ التسجيل إذا لم تبدأ الدورة.',
      },
    ];
  }

  selectFaq(index: number): void {
    if (this.selectedFaqIndex === index) {
      this.selectedFaqIndex = null; // إغلاق السؤال المفتوح
    } else {
      this.selectedFaqIndex = index; // فتح السؤال الجديد
    }
  }

  toggleFaq(): void {
    this.aiService.toggleChat();
  }

  closeFaq(): void {
    this.aiService.closeChat();
  }

  formatAnswer(content: string): string {
    // تحويل النص إلى HTML مع دعم التنسيق
    return content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/•/g, '&bull;')
      .replace(/(\d+)\./g, '<strong>$1.</strong>')
      .replace(
        /(📚|💼|🎨|💰|🎁|🏆|📜|💬|📞|🔧|📱|📊|📈|✅|❌|⚠️|ℹ️)/g,
        '<span class="emoji">$1</span>'
      );
  }
}
