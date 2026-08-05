export type DailyItem={
  verse:{text:string;source:string;href:string}
  dua:{title:string;text:string;source:string;href:string}
  dhikr:{text:string;target:number}
  wisdom:{title:string;text:string;source:string;href:string}
}

export const dailyItems:DailyItem[]=[
  {
    verse:{text:'﴿ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾',source:'سورة الرعد — الآية 28',href:'/quran'},
    dua:{title:'دعاء الفرج',text:'اللهم كن لوليك الحجة بن الحسن، صلواتك عليه وعلى آبائه، في هذه الساعة وفي كل ساعة، وليًا وحافظًا وقائدًا وناصرًا ودليلًا وعينًا.',source:'مفاتيح الجنان',href:'/duas/faraj'},
    dhikr:{text:'اللهم صل على محمد وآل محمد',target:100},
    wisdom:{title:'قيمة الإنسان',text:'قيمة كل امرئ ما يحسنه.',source:'نهج البلاغة',href:'/library'}
  },
  {
    verse:{text:'﴿ فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا ﴾',source:'سورة الشرح — الآيتان 5–6',href:'/quran'},
    dua:{title:'دعاء قصير',text:'يا من أرجوه لكل خير، وآمن سخطه عند كل شر.',source:'مفاتيح الجنان',href:'/duas'},
    dhikr:{text:'أستغفر الله ربي وأتوب إليه',target:100},
    wisdom:{title:'اغتنام الفرصة',text:'الفرصة تمر مر السحاب، فانتهزوا فرص الخير.',source:'نهج البلاغة',href:'/library'}
  },
  {
    verse:{text:'﴿ وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ﴾',source:'سورة الطلاق — الآية 3',href:'/quran'},
    dua:{title:'دعاء التوكل',text:'حسبي الله لا إله إلا هو، عليه توكلت وهو رب العرش العظيم.',source:'ذكر قرآني',href:'/duas'},
    dhikr:{text:'لا حول ولا قوة إلا بالله العلي العظيم',target:100},
    wisdom:{title:'الثقة والعمل',text:'التوكل لا يلغي العمل؛ بل يحرر القلب من القلق ويقود الجوارح إلى السبب الصحيح.',source:'مادة تربوية',href:'/library'}
  },
  {
    verse:{text:'﴿ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ ﴾',source:'سورة البقرة — الآية 153',href:'/quran'},
    dua:{title:'دعاء الصبر',text:'ربنا أفرغ علينا صبرًا وثبت أقدامنا.',source:'القرآن الكريم',href:'/quran'},
    dhikr:{text:'سبحان الله والحمد لله ولا إله إلا الله والله أكبر',target:40},
    wisdom:{title:'المحاسبة اليومية',text:'راجع يومك لتثبت الخير وتعالج الخطأ بخطوة صغيرة قابلة للاستمرار.',source:'مادة تربوية',href:'/library'}
  },
  {
    verse:{text:'﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾',source:'سورة طه — الآية 114',href:'/quran'},
    dua:{title:'دعاء طلب العلم',text:'اللهم انفعني بما علمتني، وعلمني ما ينفعني، وزدني علمًا.',source:'دعاء مشهور',href:'/duas'},
    dhikr:{text:'الحمد لله',target:100},
    wisdom:{title:'العلم والإتقان',text:'اجعل معرفتك طريقًا إلى نفع الناس وإتقان المسؤولية.',source:'مادة تربوية',href:'/library'}
  },
  {
    verse:{text:'﴿ إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ ﴾',source:'سورة البقرة — الآية 222',href:'/quran'},
    dua:{title:'دعاء التوبة',text:'إلهي لا تؤدبني بعقوبتك، ولا تمكر بي في حيلتك.',source:'مفاتيح الجنان',href:'/duas'},
    dhikr:{text:'يا الله',target:100},
    wisdom:{title:'تصحيح النية',text:'راجع نيتك قبل العمل وأثناءه وبعده، واجعل رضا الله أكبر من معرفة الناس.',source:'مادة تربوية',href:'/library'}
  },
  {
    verse:{text:'﴿ وَقُولُوا لِلنَّاسِ حُسْنًا ﴾',source:'سورة البقرة — الآية 83',href:'/quran'},
    dua:{title:'دعاء حسن الخلق',text:'اللهم حسن خُلقي كما حسنت خَلقي.',source:'دعاء مشهور',href:'/duas'},
    dhikr:{text:'الله أكبر',target:100},
    wisdom:{title:'حق اللسان',text:'الكلمة مسؤولية؛ فاختر العبارة الألطف، واترك الغيبة والسخرية والقول المؤذي.',source:'رسالة الحقوق',href:'/library'}
  }
]
