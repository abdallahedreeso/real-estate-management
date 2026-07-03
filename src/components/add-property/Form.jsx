import { useState, useEffect } from "react";
import {
  Input,
  Select,
  Button,
  Card,
  Form,
  Typography,
  message,
  Upload,
  Spin,
  Tooltip,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useHouseStore } from "@/store/useHouseStore";
import InsertData from "@/api/add-property/InsertData";
import UpdateData from "@/api/update-property/UpdateData";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "@clerk/clerk-react";
import "../../assets/style/components/form.css";

import useSupabaseClient from "@/backend/supabase/supabase";
import { UploadOutlined } from "@ant-design/icons";
const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

// Client-Side Image Resizing & WebP Compression Helper
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        const MAX_WIDTH = 1200;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
              const compressedFile = new File([blob], `${nameWithoutExt}.webp`, {
                type: "image/webp",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error("Canvas compression yielded null blob"));
            }
          },
          "image/webp",
          0.75 // 75% quality conversion
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function AntdForm({ property, id }) {
  const { t } = useTranslation();
  const isOnline = useHouseStore((state) => state.isOnline);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [propertyType, setPropertyType] = useState(null);
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("egypt");
  const [state, setState] = useState(null);
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [address, setAddress] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [parkingSpaces, setParkingSpaces] = useState("");
  const [surfaceArea, setSurfaceArea] = useState("");
  const [phone, setPhone] = useState("");
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const { isDarkMode } = useTheme();

  const supabase = useSupabaseClient();
  const navigate = useNavigate();
  const { userId, getToken } = useAuth();

  const englishRegex = /^[a-zA-Z0-9\s.,'-]+$/;
  const numericOnlyRegex = /^\d+$/;
  const zipCodeRegex = /^\d{3,9}$/;
  const englishLettersNumericOnlyRegex = /^[a-zA-Z0-9\s]+$/;
  const egyptianPhoneRegex = /^(?:\+20|0020)?01[0125]\d{8}$/;

  useEffect(() => {
    if (property) {
      setTitle(property.title || "");
      setPrice(property.price?.toString() || "");
      setPropertyType(property.property_type || null);
      setDescription(property.description || "");
      setState(property.state || null);
      setCity(property.city || "");
      setZip(property.zip_code || "");
      setAddress(property.address || "");
      setBedrooms(property.Bedrooms?.toString() || "");
      setBathrooms(property.Bathrooms?.toString() || "");
      setParkingSpaces(property.ParkingSpaces?.toString() || "");
      setSurfaceArea(property.surface_area?.toString() || "");
      setPhone(property.seller_phone || "");
      setImages(property.file_list || []);
    }
  }, [property]);

  const validate = () => {
    let newErrors = {};

    if (!title) {
      newErrors.title = t("validation.titleRequired");
    } else if (numericOnlyRegex.test(title)) {
      newErrors.title = t("validation.numbersOnly");
    } else if (!englishRegex.test(title)) {
      newErrors.title = t("validation.englishOnly");
    }

    if (!price) {
      newErrors.price = t("validation.priceRequired");
    } else if (!numericOnlyRegex.test(price) || parseInt(price, 10) < 0) {
      newErrors.price = t("validation.positiveNumbers");
    }

    if (!propertyType) {
      newErrors.propertyType = t("validation.typeRequired");
    }

    if (description && numericOnlyRegex.test(description)) {
      newErrors.description = t("validation.descNumbersOnly");
    } else if (description && !englishRegex.test(description)) {
      newErrors.description = t("validation.descEnglishOnly");
    }

    if (!state) {
      newErrors.state = t("validation.stateRequired");
    }

    if (city && numericOnlyRegex.test(city)) {
      newErrors.city = t("validation.cityNumbersOnly");
    } else if (city && !englishLettersNumericOnlyRegex.test(city)) {
      newErrors.city = t("validation.cityLettersNumbers");
    }

    if (zip && !zipCodeRegex.test(zip)) {
      newErrors.zip = t("validation.zipLength");
    }

    if (!address) {
      newErrors.address = t("validation.addressRequired");
    } else if (numericOnlyRegex.test(address)) {
      newErrors.address = t("validation.numbersOnly");
    } else if (!englishRegex.test(address)) {
      newErrors.address = t("validation.englishOnly");
    }

    if (!bedrooms) {
      newErrors.bedrooms = t("validation.bedroomsRequired");
    } else if (!numericOnlyRegex.test(bedrooms) || parseInt(bedrooms, 10) < 0) {
      newErrors.bedrooms = t("validation.positiveNumbers");
    }

    if (!bathrooms) {
      newErrors.bathrooms = t("validation.bathroomsRequired");
    } else if (!numericOnlyRegex.test(bathrooms) || parseInt(bathrooms, 10) < 0) {
      newErrors.bathrooms = t("validation.positiveNumbers");
    }

    if (!parkingSpaces) {
      newErrors.parkingSpaces = t("validation.parkingRequired");
    } else if (
      !numericOnlyRegex.test(parkingSpaces) ||
      parseInt(parkingSpaces, 10) < 0
    ) {
      newErrors.parkingSpaces = t("validation.positiveNumbers");
    }

    if (!surfaceArea) {
      newErrors.surfaceArea = t("validation.surfaceRequired");
    } else if (
      !numericOnlyRegex.test(surfaceArea) ||
      parseInt(surfaceArea, 10) < 0
    ) {
      newErrors.surfaceArea = t("validation.positiveNumbers");
    }

    if (!phone) {
      newErrors.phoneNumber = t("validation.phoneRequired");
    } else if (!egyptianPhoneRegex.test(phone)) {
      newErrors.phoneNumber = t("validation.phoneValid");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const customRequest = async ({ file, onSuccess, onError, onProgress }) => {
    try {
      if (onProgress) onProgress({ percent: 15 });

      const compressedFile = await compressImage(file);
      if (onProgress) onProgress({ percent: 45 });

      const imageName = `${file.uid}`;
      const { data, error } = await supabase.storage
        .from("images")
        .upload(imageName, compressedFile, {
          contentType: "image/webp",
        });

      if (error) {
        onError(error);
        message.error(t("toast.uploadFailed", { name: file.name }));
      } else {
        if (onProgress) onProgress({ percent: 100 });
        onSuccess(data);
        message.success(t("toast.uploadSuccess", { name: file.name }));
      }
    } catch (error) {
      onError(error);
      message.error(t("toast.genericUploadFailed"));
    }
  };

  const props = {
    listType: "picture",
    fileList: images,
    onChange: ({ fileList }) => setImages(fileList),
    accept: "image/png, image/gif, image/jpeg",
    multiple: true,
    previewFile(file) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
      });
    },
  };

  const handleSubmit = async () => {
    if (validate()) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      let imageUrls = [];
      images.forEach((image) => {
        imageUrls.push(
          `${supabaseUrl}/storage/v1/object/public/images/${image.uid}`
        );
      });

      // Localized bounding box centered around Cairo, Egypt (base: 30.0444, 31.2357)
      const baseLat = 30.0444;
      const baseLng = 31.2357;
      const generatedLat = baseLat + (Math.random() - 0.5) * 0.06;
      const generatedLng = baseLng + (Math.random() - 0.5) * 0.06;

      // Safe integer cast payloads right before transmission
      let propertyData = {
        title,
        price: parseInt(price, 10) || 0,
        property_type: propertyType,
        description,
        country,
        state,
        city,
        zip_code: zip,
        address: address,
        Bedrooms: parseInt(bedrooms, 10) || 0,
        Bathrooms: parseInt(bathrooms, 10) || 0,
        ParkingSpaces: parseInt(parkingSpaces, 10) || 0,
        surface_area: parseInt(surfaceArea, 10) || 0,
        seller_phone: phone,
        images: imageUrls,
        file_list: images,
        lat: property?.lat ? parseFloat(property.lat) : generatedLat,
        lng: property?.lng ? parseFloat(property.lng) : generatedLng,
      };

      setLoading(true);
      let response;
      try {
        const token = await getToken({ template: "supabase" });
        if (property && id) {
          response = await UpdateData(supabase, propertyData, id, userId, token);
        } else {
          response = await InsertData(supabase, propertyData, token);
        }
      } catch (tokenErr) {
        console.error("Error acquiring dynamic JWT session token:", tokenErr);
      }
      if (response) {
        setLoading(false);
        message.success(t("toast.submitSuccess"));
        navigate("/MyProperty");
      } else {
        setLoading(false);
        message.error(t("toast.submitError"));
      }
    } else {
      message.error(t("toast.fixErrors"));
    }
  };

  // High-performance theme classes helper
  const inputThemeClasses = `h-12 rounded-xl text-base px-4 border transition-all duration-200 ${
    isDarkMode
      ? "bg-gray-700 text-white border-gray-600 focus:bg-gray-600 focus:border-violet-500 hover:border-gray-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
      : "bg-gray-50 text-gray-800 border-gray-200 focus:bg-white focus:border-violet-500 hover:border-gray-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]"
  }`;

  return (
    <>
      <Spin spinning={loading} size="large" className="mt-40">
        <Card
          className={`max-w-3xl mx-auto my-12 p-8 rounded-2xl shadow-xl transition-all duration-300 border ${
            isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-100 text-gray-800"
          }`}
        >
          <div className="mb-8 border-b pb-4 border-gray-200 dark:border-gray-700">
            <Title level={2} className={`font-extrabold ${isDarkMode ? "!text-gray-100" : "!text-gray-800"}`}>
              {t("form.postAd")}
            </Title>
            <p className="text-gray-400 text-sm mt-1">Provide listing details to showcase your property in Egypt</p>
          </div>

          <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
            {/* Title & Price Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                label={<span className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t("form.title")}<span className="text-red-500 ml-1">*</span></span>}
                validateStatus={errors.title ? "error" : ""}
                help={errors.title}
              >
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputThemeClasses}
                  placeholder="e.g. Modern Apartment in Zamalek"
                />
              </Form.Item>

              <Form.Item
                label={<span className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t("form.price")}<span className="text-red-500 ml-1">*</span></span>}
                validateStatus={errors.price ? "error" : ""}
                help={errors.price}
              >
                <Input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={inputThemeClasses}
                  placeholder="e.g. 2500000"
                />
              </Form.Item>
            </div>

            {/* Property Type & Phone Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                label={<span className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t("form.propertyType")}<span className="text-red-500 ml-1">*</span></span>}
                validateStatus={errors.propertyType ? "error" : ""}
                help={errors.propertyType}
              >
                <Select
                  value={propertyType}
                  onChange={setPropertyType}
                  className={`h-12 ${isDarkMode ? "dark-select" : ""}`}
                  dropdownClassName={isDarkMode ? "dark-dropdown" : ""}
                  placeholder="Select listing option"
                >
                  <Option value="rent">{t("form.forRent")}</Option>
                  <Option value="sale">{t("form.forSale")}</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={<span className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t("form.phone")}<span className="text-red-500 ml-1">*</span></span>}
                validateStatus={errors.phoneNumber ? "error" : ""}
                help={errors.phoneNumber}
              >
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputThemeClasses}
                  placeholder="e.g. 01012345678"
                />
              </Form.Item>
            </div>

            {/* Description (Full Width) */}
            <Form.Item
              label={<span className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t("form.description")}</span>}
              validateStatus={errors.description ? "error" : ""}
              help={errors.description}
            >
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={`rounded-xl text-base p-4 border transition-all duration-200 ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600 focus:bg-gray-600 focus:border-violet-500 hover:border-gray-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                    : "bg-gray-50 text-gray-800 border-gray-200 focus:bg-white focus:border-violet-500 hover:border-gray-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]"
                }`}
                placeholder="Describe key features, vicinity landmarks, etc..."
              />
            </Form.Item>

            {/* Country & State Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item label={<span className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t("form.country")}<span className="text-red-500 ml-1">*</span></span>}>
                <Select
                  value={country}
                  onChange={setCountry}
                  className={`h-12 ${isDarkMode ? "dark-select" : ""}`}
                  dropdownClassName={isDarkMode ? "dark-dropdown" : ""}
                >
                  <Option value="egypt">{t("form.egypt")}</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={<span className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t("form.state")}<span className="text-red-500 ml-1">*</span></span>}
                validateStatus={errors.state ? "error" : ""}
                help={errors.state}
              >
                <Select
                  value={state}
                  onChange={setState}
                  className={`h-12 ${isDarkMode ? "dark-select" : ""}`}
                  dropdownClassName={isDarkMode ? "dark-dropdown" : ""}
                  placeholder="Select governorate"
                >
                  <Option value="cairo">Cairo</Option>
                  <Option value="giza">Giza</Option>
                  <Option value="alexandria">Alexandria</Option>
                  <Option value="aswan">Aswan</Option>
                  <Option value="asyut">Asyut</Option>
                  <Option value="beheira">Beheira</Option>
                  <Option value="beni_suef">Beni Suef</Option>
                  <Option value="dakahlia">Dakahlia</Option>
                  <Option value="damietta">Damietta</Option>
                  <Option value="faiyum">Faiyum</Option>
                  <Option value="gharbia">Gharbia</Option>
                  <Option value="ismailia">Ismailia</Option>
                  <Option value="kafr_el_sheikh">Kafr El Sheikh</Option>
                  <Option value="luxor">Luxor</Option>
                  <Option value="matruh">Matruh</Option>
                  <Option value="minya">Minya</Option>
                  <Option value="monufia">Monufia</Option>
                  <Option value="new_valley">New Valley</Option>
                  <Option value="north_sinai">North Sinai</Option>
                  <Option value="port_said">Port Said</Option>
                  <Option value="qalyubia">Qalyubia</Option>
                  <Option value="qena">Qena</Option>
                  <Option value="red_sea">Red Sea</Option>
                  <Option value="sharqia">Sharqia</Option>
                  <Option value="sohag">Sohag</Option>
                  <Option value="south_sinai">South Sinai</Option>
                  <Option value="suez">Suez</Option>
                </Select>
              </Form.Item>
            </div>

            {/* City & Zip Code Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                label={<span className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t("form.city")}</span>}
                validateStatus={errors.city ? "error" : ""}
                help={errors.city}
              >
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputThemeClasses}
                  placeholder="e.g. Nasr City"
                />
              </Form.Item>

              <Form.Item
                label={<span className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t("form.zipCode")}</span>}
                validateStatus={errors.zip ? "error" : ""}
                help={errors.zip}
              >
                <Input
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className={inputThemeClasses}
                  placeholder="e.g. 11762"
                />
              </Form.Item>
            </div>

            {/* Detailed Address (Full Width) */}
            <Form.Item
              label={<span className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t("form.address")}<span className="text-red-500 ml-1">*</span></span>}
              validateStatus={errors.address ? "error" : ""}
              help={errors.address}
            >
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={inputThemeClasses}
                placeholder="e.g. Building 12, Abbas El-Akkad St."
              />
            </Form.Item>

            {/* 4-Column Layout for Bedrooms, Bathrooms, Parking & Surface Area */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Form.Item
                label={<span className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t("form.bedrooms")}<span className="text-red-500 ml-1">*</span></span>}
                validateStatus={errors.bedrooms ? "error" : ""}
                help={errors.bedrooms}
              >
                <Input
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className={inputThemeClasses}
                  placeholder="e.g. 3"
                />
              </Form.Item>

              <Form.Item
                label={<span className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t("form.bathrooms")}<span className="text-red-500 ml-1">*</span></span>}
                validateStatus={errors.bathrooms ? "error" : ""}
                help={errors.bathrooms}
              >
                <Input
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className={inputThemeClasses}
                  placeholder="e.g. 2"
                />
              </Form.Item>

              <Form.Item
                label={<span className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t("form.parking")}<span className="text-red-500 ml-1">*</span></span>}
                validateStatus={errors.parkingSpaces ? "error" : ""}
                help={errors.parkingSpaces}
              >
                <Input
                  value={parkingSpaces}
                  onChange={(e) => setParkingSpaces(e.target.value)}
                  className={inputThemeClasses}
                  placeholder="e.g. 1"
                />
              </Form.Item>

              <Form.Item
                label={<span className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t("form.surfaceArea")}<span className="text-red-500 ml-1">*</span></span>}
                validateStatus={errors.surfaceArea ? "error" : ""}
                help={errors.surfaceArea}
              >
                <Input
                  value={surfaceArea}
                  onChange={(e) => setSurfaceArea(e.target.value)}
                  className={inputThemeClasses}
                  placeholder="e.g. 150"
                />
              </Form.Item>
            </div>

            {/* Premium Full-Width Upload Zone */}
            <div className="mb-6">
              <span className={`block font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Property Images
              </span>
              <Upload
                {...props}
                customRequest={customRequest}
                className={`w-full ${isDarkMode ? "dark-upload" : ""}`}
                disabled={!isOnline}
                listType="picture-card"
              >
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer hover:border-violet-500 border-gray-300 dark:border-gray-600 transition duration-300 w-full h-[150px]">
                  <UploadOutlined className="text-3xl text-violet-600 mb-2" />
                  <p className="font-semibold text-sm">{t("form.upload")}</p>
                  <p className="text-xs text-gray-400 mt-1">Select PNG, JPG, or GIF (WebP Auto-Compression)</p>
                </div>
              </Upload>
            </div>

            {/* Premium Gilded Accent Submit Button */}
            <Form.Item className="mt-8">
              <Tooltip title={!isOnline ? t("network.offline") : ""}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  disabled={!isOnline}
                  className="h-12 rounded-xl font-bold text-base shadow-lg shadow-violet-600/30 hover:shadow-violet-600/40 active:scale-[0.98] transition-all duration-300 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border-none text-white flex items-center justify-center"
                >
                  {t("form.save")}
                </Button>
              </Tooltip>
            </Form.Item>
          </Form>
        </Card>
      </Spin>
    </>
  );
}
