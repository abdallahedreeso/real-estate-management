export const GOVERNORATES = [
  ["cairo", "Cairo", "القاهرة"], ["giza", "Giza", "الجيزة"],
  ["alexandria", "Alexandria", "الإسكندرية"], ["aswan", "Aswan", "أسوان"],
  ["asyut", "Asyut", "أسيوط"], ["beheira", "Beheira", "البحيرة"],
  ["beni_suef", "Beni Suef", "بني سويف"], ["dakahlia", "Dakahlia", "الدقهلية"],
  ["damietta", "Damietta", "دمياط"], ["faiyum", "Faiyum", "الفيوم"],
  ["gharbia", "Gharbia", "الغربية"], ["ismailia", "Ismailia", "الإسماعيلية"],
  ["kafr_el_sheikh", "Kafr El Sheikh", "كفر الشيخ"], ["luxor", "Luxor", "الأقصر"],
  ["matruh", "Matruh", "مطروح"], ["minya", "Minya", "المنيا"],
  ["monufia", "Monufia", "المنوفية"], ["new_valley", "New Valley", "الوادي الجديد"],
  ["north_sinai", "North Sinai", "شمال سيناء"], ["port_said", "Port Said", "بورسعيد"],
  ["qalyubia", "Qalyubia", "القليوبية"], ["qena", "Qena", "قنا"],
  ["red_sea", "Red Sea", "البحر الأحمر"], ["sharqia", "Sharqia", "الشرقية"],
  ["sohag", "Sohag", "سوهاج"], ["south_sinai", "South Sinai", "جنوب سيناء"],
  ["suez", "Suez", "السويس"],
];

export const governorateLabel = (value, language) => {
  const entry = GOVERNORATES.find(([key]) => key === String(value || "").toLowerCase());
  return entry ? entry[language?.startsWith("ar") ? 2 : 1] : value;
};
