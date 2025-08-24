import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, map } from 'rxjs';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  category: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  whatsapp: string;
}

@Injectable({
  providedIn: 'root',
})
export class AiAssistantService {
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private isOpenSubject = new BehaviorSubject<boolean>(false);
  public isOpen$ = this.isOpenSubject.asObservable();

  private contactInfo: ContactInfo = {
    phone: '01234567890',
    email: 'support@etf-lms.com',
    whatsapp: '01234567890',
  };

  private faqs: FAQ[] = [
    // أسئلة عامة
    {
      id: '1',
      question: 'مرحباً، كيف يمكنني مساعدتك؟',
      answer:
        'أهلاً وسهلاً! أنا مساعدك الذكي في منصة التدريب السياحي. يمكنني مساعدتك في:\n\n🏨 دورات إدارة الفنادق والمنتجعات\n✈️ برامج التدريب السياحي\n🍽️ دورات الضيافة وخدمة العملاء\n📋 معلومات عن التسجيل والشهادات\n🎯 الأسئلة التقنية والدعم\n\nما الذي تود معرفته عن التدريب في مجال السياحة والفنادق؟',
      keywords: [
        'مرحبا',
        'اهلا',
        'سلام',
        'هاي',
        'hello',
        'hi',
        'مساعدة',
        'help',
      ],
      category: 'general',
    },
    {
      id: '2',
      question: 'كيف يمكنني التسجيل في دورة؟',
      answer:
        'للتسجيل في دورة تدريبية، اتبع الخطوات التالية:\n\n1️⃣ تصفح الدورات المتاحة من قسم "الدورات"\n2️⃣ اختر الدورة التي تهمك\n3️⃣ اضغط على "التسجيل في الدورة"\n4️⃣ املأ البيانات المطلوبة\n5️⃣ اختر طريقة الدفع\n6️⃣ ستحصل على تأكيد التسجيل\n\nهل تحتاج مساعدة في اختيار دورة معينة؟',
      keywords: ['تسجيل', 'دورة', 'كورس', 'register', 'enroll', 'اشتراك'],
      category: 'courses',
    },
    {
      id: '3',
      question: 'ما هي الدورات المتاحة؟',
      answer:
        'نقدم مجموعة شاملة من البرامج التدريبية في السياحة والفنادق:\n\n🏨 **إدارة الفنادق:**\n• إدارة الغرف والحجوزات\n• إدارة المطاعم والمأكولات\n• إدارة الموارد البشرية الفندقية\n• المحاسبة الفندقية\n\n✈️ **السياحة والسفر:**\n• تخطيط وتنظيم الرحلات\n• إدارة شركات السياحة\n• التسويق السياحي الرقمي\n• الإرشاد السياحي\n\n🍽️ **الضيافة وخدمة العملاء:**\n• فنون الضيافة والاستقبال\n• خدمة الطعام والشراب\n• إدارة المناسبات والمؤتمرات\n• التعامل مع الشكاوى\n\nيمكنك تصفح جميع البرامج من قسم "الدورات" في الموقع.',
      keywords: [
        'دورات',
        'كورسات',
        'متاحة',
        'موجودة',
        'courses',
        'available',
        'تدريب',
        'فنادق',
        'سياحة',
        'ضيافة',
      ],
      category: 'courses',
    },
    {
      id: '4',
      question: 'كم تكلفة الدورات؟',
      answer:
        'تختلف تكلفة البرامج التدريبية حسب التخصص والمستوى:\n\n💰 **أسعار البرامج:**\n• برامج الضيافة الأساسية: من 800-1500 جنيه\n• دورات إدارة الفنادق: من 1500-2500 جنيه\n• برامج السياحة المتخصصة: من 2000-3500 جنيه\n• شهادات مهنية معتمدة: من 3000-5000 جنيه\n\n🏨 **عروض خاصة:**\n• خصم 25% للعاملين في القطاع السياحي\n• خصم 20% عند التسجيل في أكثر من برنامج\n• عروض موسمية للفنادق والمنتجعات\n• باقات تدريبية للشركات السياحية\n\nللحصول على السعر الدقيق وخطط التقسيط، تواصل معنا.',
      keywords: ['سعر', 'تكلفة', 'فلوس', 'price', 'cost', 'كام', 'ثمن'],
      category: 'pricing',
    },
    {
      id: '5',
      question: 'هل الدورات معتمدة؟',
      answer:
        'نعم! جميع برامجنا التدريبية معتمدة رسمياً:\n\n🏆 **شهادات معتمدة من:**\n• وزارة السياحة والآثار\n• غرفة شركات السياحة المصرية\n• الاتحاد المصري للغرف السياحية\n• منظمة السياحة العالمية (UNWTO)\n• معاهد الضيافة الدولية\n\n📜 **أنواع الشهادات:**\n• شهادة مهنية في إدارة الفنادق\n• شهادة الضيافة والسياحة\n• شهادة معتمدة في الإرشاد السياحي\n• شهادات دولية في إدارة المطاعم\n\n✅ **مميزات الشهادة:**\n• معترف بها في سوق العمل المحلي والدولي\n• تأهيل للعمل في أفضل الفنادق والمنتجعات\n• إمكانية التحقق الإلكتروني من صحة الشهادة',
      keywords: ['معتمدة', 'شهادة', 'certificate', 'اعتماد', 'معترف'],
      category: 'certification',
    },
    {
      id: '6',
      question: 'كيف أتواصل مع المدرب؟',
      answer:
        'يمكنك التواصل مع خبراء التدريب في السياحة والفنادق:\n\n💬 **داخل المنصة:**\n• رسائل مباشرة للمدرب المختص\n• منتدى النقاش لكل برنامج تدريبي\n• جلسات مباشرة مع خبراء الصناعة\n• ورش عمل تفاعلية\n\n🏨 **التواصل المهني:**\n• واتساب المدربين المختصين\n• استشارات مهنية في الضيافة\n• نصائح عملية من مدراء فنادق\n• شبكة خريجين في القطاع السياحي\n\n⏰ **أوقات التواصل:**\n• متاحون 24/7 للاستشارات العاجلة\n• جلسات أسبوعية مع خبراء الصناعة',
      keywords: [
        'مدرب',
        'تواصل',
        'instructor',
        'teacher',
        'contact',
        'معلم',
        'خبير',
        'مختص',
      ],
      category: 'support',
    },
    {
      id: '7',
      question: 'مشكلة تقنية في الموقع',
      answer:
        'آسف لسماع ذلك! دعني أساعدك:\n\n🔧 **حلول سريعة:**\n• تحديث الصفحة (F5 أو Ctrl+R)\n• مسح cache المتصفح\n• تجربة متصفح آخر\n• التأكد من سرعة الإنترنت\n\n📱 **إذا استمرت المشكلة:**\n• وصف المشكلة بالتفصيل\n• نوع المتصفح المستخدم\n• نوع الجهاز (كمبيوتر/موبايل)\n\nيمكنك التواصل مع الدعم التقني للمساعدة الفورية.',
      keywords: ['مشكلة', 'تقنية', 'خطأ', 'error', 'problem', 'لا يعمل', 'عطل'],
      category: 'technical',
    },
    {
      id: '8',
      question: 'كيف أتابع تقدمي في البرنامج التدريبي؟',
      answer:
        'يمكنك متابعة تطورك المهني في مجال السياحة والفنادق:\n\n📊 **لوحة التحكم المهنية:**\n• نسبة إكمال كل وحدة تدريبية\n• المهارات المكتسبة والمطلوبة\n• تقييم الأداء العملي\n• نقاط الكفاءة المهنية\n\n🏨 **تقييم الخبرة العملية:**\n• سجل التدريب العملي في الفنادق\n• تقييم من مدراء الفنادق والمنتجعات\n• مشاريع حقيقية في الضيافة\n• بناء portfolio مهني\n\n📈 **التقارير والشهادات:**\n• تقرير شهري للتطور المهني\n• شهادات مراحل التأهيل\n• توصيات للعمل في الصناعة\n• متابعة مع مستشار مهني\n\nتجد تقييمك في "ملفي المهني" → "التطور في الضيافة"',
      keywords: [
        'تقدم',
        'progress',
        'متابعة',
        'نسبة',
        'إنجاز',
        'كام في المية',
        'تطور',
        'مهني',
      ],
      category: 'progress',
    },
    {
      id: '9',
      question: 'ما هي فرص العمل بعد التخرج؟',
      answer:
        'فرص عمل واعدة في القطاع السياحي والفندقي:\n\n🏨 **الفنادق والمنتجعات:**\n• مدير استقبال أو حجوزات\n• مشرف غرف أو مطاعم\n• مدير علاقات عملاء\n• مدير فندق أو منتجع\n\n✈️ **شركات السياحة:**\n• منظم رحلات سياحية\n• مرشد سياحي معتمد\n• مدير مبيعات سياحية\n• مدير شركة سياحة\n\n🍽️ **المطاعم والكافيهات:**\n• مدير مطعم أو كافيه\n• رئيس طهاة\n• مدير خدمة عملاء\n\n💼 **الرواتب المتوقعة:**\n• مبتدئ: 3000-5000 جنيه\n• خبرة متوسطة: 5000-8000 جنيه\n• خبرة عالية: 8000-15000 جنيه\n• مناصب إدارية: 15000+ جنيه',
      keywords: ['عمل', 'وظيفة', 'job', 'career', 'راتب', 'فرص', 'تخرج'],
      category: 'career',
    },
    {
      id: '10',
      question: 'هل يوجد تدريب عملي؟',
      answer:
        'نعم! التدريب العملي جزء أساسي من برامجنا:\n\n🏨 **تدريب في الفنادق:**\n• تدريب لمدة 3-6 أشهر في فنادق 5 نجوم\n• العمل مع فرق مختلفة (استقبال، مطاعم، غرف)\n• إشراف مباشر من مدراء الفنادق\n• شهادة خبرة عملية معتمدة\n\n✈️ **تدريب في شركات السياحة:**\n• تنظيم رحلات حقيقية\n• التعامل مع العملاء\n• تعلم أنظمة الحجز والسفر\n• زيارات ميدانية للمعالم السياحية\n\n🌍 **شراكات التدريب:**\n• فنادق هيلتون، ماريوت، وجولدن توليب\n• شركات إيمي ترافيل وجولدن توليب ترافيل\n• منتجعات البحر الأحمر وسيناء\n• مطاعم عالمية في القاهرة والإسكندرية\n\nمعدل توظيف الخريجين: 95% خلال 6 أشهر!',
      keywords: ['تدريب', 'عملي', 'internship', 'practical', 'خبرة', 'فنادق'],
      category: 'training',
    },
  ];

  constructor() {
    // إرسال رسالة ترحيب تلقائية
    this.addWelcomeMessage();
  }

  private addWelcomeMessage(): void {
    const welcomeMessage: ChatMessage = {
      id: this.generateId(),
      content:
        'مرحباً بك في أكاديمية السياحة والضيافة! 🏨✈️\n\nأنا مساعدك الذكي المختص في التدريب السياحي والفندقي. يمكنني مساعدتك في معرفة كل ما يخص:\n\n• برامج إدارة الفنادق والمنتجعات\n• دورات السياحة والإرشاد السياحي\n• تدريب الضيافة وخدمة العملاء\n• فرص العمل والتطوير المهني\n\nكيف يمكنني مساعدتك اليوم؟ 😊',
      isUser: false,
      timestamp: new Date(),
    };

    this.messagesSubject.next([welcomeMessage]);
  }

  sendMessage(content: string): Observable<ChatMessage> {
    const userMessage: ChatMessage = {
      id: this.generateId(),
      content,
      isUser: true,
      timestamp: new Date(),
    };

    // إضافة رسالة المستخدم
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, userMessage]);

    // العثور على الإجابة المناسبة
    const response = this.findBestAnswer(content);

    return this.simulateTyping()
      .pipe(
        delay(1000) // تأخير لمحاكاة الكتابة
      )
      .pipe(
        delay(0),
        // إرجاع الرد
        map(() => {
          const botMessage: ChatMessage = {
            id: this.generateId(),
            content: response,
            isUser: false,
            timestamp: new Date(),
          };

          const updatedMessages = this.messagesSubject.value;
          this.messagesSubject.next([...updatedMessages, botMessage]);

          return botMessage;
        })
      );
  }

  private simulateTyping(): Observable<void> {
    return new Observable((observer) => {
      // إضافة رسالة "يكتب..."
      const typingMessage: ChatMessage = {
        id: 'typing',
        content: 'يكتب...',
        isUser: false,
        timestamp: new Date(),
        isTyping: true,
      };

      const currentMessages = this.messagesSubject.value;
      this.messagesSubject.next([...currentMessages, typingMessage]);

      // إزالة رسالة "يكتب..." بعد فترة
      setTimeout(() => {
        const messages = this.messagesSubject.value.filter(
          (m) => m.id !== 'typing'
        );
        this.messagesSubject.next(messages);
        observer.next();
        observer.complete();
      }, 1500);
    });
  }

  private findBestAnswer(userInput: string): string {
    const input = userInput.toLowerCase().trim();

    // البحث عن أفضل إجابة بناءً على الكلمات المفتاحية
    for (const faq of this.faqs) {
      for (const keyword of faq.keywords) {
        if (input.includes(keyword.toLowerCase())) {
          return faq.answer;
        }
      }
    }

    // إذا لم يتم العثور على إجابة مناسبة
    return this.getNoAnswerResponse();
  }

  private getNoAnswerResponse(): string {
    return `عذراً، لم أستطع فهم سؤالك بوضوح. 😔\n\nيمكنك:\n\n📞 **التواصل المباشر مع خبراء السياحة:**\n• الهاتف: ${this.contactInfo.phone}\n• البريد الإلكتروني: ${this.contactInfo.email}\n• واتساب: ${this.contactInfo.whatsapp}\n\n🏨 **أو جرب سؤال:**\n• "ما هي برامج إدارة الفنادق؟"\n• "هل يوجد تدريب عملي؟"\n• "كم تكلفة دورات الضيافة؟"\n• "ما هي فرص العمل في السياحة؟"\n\nفريق خبراء التدريب السياحي متاح لمساعدتك 24/7! 🌟`;
  }

  getSuggestedQuestions(): string[] {
    return [
      'ما هي برامج إدارة الفنادق المتاحة؟',
      'كم تكلفة دورات السياحة والضيافة؟',
      'هل الشهادات معتمدة من وزارة السياحة؟',
      'هل يوجد تدريب عملي في الفنادق؟',
      'ما هي فرص العمل بعد التخرج؟',
    ];
  }

  getContactInfo(): ContactInfo {
    return this.contactInfo;
  }

  openChat(): void {
    this.isOpenSubject.next(true);
  }

  closeChat(): void {
    this.isOpenSubject.next(false);
  }

  toggleChat(): void {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }

  clearMessages(): void {
    this.addWelcomeMessage();
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 5);
  }
}
