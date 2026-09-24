import { useTranslation } from "react-i18next";

const copy = {
  en: {
    deals: "Sales", deal: "Sale workspace", dealIntro: "Keep agreed terms and review steps together. Payments are not available yet.",
    propose: "Propose sale terms", revise: "Revise terms", price: "Agreed price (EGP)", conditions: "Conditions and closing milestones",
    expires: "Offer expires", fee: "Proposed seller success fee", feeNote: "Illustrative 1% fee for a future managed closing. No fee is collected now; final terms require legal and partner approval.",
    submit: "Send offer", accept: "Accept this version", buyerAccepted: "Buyer accepted", sellerAccepted: "Seller accepted",
    notAccepted: "Waiting for acceptance", version: "Offer version", status: "Deal status", timeline: "Activity", evidence: "Evidence", payment: "Payment status", partnerRef: "Partner reference",
    kind: "Document type", upload: "Upload private document", uploadNote: "PDF, PNG or JPEG, up to 10 MB. Only deal participants and authorized reviewers can access it.",
    dispute: "Raise an issue", disputeReason: "Explain the issue and the outcome you need", openDispute: "Submit issue", cancel: "Cancel proposal", cancelReason: "Why are you cancelling?",
    unavailable: "This sale is unavailable.", saveFailed: "Could not save. Check the details and try again.", saved: "Saved.",
    fundingDisabled: "Payments are not enabled. Do not transfer money based on this workspace.",
    review: "Sales review", listings: "Listings awaiting review", documents: "Documents awaiting review", dealReview: "Deal reviews",
    approve: "Approve", reject: "Reject", startReview: "Start review", ready: "Mark ready for partner", failed: "Verification failed", reviewNote: "Review reason or resolution", resolve: "Resolve", dismiss: "Dismiss", approveRelease: "Approve release", approveRefund: "Approve refund",
    pending: "Pending review", approved: "Approved", rejected: "Rejected", report: "Report listing", reportReason: "Report reason",
    reportDetails: "Describe the problem", reportSent: "Report submitted", authority: "Seller authority evidence",
    authorityHint: "Verified seller authority is required before protected offers can be made.", refresh: "Confirm still available", archive: "Archive", archived: "Archived",
    identity: "Identity", seller_authority: "Seller authority", title: "Title", encumbrance: "Encumbrances", agreement: "Agreement", registration: "Registration", handover: "Handover", other: "Other",
    fraud: "Possible fraud", duplicate: "Duplicate listing", wrong_details: "Incorrect details",
    status_proposed: "Proposed", status_accepted: "Accepted", status_reviewing: "Under review", status_ready_for_partner: "Ready for partner", status_verification_failed: "Verification failed", status_cancelled: "Cancelled", status_expired: "Expired", status_awaiting_funding: "Awaiting funding", status_funded: "Funded", status_registration_pending: "Registration pending", status_handover_pending: "Handover pending", status_release_pending: "Release pending", status_refund_pending: "Refund pending", status_disputed: "In dispute", status_completed: "Completed", status_refunded: "Refunded",
    event_offer_proposed: "Offer proposed", event_offer_accepted: "Offer accepted", event_document_uploaded: "Document uploaded", event_document_reviewed: "Document reviewed", event_review_status_changed: "Review updated", event_dispute_opened: "Issue opened", event_dispute_resolved: "Issue resolved", event_deal_cancelled: "Deal cancelled", event_money_action_approved: "Money action approved",
    payment_created: "Created", payment_funded: "Funded", payment_held: "Held by partner", payment_released: "Released", payment_refunded: "Refunded", payment_failed: "Failed",
  },
  ar: {
    deals: "المبيعات", deal: "مساحة البيع", dealIntro: "احتفظ بالشروط المتفق عليها وخطوات المراجعة في مكان واحد. المدفوعات غير متاحة بعد.",
    propose: "اقترح شروط البيع", revise: "عدّل الشروط", price: "السعر المتفق عليه (ج.م)", conditions: "الشروط ومراحل الإغلاق",
    expires: "انتهاء العرض", fee: "رسوم نجاح مقترحة للبائع", feeNote: "رسوم توضيحية ١٪ لإغلاق مستقبلي بإدارة الموقع. لا تُحصّل رسوم حالياً؛ تخضع الشروط النهائية للمراجعة القانونية واتفاق الشريك.",
    submit: "أرسل العرض", accept: "اقبل هذه النسخة", buyerAccepted: "وافق المشتري", sellerAccepted: "وافق البائع",
    notAccepted: "بانتظار الموافقة", version: "نسخة العرض", status: "حالة الصفقة", timeline: "النشاط", evidence: "المستندات", payment: "حالة الدفع", partnerRef: "مرجع الشريك",
    kind: "نوع المستند", upload: "ارفع مستنداً خاصاً", uploadNote: "PDF أو PNG أو JPEG، بحد أقصى ١٠ ميجابايت. يطلع عليه أطراف الصفقة والمراجعون المخولون فقط.",
    dispute: "بلّغ عن مشكلة", disputeReason: "اشرح المشكلة والنتيجة المطلوبة", openDispute: "أرسل البلاغ", cancel: "إلغاء المقترح", cancelReason: "ما سبب الإلغاء؟",
    unavailable: "هذه الصفقة غير متاحة.", saveFailed: "تعذر الحفظ. راجع البيانات وحاول مجدداً.", saved: "تم الحفظ.",
    fundingDisabled: "المدفوعات غير مفعلة. لا تحول أموالاً بناءً على هذه المساحة.",
    review: "مراجعة المبيعات", listings: "إعلانات تنتظر المراجعة", documents: "مستندات تنتظر المراجعة", dealReview: "مراجعة الصفقات",
    approve: "اعتماد", reject: "رفض", startReview: "ابدأ المراجعة", ready: "جاهزة للشريك", failed: "فشل التحقق", reviewNote: "سبب المراجعة أو القرار", resolve: "حسم", dismiss: "استبعاد", approveRelease: "اعتماد الصرف", approveRefund: "اعتماد الاسترداد",
    pending: "قيد المراجعة", approved: "معتمد", rejected: "مرفوض", report: "بلّغ عن الإعلان", reportReason: "سبب البلاغ",
    reportDetails: "اشرح المشكلة", reportSent: "أُرسل البلاغ", authority: "إثبات صلاحية البائع",
    authorityHint: "يلزم التحقق من صلاحية البائع قبل تقديم عروض البيع المحمية.", refresh: "أكد استمرار الإتاحة", archive: "أرشف", archived: "مؤرشف",
    identity: "الهوية", seller_authority: "صلاحية البائع", title: "الملكية", encumbrance: "القيود", agreement: "العقد", registration: "التسجيل", handover: "التسليم", other: "أخرى",
    fraud: "احتيال محتمل", duplicate: "إعلان مكرر", wrong_details: "بيانات غير صحيحة",
    status_proposed: "مقترحة", status_accepted: "مقبولة", status_reviewing: "قيد المراجعة", status_ready_for_partner: "جاهزة للشريك", status_verification_failed: "فشل التحقق", status_cancelled: "ملغاة", status_expired: "منتهية", status_awaiting_funding: "بانتظار التمويل", status_funded: "مموّلة", status_registration_pending: "بانتظار التسجيل", status_handover_pending: "بانتظار التسليم", status_release_pending: "بانتظار الصرف", status_refund_pending: "بانتظار الاسترداد", status_disputed: "محل نزاع", status_completed: "مكتملة", status_refunded: "مستردة",
    event_offer_proposed: "اقتُرح العرض", event_offer_accepted: "قُبل العرض", event_document_uploaded: "رُفع مستند", event_document_reviewed: "رُوجع مستند", event_review_status_changed: "تغيرت حالة المراجعة", event_dispute_opened: "فُتح بلاغ", event_dispute_resolved: "حُسم البلاغ", event_deal_cancelled: "أُلغيت الصفقة", event_money_action_approved: "اعتُمد إجراء مالي",
    payment_created: "أُنشئ", payment_funded: "مموّل", payment_held: "محفوظ لدى الشريك", payment_released: "صُرف", payment_refunded: "استُرد", payment_failed: "فشل",
  },
};

export function useSaleCopy() {
  const { i18n } = useTranslation();
  return copy[i18n.language.startsWith("ar") ? "ar" : "en"];
}

export function formatEgp(value, language = "en") {
  return new Intl.NumberFormat(language.startsWith("ar") ? "ar-EG" : "en-EG", {
    style: "currency", currency: "EGP", maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}
