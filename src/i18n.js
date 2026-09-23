import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      navbar: {
        home: "Home",
        about: "About",
        contact: "Contact Us",
        addProperty: "Add Property",
        signUp: "SignUp",
        signIn: "SignIn",
        closeMenu: "Close menu", openMenu: "Open menu", primaryNavigation: "Primary navigation", menuLabel: "Mobile navigation", menuEyebrow: "FIND YOUR WAY", menuIntro: "A place for every next step.", accountLabel: "YOUR SPACE", myProperties: "My properties", wishlist: "Wishlist", language: "LANGUAGE", switchLanguage: "Switch language",
      },
      marketing: {
        rent: "Find",
        dreamTitle: "a place to call home.",
        subtitle: "Explore places to rent or buy, compare the details that matter, and connect with the people behind each listing.",
      },
      search: {
        placeholder: "Type to search...",
        button: "Search",
      },
      filters: {
        location: "Location (any)",
        propertyType: "Property type (any)",
        priceRange: "Price range (any)",
      },
      form: {
        postAd: "Post Your Ad",
        title: "Title",
        price: "Asking price (EGP)",
        propertyType: "Listing purpose", propertyCategory: "Property type", choosePropertyCategory: "Choose a property type",
        forRent: "For Rent",
        forSale: "For Sale",
        description: "Description",
        country: "Country",
        state: "State",
        city: "City",
        zipCode: "Zip Code",
        address: "Address",
        bedrooms: "Number of Bedrooms",
        bathrooms: "Number of Bathrooms",
        parking: "Number of Parking Spaces",
        surfaceArea: "Surface area (m²)",
        phone: "Phone Number",
        upload: "Upload",
        save: "Save",
        egypt: "Egypt", titleExample: "e.g. Modern apartment in Zamalek", selectListingPurpose: "Select listing purpose", selectGovernorate: "Select governorate", descriptionExample: "Describe the key features and nearby landmarks", cityExample: "e.g. Nasr City", addressExample: "e.g. Building 12, Abbas El-Akkad Street"
      },
      propertyForm: {
        heroIndex: "A NEW PLACE TO DISCOVER", heroTitle: "List a place worth finding.", editHeroTitle: "Make your listing even better.", heroIntro: "Share the details, add photos, and place your property on the map.", editFormTitle: "Edit your listing", guideTitle: "Your listing guide", guideDetails: "Property details", guidePhotos: "Photos", guideLocation: "Location", guideNote: "A clear description and a carefully placed pin help people understand the property before they get in touch.", publish: "Publish property", saveChanges: "Save changes",
        intro: "Give seekers the details they need to understand your property.", detailsStep: "01 / DETAILS", detailsTitle: "Tell us about the property", photosStep: "02 / PHOTOS", photosTitle: "Property photos",
        locationStep: "03 / LOCATION", locationTitle: "Place your property on the map", useGps: "Use my location", locating: "Locating…",
        locationHelp: "Click anywhere on the map to drop a pin, then drag it to fine-tune the location. You can also enter coordinates or use your device location.",
        locationRequired: "Choose a location on the map.", gpsUnavailable: "Location services are not available in this browser.",
        gpsSecureContext: "Device location needs HTTPS or localhost. Open the secure site, or place the pin on the map.",
        gpsDenied: "Location access is blocked. Allow it in your browser's site settings, then try again, or place the pin on the map.",
        gpsFailed: "Your device couldn't determine its location. Check that location services are on, then try again or place the pin on the map.",
        imagesRequired: "Add at least one property photo.", imageInvalid: "Choose a PNG, JPG, or WebP image under 10 MB.",
        imageLimit: "You can add up to 10 photos.", imageHelp: "PNG, JPG, or WebP · up to 10 photos · 10 MB each",
        coordinatesLabel: "Or enter coordinates", coordinatesInvalid: "Enter valid latitude and longitude, separated by a comma.", setPin: "Go to pin", tapMap: "Click to place pin", pinPlaced: "Pin placed · drag to adjust", removePin: "Remove pin",
        categoryRequired: "Choose a property type.", cityRequired: "Enter the city or neighborhood.", descriptionRequired: "Describe the property in at least 20 characters."
      },
      validation: {
        titleRequired: "Title is required.",
        numbersOnly: "Field cannot consist only of numbers.",
        englishOnly: "Field must contain only English characters.",
        priceRequired: "Price is required.",
        positiveNumbers: "Field must contain only positive numbers.",
        typeRequired: "Property type is required.",
        descNumbersOnly: "Description cannot consist only of numbers.",
        descEnglishOnly: "Description must contain only English characters.",
        stateRequired: "State is required.",
        cityNumbersOnly: "City cannot consist only of numbers.",
        cityLettersNumbers: "Field should contain only English letters and numbers.",
        zipLength: "Zip code must contain between 3 and 9 digits.",
        addressRequired: "Address is required.",
        bedroomsRequired: "Number of bedrooms is required.",
        bathroomsRequired: "Number of bathrooms is required.",
        parkingRequired: "Number of parking spaces is required.",
        surfaceRequired: "Surface area is required.",
        phoneRequired: "Phone number is required.",
        phoneValid: "Enter a valid Egyptian phone number."
      },
      toast: {
        uploadSuccess: "{{name}} uploaded successfully",
        uploadFailed: "Failed to upload {{name}}",
        genericUploadFailed: "Upload failed.",
        submitSuccess: "Form submitted successfully",
        submitError: "Server error, please try again later",
        fixErrors: "Please fix the errors."
      },
      listings: {
        myProperties: "My Properties",
        ownerSpace: "OWNER SPACE", intro: "A clear view of the places you share and the people who can discover them.", addProperty: "Add property",
        overview: "Portfolio overview", totalListings: "Total listings", availableListings: "Available now", saleListings: "For sale", rentalListings: "For rent", listingMix: "Your listing mix", byRegion: "Listings by governorate", unknownRegion: "Other",
        manageLabel: "YOUR PLACES", yourListings: "Manage listings", manageIntro: "Keep details current and choose which properties appear to seekers.", filterLabel: "Filter listings", filter_all: "All", filter_available: "Available", filter_paused: "Paused", searchLabel: "Search your listings", searchPlaceholder: "Search by place or title", noResults: "No listings match this search.", emptyTitle: "Your first listing starts here.", emptyIntro: "Add a property to put it in front of people looking for their next place.", loading: "Loading your properties…", loadFailed: "We couldn't load your properties.", retry: "Try again", view: "View property", sale: "For sale", rent: "For rent", askingPrice: "Asking price", available: "Available", paused: "Paused", previous: "Previous", next: "Next",
        title: "Title",
        propertyType: "Property Type",
        price: "Price",
        state: "State",
        address: "Address",
        isAvailable: "Is Available",
        actions: "Actions",
        edit: "Edit",
        delete: "Delete",
        deleteConfirm: "Delete the property",
        deleteWarning: "Are you sure to delete this property?",
        yes: "Yes",
        no: "No",
        deleteSuccess: "Property deleted successfully",
        deleteFailed: "Failed to delete property.",
        updateSuccess: "Availability updated successfully.",
        updateFailed: "Failed to update availability.",
        updateError: "An error occurred while updating availability."
      },
      wishlist: {
        myWishlist: "My Wishlist",
        kicker: "PLACES TO REMEMBER", intro: "Keep the homes that caught your eye together, ready when you want another look.", savedSingle: "saved home", savedCount: "saved homes", savedPlaces: "YOUR SAVED PLACES", shortlist: "Your shortlist", collectionIntro: "Revisit the details, compare what matters, and keep your options close.", view: "View property", remove: "Remove from wishlist", removed: "Removed from your wishlist", removeFailed: "Could not remove this saved home.", available: "Available now", unavailable: "No longer available", sale: "For sale", rent: "For rent", beds: "beds", baths: "baths", askingPrice: "Asking price", previous: "Previous", next: "Next", errorTitle: "We couldn't load your saved homes.", retry: "Try again",
        loading: "Loading wishlist details...",
        error: "Error",
        empty: "Your wishlist is empty",
        emptySub: "Start exploring properties and add your favorites to the wishlist",
        explore: "Explore Properties"
      },
      network: {
        offline: "You are browsing offline. Changes will not be saved."
      },
      pwa: {
        install: "Install",
        dismiss: "Not Now",
        installDesc: "Add to home screen for offline-friendly, fast property search."
      },
      propertyDetails: {
        loading: "Loading property details", unavailable: "We couldn't load this property.", notFound: "This property could not be found.", back: "Browse homes", price: "Price", save: "Save home", savedAction: "Saved", share: "Share", copyLink: "Copy link", facebook: "Share on Facebook", twitter: "Share on X", whatsapp: "Share on WhatsApp", copied: "Link copied", copyFailed: "Could not copy the link.", savedOffline: "Saved offline. Changes will sync when you reconnect.", saved: "Added to your saved homes", removed: "Removed from your saved homes", saveFailed: "Could not update saved homes.", noPhone: "A valid seller phone number is not available.", features: "At a glance", type: "Property type", area: "Area", bedrooms: "Bedrooms", bathrooms: "Bathrooms", parking: "Parking spaces", listed: "Listed", description: "About this property", location: "Location", mapUnavailable: "Map location unavailable for this property", contactTitle: "Interested in this place?", contactIntro: "Get in touch with the person behind this listing.", signIn: "Sign in to contact", messageWhatsapp: "Message on WhatsApp", liveChat: "Message the owner"
      },
      inquiries: {
        eyebrow: "YOUR CONVERSATIONS", title: "Messages", intro: "Keep every property conversation in one place.", openInbox: "Open your inbox", chatLabel: "Private property conversation", privateConversation: "Private conversation", fromSeeker: "Inquiry from {{name}}", memberId: "Member ···{{id}}", you: "You", youNamed: "You · {{name}}", loading: "Loading messages…", empty: "Ask a question about this property to start a conversation.", loadFailed: "Messaging is temporarily unavailable.", retry: "Try again", sendFailed: "Message not sent. Please try again.", messageLabel: "Your message", placeholder: "Write your message…", send: "Send message", noConversations: "No conversations yet", explore: "Explore homes", conversations: "Conversations", propertyUnavailable: "Property unavailable", seekerConversation: "Inquiry #{{number}}", ownerConversation: "Listing owner", viewProperty: "View property", unavailable: "This listing is not accepting new inquiries.", whatsAppIntro: "Hello, I'm interested in {{property}}. {{url}}"
      },
      notifications: { label: "Notifications, {{count}} unread", title: "Notifications", newMessage: "New property message", propertyUnavailable: "Property unavailable", markAllRead: "Mark all read", empty: "You're all caught up.", error: "Couldn't load notifications. Try again later.", openInbox: "Open messages", dismiss: "Dismiss notification" },
      contactForm: {
        title: "Send a message", firstName: "First name", lastName: "Last name", email: "Email address", subject: "Subject", phone: "Phone number", message: "Your message", submit: "Send message",
        required: "This field is required.", lettersOnly: "Use letters and spaces only.", invalidEmail: "Enter a valid email address.", invalidPhone: "Enter a valid Egyptian phone number.", numbersOnly: "Please write a message, not just numbers.", invalidMessage: "Use letters, numbers, and standard punctuation.", fixErrors: "Please check the highlighted fields.", success: "Your message was sent.", sendError: "We couldn't send your message. Please try again later."
      },
      redesign: {
        heroTag: "A better place to begin", explore: "Explore homes", story: "Our story", heroNote: "Find a place that feels like yours.", imageNote: "Find your place",
        curated: "Curated homes", listingTitle: "Explore places to call home", listingIntro: "Browse the latest available homes, then use the filters to find the right fit.", searchPlaceholder: "Search by place or address", searchAction: "Search homes", noResults: "No properties found. Try adjusting your search criteria.", imageUnavailable: "Image unavailable", loadingHomes: "Loading homes", loadingMap: "Loading map", houseType: "Property type", listingPurpose: "Rent or sale", purpose_any: "Rent or sale", purpose_rent: "For rent", purpose_sale: "For sale", priceRange: "Price range", anyType: "Any property type", anyPrice: "Any price", type_house: "House", type_apartment: "Apartment", type_condo: "Condo", type_townhouse: "Townhouse",
        cityFilter: "City", anyCity: "Any city", resetFilters: "Reset filters", switchToDark: "Switch to dark mode", switchToLight: "Switch to light mode", beds: "beds", baths: "baths", viewListing: "View property", priceUnit: "EGP", nearbyTitle: "Find homes near you", nearbyIntro: "Share your location or choose a point on the map.", useLocation: "Use my location", locating: "Locating…", chooseOnMap: "Choose on map", nearMyLocation: "Near my location", nearMapPin: "Near map pin", withinKm: "Within {{count}} km", anyDistance: "Any distance", clearLocation: "Clear location filter", locationUnavailable: "Device location needs HTTPS or localhost and a supported browser. Choose a point on the map instead.", locationDenied: "Location access is blocked. Allow it in browser settings or choose a point on the map.", locationFailed: "Your device couldn't determine its location. Choose a point on the map instead.", mapPickHint: "Tap the map to search nearby", mapPinHint: "Showing homes near this point", viewNearbyResults: "View results: {{count}}", nearestFirst: "Nearest first · results: {{count}}", distanceAway: "{{distance}} km away", viewProperty: "View property",
        ownerTag: "For property owners", ownerTitle: "Have a place to share?", ownerIntro: "Create a listing and help the right person discover your property.", ownerAction: "List your property",
        aboutTag: "About Real Estate", aboutTitle: "Home is where your next story starts.", aboutIntro: "We make it easier to explore available properties, compare the essentials, and connect with the people behind the listings.", aboutProcess: "A clearer path to the right place.", aboutProcessIntro: "Simple tools to help you move from browsing to a conversation.", discover: "Discover", discoverText: "Browse available homes and refine your search by the details that matter.", favorites: "Keep your favorites", favoritesText: "Save the properties you want to revisit in one easy place.", connect: "Connect", connectText: "Open a property to see more details and get in touch with the seller.",
        footerTitle: "Find your next chapter.", footerIntro: "Discover homes that make room for the life you want to live.", footerExplore: "Explore", footerContact: "Get in touch", footerEmail: "Email us", rights: "All rights reserved.", footerNote: "Made for the places we call home.",
        contactTitle: "Let’s talk about what’s next.", contactIntro: "Questions about a listing or about sharing your own property? Send us a note and we’ll get back to you.",
        notFoundEyebrow: "404 / Page not found", notFoundTitle: "Let’s find your way home.", notFoundIntro: "This page may have moved. Head back to explore available properties.", editUnavailable: "Property unavailable", editUnavailableIntro: "We could not open this listing for editing. Check that it belongs to your account."
      }
    }
  },
  ar: {
    translation: {
      navbar: {
        home: "الرئيسية",
        about: "من نحن",
        contact: "اتصل بنا",
        addProperty: "أضف عقار",
        signUp: "إنشاء حساب",
        signIn: "تسجيل الدخول",
        closeMenu: "إغلاق القائمة", openMenu: "افتح القائمة", primaryNavigation: "التنقل الرئيسي", menuLabel: "التنقل", menuEyebrow: "طريقك إلى المكان", menuIntro: "كل خطوة تقربك من مكانك القادم.", accountLabel: "مساحتك", myProperties: "عقاراتي", wishlist: "المفضلة", language: "اللغة", switchLanguage: "تغيير اللغة",
      },
      marketing: {
        rent: "اعثر على",
        dreamTitle: "مكان تسميه بيتك.",
        subtitle: "استكشف عقارات للإيجار أو الشراء، وقارن التفاصيل المهمة، وتواصل مع أصحاب الإعلانات.",
      },
      search: {
        placeholder: "اكتب للبحث...",
        button: "بحث",
      },
      filters: {
        location: "الموقع (الكل)",
        propertyType: "نوع العقار (الكل)",
        priceRange: "نطاق السعر (الكل)",
      },
      form: {
        postAd: "انشر إعلانك",
        title: "العنوان",
        price: "السعر المطلوب (جنيه مصري)",
        propertyType: "الغرض من الإعلان", propertyCategory: "نوع العقار", choosePropertyCategory: "اختر نوع العقار",
        forRent: "للإيجار",
        forSale: "للبيع",
        description: "الوصف",
        country: "البلد",
        state: "المحافظة",
        city: "المدينة",
        zipCode: "الرمز البريدي",
        address: "العنوان التفصيلي",
        bedrooms: "عدد غرف النوم",
        bathrooms: "عدد الحمامات",
        parking: "عدد مواقف السيارات",
        surfaceArea: "المساحة الكلية (م²)",
        phone: "رقم الهاتف",
        upload: "رفع الصور",
        save: "حفظ",
        egypt: "مصر", titleExample: "مثال: شقة حديثة في الزمالك", selectListingPurpose: "اختر الغرض من الإعلان", selectGovernorate: "اختر المحافظة", descriptionExample: "صف أهم المميزات والمعالم القريبة", cityExample: "مثال: مدينة نصر", addressExample: "مثال: عمارة ١٢، شارع عباس العقاد"
      },
      propertyForm: {
        heroIndex: "مكان جديد للاكتشاف", heroTitle: "اعرض عقارك ليجده من يبحث عنه.", editHeroTitle: "اجعل إعلانك أوضح وأفضل.", heroIntro: "أضف التفاصيل والصور وحدد موقع العقار على الخريطة.", editFormTitle: "تعديل الإعلان", guideTitle: "دليل إضافة العقار", guideDetails: "تفاصيل العقار", guidePhotos: "الصور", guideLocation: "الموقع", guideNote: "الوصف الواضح وتحديد الموقع بدقة يساعدان الباحثين على فهم العقار قبل التواصل.", publish: "انشر العقار", saveChanges: "احفظ التعديلات",
        intro: "أضف التفاصيل التي تساعد الباحثين على فهم العقار.", detailsStep: "٠١ / التفاصيل", detailsTitle: "حدثنا عن العقار", photosStep: "٠٢ / الصور", photosTitle: "صور العقار",
        locationStep: "٠٣ / الموقع", locationTitle: "حدد موقع العقار على الخريطة", useGps: "استخدم موقعي", locating: "جارٍ تحديد الموقع…",
        locationHelp: "اضغط في أي مكان على الخريطة لوضع العلامة، ثم اسحبها لضبط الموقع. يمكنك أيضًا إدخال الإحداثيات أو استخدام موقع جهازك.",
        locationRequired: "حدد موقع العقار على الخريطة.", gpsUnavailable: "خدمة الموقع غير متاحة في هذا المتصفح.",
        gpsSecureContext: "يتطلب تحديد موقع الجهاز اتصال HTTPS أو localhost. افتح الموقع الآمن أو ضع العلامة على الخريطة.",
        gpsDenied: "الوصول إلى الموقع محظور. اسمح به من إعدادات الموقع في المتصفح، ثم حاول مجددًا أو ضع العلامة على الخريطة.",
        gpsFailed: "تعذر على جهازك تحديد موقعه. تأكد من تشغيل خدمات الموقع، ثم حاول مجددًا أو ضع العلامة على الخريطة.",
        imagesRequired: "أضف صورة واحدة على الأقل للعقار.", imageInvalid: "اختر صورة PNG أو JPG أو WebP بحجم أقل من ١٠ ميجابايت.",
        imageLimit: "يمكنك إضافة ١٠ صور بحد أقصى.", imageHelp: "PNG أو JPG أو WebP · حتى ١٠ صور · ١٠ ميجابايت للصورة",
        coordinatesLabel: "أو أدخل الإحداثيات", coordinatesInvalid: "أدخل خط عرض وخط طول صحيحين مفصولين بفاصلة.", setPin: "اذهب إلى العلامة", tapMap: "اضغط لتحديد الموقع", pinPlaced: "تم تحديد الموقع · اسحب العلامة للتعديل", removePin: "احذف العلامة",
        categoryRequired: "اختر نوع العقار.", cityRequired: "أدخل المدينة أو الحي.", descriptionRequired: "صِف العقار في ٢٠ حرفًا على الأقل."
      },
      validation: {
        titleRequired: "العنوان مطلوب.",
        numbersOnly: "الحقل لا يمكن أن يتكون من أرقام فقط.",
        englishOnly: "الحقل يجب أن يحتوي على أحرف إنجليزية فقط.",
        priceRequired: "السعر مطلوب.",
        positiveNumbers: "الحقل يجب أن يحتوي على أرقام موجبة فقط.",
        typeRequired: "نوع العقار مطلوب.",
        descNumbersOnly: "الوصف لا يمكن أن يتكون من أرقام فقط.",
        descEnglishOnly: "الوصف يجب أن يحتوي على أحرف إنجليزية فقط.",
        stateRequired: "المحافظة مطلوبة.",
        cityNumbersOnly: "المدينة لا يمكن أن تتكون من أرقام فقط.",
        cityLettersNumbers: "الحقل يجب أن يحتوي على حروف إنجليزية وأرقام فقط.",
        zipLength: "الرمز البريدي يجب أن يتكون من 3 إلى 9 أرقام.",
        addressRequired: "العنوان مطلوب.",
        bedroomsRequired: "عدد غرف النوم مطلوب.",
        bathroomsRequired: "عدد الحمامات مطلوب.",
        parkingRequired: "عدد مواقف السيارات مطلوب.",
        surfaceRequired: "المساحة الكلية مطلوبة.",
        phoneRequired: "رقم الهاتف مطلوب.",
        phoneValid: "أدخل رقم هاتف مصري صحيح."
      },
      toast: {
        uploadSuccess: "تم رفع {{name}} بنجاح",
        uploadFailed: "فشل رفع {{name}}",
        genericUploadFailed: "فشل الرفع.",
        submitSuccess: "تم تقديم النموذج بنجاح",
        submitError: "خطأ في الخادم، يرجى المحاولة لاحقًا",
        fixErrors: "يرجى تصحيح الأخطاء."
      },
      listings: {
        myProperties: "عقاراتي",
        ownerSpace: "مساحة المالك", intro: "نظرة واضحة على عقاراتك وكيف تظهر للباحثين عن مكان جديد.", addProperty: "أضف عقارًا",
        overview: "نظرة عامة", totalListings: "إجمالي العقارات", availableListings: "المتاح الآن", saleListings: "للبيع", rentalListings: "للإيجار", listingMix: "نسبة البيع والإيجار", byRegion: "العقارات حسب المحافظة", unknownRegion: "أخرى",
        manageLabel: "عقاراتك", yourListings: "إدارة العقارات", manageIntro: "حدّث التفاصيل وحدد العقارات التي تظهر للباحثين.", filterLabel: "تصفية العقارات", filter_all: "الكل", filter_available: "متاح", filter_paused: "متوقف", searchLabel: "ابحث في عقاراتك", searchPlaceholder: "ابحث بالمكان أو العنوان", noResults: "لا توجد عقارات تطابق بحثك.", emptyTitle: "ابدأ بإضافة عقارك الأول.", emptyIntro: "أضف عقارًا ليجده الباحثون عن مكانهم القادم.", loading: "جارٍ تحميل عقاراتك…", loadFailed: "تعذر تحميل عقاراتك.", retry: "حاول مجددًا", view: "عرض العقار", sale: "للبيع", rent: "للإيجار", askingPrice: "السعر المطلوب", available: "متاح", paused: "متوقف", previous: "السابق", next: "التالي",
        title: "العنوان",
        propertyType: "نوع العقار",
        price: "السعر",
        state: "المحافظة",
        address: "العنوان التفصيلي",
        isAvailable: "متاح",
        actions: "الإجراءات",
        edit: "تعديل",
        delete: "حذف",
        deleteConfirm: "حذف العقار",
        deleteWarning: "هل أنت متأكد من حذف هذا العقار؟",
        yes: "نعم",
        no: "لا",
        deleteSuccess: "تم حذف العقار بنجاح",
        deleteFailed: "فشل حذف العقار.",
        updateSuccess: "تم تحديث الحالة بنجاح.",
        updateFailed: "فشل تحديث الحالة.",
        updateError: "حدث خطأ أثناء تحديث الحالة."
      },
      wishlist: {
        myWishlist: "قائمتي المفضلة",
        kicker: "أماكن تستحق التذكر", intro: "احتفظ بالعقارات التي أعجبتك في مكان واحد لتعود إليها وقتما تشاء.", savedSingle: "عقار محفوظ", savedCount: "عقارات محفوظة", savedPlaces: "العقارات المحفوظة", shortlist: "قائمتك المختارة", collectionIntro: "راجع التفاصيل وقارن ما يهمك واحتفظ بخياراتك بالقرب منك.", view: "عرض العقار", remove: "إزالة من المفضلة", removed: "تمت الإزالة من المفضلة", removeFailed: "تعذر إزالة هذا العقار من المفضلة.", available: "متاح الآن", unavailable: "لم يعد متاحًا", sale: "للبيع", rent: "للإيجار", beds: "غرف", baths: "حمامات", askingPrice: "السعر المطلوب", previous: "السابق", next: "التالي", errorTitle: "تعذر تحميل العقارات المحفوظة.", retry: "حاول مجددًا",
        loading: "جاري تحميل المفضلة...",
        error: "خطأ",
        empty: "قائمتك المفضلة فارغة",
        emptySub: "ابدأ في استكشاف العقارات وأضف مفضلاتك إلى القائمة",
        explore: "استكشف العقارات"
      },
      network: {
        offline: "أنت تتصفح بدون اتصال بالإنترنت. لن يتم حفظ التعديلات."
      },
      pwa: {
        install: "تثبيت",
        dismiss: "ليس الآن",
        installDesc: "أضف التطبيق للشاشة الرئيسية لتصفح سريع وسهل للممتلكات بدون إنترنت."
      },
      propertyDetails: {
        loading: "جارٍ تحميل تفاصيل العقار", unavailable: "تعذر تحميل هذا العقار.", notFound: "لم نتمكن من العثور على هذا العقار.", back: "تصفح العقارات", price: "السعر", save: "احفظ العقار", savedAction: "محفوظ", share: "مشاركة", copyLink: "نسخ الرابط", facebook: "مشاركة على فيسبوك", twitter: "مشاركة على إكس", whatsapp: "مشاركة على واتساب", copied: "تم نسخ الرابط", copyFailed: "تعذر نسخ الرابط.", savedOffline: "تم الحفظ دون اتصال. ستتم مزامنة التغييرات عند عودة الاتصال.", saved: "تمت الإضافة إلى العقارات المحفوظة", removed: "تمت الإزالة من العقارات المحفوظة", saveFailed: "تعذر تحديث العقارات المحفوظة.", noPhone: "رقم هاتف صالح لصاحب الإعلان غير متاح.", features: "نظرة سريعة", type: "نوع العقار", area: "المساحة", bedrooms: "غرف النوم", bathrooms: "الحمامات", parking: "أماكن الوقوف", listed: "تاريخ النشر", description: "عن هذا العقار", location: "الموقع", mapUnavailable: "موقع العقار غير متاح على الخريطة", contactTitle: "هل أعجبك هذا المكان؟", contactIntro: "تواصل مع صاحب هذا الإعلان.", signIn: "سجّل الدخول للتواصل", messageWhatsapp: "راسل عبر واتساب", liveChat: "راسل صاحب الإعلان"
      },
      inquiries: {
        eyebrow: "محادثاتك", title: "الرسائل", intro: "كل محادثات العقارات في مكان واحد.", openInbox: "افتح صندوق الرسائل", chatLabel: "محادثة خاصة بالعقار", privateConversation: "محادثة خاصة", fromSeeker: "استفسار من {{name}}", memberId: "عضو ···{{id}}", you: "أنت", youNamed: "أنت · {{name}}", loading: "جارٍ تحميل الرسائل…", empty: "اسأل عن هذا العقار لبدء محادثة.", loadFailed: "خدمة الرسائل غير متاحة مؤقتًا.", retry: "حاول مرة أخرى", sendFailed: "لم تُرسل الرسالة. حاول مرة أخرى.", messageLabel: "رسالتك", placeholder: "اكتب رسالتك…", send: "إرسال الرسالة", noConversations: "لا توجد محادثات بعد", explore: "استكشف العقارات", conversations: "المحادثات", propertyUnavailable: "العقار غير متاح", seekerConversation: "استفسار رقم {{number}}", ownerConversation: "صاحب الإعلان", viewProperty: "عرض العقار", unavailable: "هذا الإعلان لا يستقبل استفسارات جديدة.", whatsAppIntro: "مرحبًا، أنا مهتم بعقار {{property}}. {{url}}"
      },
      notifications: { label: "الإشعارات، {{count}} غير مقروءة", title: "الإشعارات", newMessage: "رسالة جديدة بشأن عقار", propertyUnavailable: "العقار غير متاح", markAllRead: "تحديد الكل كمقروء", empty: "لا توجد إشعارات جديدة.", error: "تعذر تحميل الإشعارات. حاول لاحقًا.", openInbox: "افتح الرسائل", dismiss: "إغلاق الإشعار" },
      contactForm: {
        title: "أرسل رسالة", firstName: "الاسم الأول", lastName: "اسم العائلة", email: "البريد الإلكتروني", subject: "الموضوع", phone: "رقم الهاتف", message: "رسالتك", submit: "أرسل الرسالة",
        required: "هذا الحقل مطلوب.", lettersOnly: "استخدم الحروف والمسافات فقط.", invalidEmail: "أدخل بريدًا إلكترونيًا صحيحًا.", invalidPhone: "أدخل رقم هاتف مصريًا صحيحًا.", numbersOnly: "يرجى كتابة رسالة، وليس أرقامًا فقط.", invalidMessage: "استخدم الحروف والأرقام وعلامات الترقيم المعتادة.", fixErrors: "يرجى مراجعة الحقول المحددة.", success: "تم إرسال رسالتك.", sendError: "تعذر إرسال رسالتك. يرجى المحاولة لاحقًا."
      },
      redesign: {
        heroTag: "بداية أفضل لرحلتك", explore: "استكشف العقارات", story: "قصتنا", heroNote: "ابحث عن مكان يشبهك.", imageNote: "ابحث عن مكانك",
        curated: "عقارات مختارة", listingTitle: "استكشف مكانك القادم", listingIntro: "تصفح العقارات المتاحة واستخدم المرشحات للوصول إلى ما يناسبك.", searchPlaceholder: "ابحث بالموقع أو العنوان", searchAction: "ابحث عن عقارات", noResults: "لم نجد عقارات. جرّب تغيير معايير البحث.", imageUnavailable: "الصورة غير متاحة", loadingHomes: "جارٍ تحميل العقارات", loadingMap: "جارٍ تحميل الخريطة", houseType: "نوع العقار", listingPurpose: "إيجار أو بيع", purpose_any: "إيجار أو بيع", purpose_rent: "للإيجار", purpose_sale: "للبيع", priceRange: "نطاق السعر", anyType: "كل أنواع العقارات", anyPrice: "كل الأسعار", type_house: "منزل", type_apartment: "شقة", type_condo: "شقة تمليك", type_townhouse: "تاون هاوس",
        cityFilter: "المدينة", anyCity: "كل المدن", resetFilters: "إعادة ضبط المرشحات", switchToDark: "التبديل إلى الوضع الداكن", switchToLight: "التبديل إلى الوضع الفاتح", beds: "غرف نوم", baths: "حمامات", viewListing: "عرض العقار", priceUnit: "ج.م", nearbyTitle: "اعثر على عقارات قريبة", nearbyIntro: "شارك موقعك أو اختر نقطة على الخريطة.", useLocation: "استخدم موقعي", locating: "جارٍ تحديد الموقع…", chooseOnMap: "اختر من الخريطة", nearMyLocation: "بالقرب من موقعي", nearMapPin: "بالقرب من علامة الخريطة", withinKm: "ضمن {{count}} كم", anyDistance: "أي مسافة", clearLocation: "إزالة مرشح الموقع", locationUnavailable: "يتطلب موقع الجهاز HTTPS أو localhost ومتصفحًا يدعمه. اختر نقطة على الخريطة بدلًا من ذلك.", locationDenied: "الوصول إلى الموقع محظور. اسمح به من إعدادات المتصفح أو اختر نقطة على الخريطة.", locationFailed: "تعذر على جهازك تحديد موقعه. اختر نقطة على الخريطة بدلًا من ذلك.", mapPickHint: "اضغط على الخريطة للبحث بالقرب منها", mapPinHint: "نعرض العقارات القريبة من هذه النقطة", viewNearbyResults: "عرض النتائج: {{count}}", nearestFirst: "الأقرب أولًا · النتائج: {{count}}", distanceAway: "على بعد {{distance}} كم", viewProperty: "عرض العقار",
        ownerTag: "لملاك العقارات", ownerTitle: "هل لديك عقار لعرضه؟", ownerIntro: "أضف عقارك وساعد الشخص المناسب في العثور عليه.", ownerAction: "أضف عقارك",
        aboutTag: "عن ريل إستيت", aboutTitle: "هنا تبدأ حكايتك القادمة.", aboutIntro: "نسهّل عليك استكشاف العقارات المتاحة ومقارنة التفاصيل والتواصل مع أصحاب الإعلانات.", aboutProcess: "طريق أوضح إلى المكان المناسب.", aboutProcessIntro: "أدوات بسيطة تنقلك من البحث إلى التواصل.", discover: "اكتشف", discoverText: "تصفح العقارات المتاحة وحدد ما يهمك في البحث.", favorites: "احتفظ بالمفضلة", favoritesText: "احفظ العقارات التي تريد الرجوع إليها بسهولة.", connect: "تواصل", connectText: "اطّلع على تفاصيل العقار وتواصل مع صاحبه.",
        footerTitle: "ابدأ فصلًا جديدًا.", footerIntro: "اكتشف مكانًا يتسع للحياة التي تريدها.", footerExplore: "استكشف", footerContact: "تواصل معنا", footerEmail: "راسلنا", rights: "جميع الحقوق محفوظة.", footerNote: "صُنع للأماكن التي نسميها بيتًا.",
        contactTitle: "لنتحدث عن خطوتك القادمة.", contactIntro: "هل لديك سؤال عن عقار أو عن عرض عقارك؟ أرسل لنا رسالة وسنرد عليك.",
        notFoundEyebrow: "٤٠٤ / الصفحة غير موجودة", notFoundTitle: "لنساعدك في العثور على طريقك للمنزل.", notFoundIntro: "ربما انتقلت هذه الصفحة. عد لاستكشاف العقارات المتاحة.", editUnavailable: "العقار غير متاح", editUnavailableIntro: "تعذر فتح هذا الإعلان للتعديل. تأكد من أنه تابع لحسابك."
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

// Handle Dynamic HTML Language Attributes on Change
const applyDirection = (lng) => {
  const dir = lng === "ar" ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
};

// Apply on load
applyDirection(i18n.language);

// Bind change event
i18n.on("languageChanged", applyDirection);

export default i18n;
