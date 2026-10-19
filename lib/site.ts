/**
 * Public content of the coaching center (home page, footer, default name everywhere).
 * Edit the texts here. Name / phone / address / Facebook can also be overridden from Admin → Settings.
 */
export const SITE = {
  name: "Math Point Academy",
  tagline: "Building Mathematical Excellence",
  description:
    "Math Point Academy-তে স্বাগতম! আমরা ষষ্ঠ থেকে দশম শ্রেণীর শিক্ষার্থীদের জন্য 'সাধারণ গণিত' এবং একাদশ ও দ্বাদশ (HSC) শ্রেণীর শিক্ষার্থীদের জন্য 'আইসিটি (ICT)' বিষয়ের বিশেষায়িত যত্ন প্রদান করি। অভিজ্ঞ শিক্ষক, আধুনিক শিক্ষাপদ্ধতি এবং নিয়মিত মূল্যায়নের মাধ্যমে একাডেমিক পরীক্ষায় শতভাগ সফলতার বিশ্বস্ত নাম Math Point Academy।",

  about: [
    {
      icon: "📐",
      title: "মাধ্যমিক পর্যায় (ষষ্ঠ – দশম শ্রেণী): সাধারণ গণিত",
      text: "প্রতিটি অধ্যায় সৃজনশীল ও বাস্তব উদাহরণের মাধ্যমে সহজভাবে বুঝিয়ে দেওয়া হয়, যা তাদের গণিতের ভয় দূর করে বোর্ড পরীক্ষার (SSC) জন্য সম্পূর্ণ প্রস্তুত করে তোলে।",
    },
    {
      icon: "💻",
      title: "উচ্চ মাধ্যমিক পর্যায় (HSC - Class 11 & 12): আইসিটি (ICT)",
      text: "একাদশ ও দ্বাদশ শ্রেণীর শিক্ষার্থীদের জন্য অত্যন্ত গুরুত্বপূর্ণ বিষয় 'আইসিটি (ICT)'। সি-প্রোগ্রামিং, এইচটিএমএল, ডিজিটাল ডিভাইস ও ডাটাবেজের মতো জটিল টপিকগুলো আমরা লজিক ও প্র্যাক্টিক্যাল ধারণার মাধ্যমে সহজ করে তুলি, যাতে শিক্ষার্থীরা বোর্ড পরীক্ষায় খুব সহজেই জিপিএ-৫ (GPA 5) নিশ্চিত করতে পারে।",
    },
  ],

  specialitiesTitle: "কেন শিক্ষার্থীরা Math Point Academy-কে বেছে নেয়?",
  specialities: [
    { icon: "📐", title: "গণিতের বেসিক স্ট্রং করা", text: "ষষ্ঠ থেকে দশম শ্রেণীর গণিতের প্রতিটি নিয়মের খুঁটিনাটি সহজ বিশ্লেষণ।" },
    { icon: "💻", title: "সহজ ভাষায় ICT শিক্ষাদান", text: "HSC আইসিটির প্রোগ্রামিং ও লজিক গেটের মতো কঠিন বিষয়গুলোর সহজ সমাধান।" },
    { icon: "🎯", title: "সৃজনশীল ও MCQ স্পেশাল", text: "বোর্ড পরীক্ষার আদলে CQ এবং দ্রুত উত্তর করার জন্য MCQ শর্টকাট টেকনিক।" },
    { icon: "📝", title: "অধ্যায়ভিত্তিক পরীক্ষা ও শিট", text: "প্রতি অধ্যায় শেষে এক্সাম এবং বিগত বছরের প্রশ্নের সমন্বয়ে তৈরি এক্সক্লুসিভ লেকচার শিট।" },
    { icon: "💡", title: "ডাউট ক্লিয়ারিং সেশন", text: "পিছিয়ে পড়া শিক্ষার্থীদের জন্য অতিরিক্ত ক্লাসের মাধ্যমে সমস্যার সমাধান।" },
  ],

  director: {
    name: "Kazi Sujon",
    profession: "Private Tutor",
    education: "BBA (Management), Govt. Rajendra College, Faridpur",
  },
  address: "Adjacent to Nagarkanda College, Nagarkanda, Faridpur (নগরকান্দা কলেজ সংলগ্ন, নগরকান্দা, ফরিদপুর)",
  phones: [
    { number: "01581846778", note: "WhatsApp, IMO" },
    { number: "01952630079", note: "" },
  ],
  email: "kazisujon580271@gmail.com",
  facebook: "", // paste the page link in Admin → Settings (or here)
} as const;
