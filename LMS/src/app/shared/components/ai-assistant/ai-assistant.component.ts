import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import {
  AiAssistantService,
  ChatMessage,
} from '../../services/ai-assistant.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    <div class="ai-assistant-container">
      <!-- Chat Toggle Button -->
      <button
        class="chat-toggle-btn"
        (click)="toggleChat()"
        [class.open]="isOpen$ | async"
        title="مساعد ذكي - اسأل أي سؤال!"
      >
        <i class="pi pi-comment" *ngIf="!(isOpen$ | async)"></i>
        <i class="pi pi-times" *ngIf="isOpen$ | async"></i>
        <span class="chat-badge" *ngIf="hasNewMessages && !(isOpen$ | async)"
          >جديد</span
        >
      </button>

      <!-- Chat Window -->
      <div class="chat-window" [class.show]="isOpen$ | async">
        <!-- Chat Header -->
        <div class="chat-header">
          <div class="header-content">
            <p-avatar
              icon="pi pi-robot"
              shape="circle"
              size="normal"
              styleClass="ai-avatar"
            >
            </p-avatar>
            <div class="header-text">
              <h4>المساعد الذكي</h4>
              <span class="status">متاح الآن</span>
            </div>
          </div>
          <button class="close-btn" (click)="closeChat()" title="إغلاق">
            <i class="pi pi-minus"></i>
          </button>
        </div>

        <!-- Chat Messages -->
        <div class="chat-messages" #messagesContainer>
          <div
            *ngFor="let message of messages$ | async; trackBy: trackByMessageId"
            class="message-wrapper"
            [class.user]="message.isUser"
            [class.bot]="!message.isUser"
            [class.typing]="message.isTyping"
          >
            <div class="message">
              <p-avatar
                *ngIf="!message.isUser"
                icon="pi pi-robot"
                shape="circle"
                size="normal"
                styleClass="message-avatar"
              >
              </p-avatar>

              <div
                class="message-content"
                [innerHTML]="formatMessage(message.content)"
              ></div>

              <span class="message-time">{{
                formatTime(message.timestamp)
              }}</span>
            </div>
          </div>
        </div>

        <!-- Suggested Questions -->
        <div class="suggested-questions" *ngIf="showSuggestions">
          <h5>أسئلة مقترحة:</h5>
          <button
            *ngFor="let question of suggestedQuestions"
            class="suggestion-btn"
            (click)="sendSuggestedQuestion(question)"
          >
            {{ question }}
          </button>
        </div>

        <!-- Chat Input -->
        <div class="chat-input">
          <div class="input-container">
            <input
              type="text"
              pInputText
              [(ngModel)]="newMessage"
              (keyup.enter)="sendMessage()"
              (keyup)="onInputKeyup()"
              placeholder="اكتب سؤالك هنا..."
              [disabled]="isTyping"
              #messageInput
              class="message-input"
            />
            <button
              pButton
              icon="pi pi-send"
              class="send-btn"
              (click)="sendMessage()"
              [disabled]="!newMessage.trim() || isTyping"
            ></button>
          </div>
        </div>

        <!-- Contact Info (when no answer found) -->
        <div class="contact-info" *ngIf="showContactInfo">
          <h5>تواصل معنا مباشرة:</h5>
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
export class AiAssistantComponent
  implements OnInit, OnDestroy, AfterViewChecked
{
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  private aiService = inject(AiAssistantService);
  private destroy$ = new Subject<void>();

  messages$: Observable<ChatMessage[]> = this.aiService.messages$;
  isOpen$: Observable<boolean> = this.aiService.isOpen$;

  newMessage = '';
  isTyping = false;
  hasNewMessages = false;
  showSuggestions = true;
  showContactInfo = false;

  suggestedQuestions: string[] = [];
  contactInfo = this.aiService.getContactInfo();

  private inactivityTimer: any;
  private readonly INACTIVITY_TIMEOUT = 20000; // 20 seconds

  ngOnInit(): void {
    this.suggestedQuestions = this.aiService.getSuggestedQuestions();

    // متابعة الرسائل الجديدة
    this.messages$.pipe(takeUntil(this.destroy$)).subscribe((messages) => {
      if (messages.length > 1) {
        // أكثر من رسالة الترحيب
        this.hasNewMessages = true;
        this.showSuggestions = false;
        // بدء timer للخمول بعد إخفاء الأسئلة
        this.startInactivityTimer();
      }

      // التحقق من وجود رسالة "لا يوجد جواب"
      const lastMessage = messages[messages.length - 1];
      if (
        lastMessage &&
        !lastMessage.isUser &&
        lastMessage.content.includes('لم أستطع فهم')
      ) {
        this.showContactInfo = true;
      }
    });

    // إخفاء badge عند فتح الشات
    this.isOpen$.pipe(takeUntil(this.destroy$)).subscribe((isOpen) => {
      if (isOpen) {
        this.hasNewMessages = false;
      }
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.clearInactivityTimer();
    this.destroy$.next();
    this.destroy$.complete();
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    const message = this.newMessage.trim();
    this.newMessage = '';
    this.isTyping = true;
    this.showContactInfo = false;

    // إعادة تعيين timer الخمول عند إرسال رسالة
    this.resetInactivityTimer();

    this.aiService
      .sendMessage(message)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isTyping = false;
          // بدء timer جديد بعد الانتهاء من الرد
          this.startInactivityTimer();
        },
        error: () => {
          this.isTyping = false;
          this.startInactivityTimer();
        },
      });
  }

  sendSuggestedQuestion(question: string): void {
    this.newMessage = question;
    this.sendMessage();
  }

  toggleChat(): void {
    this.aiService.toggleChat();
  }

  closeChat(): void {
    this.aiService.closeChat();
  }

  formatMessage(content: string): string {
    // تحويل النص إلى HTML مع دعم الرموز التعبيرية والتنسيق
    return content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/•/g, '&bull;')
      .replace(/(\d+)️⃣/g, '<span class="number-emoji">$1️⃣</span>')
      .replace(
        /(📚|💼|🎨|💰|🎁|🏆|📜|💬|📞|🔧|📱|📊|📈)/g,
        '<span class="emoji">$1</span>'
      );
  }

  formatTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  // وظائف إدارة timer الخمول
  private startInactivityTimer(): void {
    this.clearInactivityTimer();
    this.inactivityTimer = setTimeout(() => {
      this.showSuggestions = true;
      this.showContactInfo = false;
    }, this.INACTIVITY_TIMEOUT);
  }

  private resetInactivityTimer(): void {
    this.clearInactivityTimer();
    this.showSuggestions = false;
  }

  private clearInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  // دالة للتعامل مع الكتابة في حقل الإدخال
  onInputKeyup(): void {
    this.resetInactivityTimer();
    // إعادة بدء timer عند التوقف عن الكتابة
    // تأخير بسيط للتأكد من انتهاء المستخدم من الكتابة
    setTimeout(() => {
      if (!this.newMessage.trim()) {
        this.startInactivityTimer();
      }
    }, 1000);
  }
}
