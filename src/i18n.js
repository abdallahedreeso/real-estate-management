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
      },
      marketing: {
        rent: "Rent",
        dreamTitle: "Your Dream House With Us.",
        subtitle: "Find your dream home, move in now, and rent with built-in savings for your down payment. In 3 years or less, you're ready to buy.",
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
        price: "Price",
        propertyType: "Property Type",
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
        surfaceArea: "Surface Area",
        phone: "Phone Number",
        upload: "Upload",
        save: "Save",
        egypt: "Egypt"
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
      },
      marketing: {
        rent: "استأجر",
        dreamTitle: "منزل أحلامك معنا.",
        subtitle: "ابحث عن منزل أحلامك، وانتقل إليه الآن، واستأجر مع مدخرات مدمجة لدفعتك الأولى. في غضون 3 سنوات أو أقل، ستكون جاهزًا للشراء.",
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
        price: "السعر",
        propertyType: "نوع العقار",
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
        surfaceArea: "المساحة الكلية",
        phone: "رقم الهاتف",
        upload: "رفع الصور",
        save: "حفظ",
        egypt: "مصر"
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
