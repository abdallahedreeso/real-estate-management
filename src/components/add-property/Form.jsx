import { useState, useEffect, useRef } from "react";
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
import PropTypes from "prop-types";
import PropertyLocationPicker from "./PropertyLocationPicker";
import { ownedImagePaths } from "@/api/propertyImages";
import listingHero from "../../assets/img/home-hero-v2.webp";
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
  const [position, setPosition] = useState(null);
  const [errors, setErrors] = useState({});
  const formColumnRef = useRef(null);
  const scrollToErrorOnRender = useRef(false);
  const { isDarkMode } = useTheme();

  const supabase = useSupabaseClient();
  const navigate = useNavigate();
  const { userId, getToken } = useAuth();

  const numericOnlyRegex = /^\d+$/;
  const zipCodeRegex = /^\d{3,9}$/;
  const egyptianPhoneRegex = /^(?:\+20|0020)?01[0125]\d{8}$/;

  useEffect(() => {
    if (property) {
      setTitle(property.title || "");
      setPrice(property.price?.toString() || "");
      setPropertyType(property.property_type || null);
      setDescription(property.description || "");
      setCountry(property.country || "egypt");
      setState(property.state || null);
      setCity(property.city || "");
      setZip(property.zip_code || "");
      setAddress(property.address || "");
      setBedrooms(property.Bedrooms?.toString() || "");
      setBathrooms(property.Bathrooms?.toString() || "");
      setParkingSpaces(property.ParkingSpaces?.toString() || "");
      setSurfaceArea(property.surface_area?.toString() || "");
      setPhone(property.seller_phone || "");
      setImages((property.images || []).map((url, index) => ({
        uid: `existing-${index}`, name: `Property photo ${index + 1}`, status: "done", url,
      })));
      const latitude = property.latitude ?? property.lat;
      const longitude = property.longitude ?? property.lng;
      const lat = Number(latitude);
      const lng = Number(longitude);
      if (latitude != null && longitude != null && latitude !== "" && longitude !== "" && Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        setPosition([lat, lng]);
      }
    }
  }, [property]);

  useEffect(() => {
    if (!scrollToErrorOnRender.current) return;
    scrollToErrorOnRender.current = false;
    const firstError = formColumnRef.current?.querySelector(
      ".ant-form-item-has-error, #property-photos .property-field-error, #property-location .property-field-error"
    );
    if (!firstError) return;
    const target = firstError.closest("#property-photos, #property-location") || firstError;
    window.scrollTo({
      top: window.scrollY + target.getBoundingClientRect().top - 28,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, [errors]);

  const validate = () => {
    let newErrors = {};

    if (!title.trim()) {
      newErrors.title = t("validation.titleRequired");
    } else if (numericOnlyRegex.test(title)) {
      newErrors.title = t("validation.numbersOnly");
    }

    if (!price) {
      newErrors.price = t("validation.priceRequired");
    } else if (!/^\d+(?:\.\d{1,2})?$/.test(price) || Number(price) <= 0) {
      newErrors.price = t("validation.positiveNumbers");
    }

    if (!propertyType) {
      newErrors.propertyType = t("validation.typeRequired");
    }

    if (!description.trim() || description.trim().length < 20) {
      newErrors.description = t("propertyForm.descriptionRequired");
    } else if (numericOnlyRegex.test(description)) {
      newErrors.description = t("validation.descNumbersOnly");
    }

    if (!state) {
      newErrors.state = t("validation.stateRequired");
    }

    if (!city.trim()) {
      newErrors.city = t("propertyForm.cityRequired");
    } else if (numericOnlyRegex.test(city)) {
      newErrors.city = t("validation.cityNumbersOnly");
    }

    if (zip && !zipCodeRegex.test(zip)) {
      newErrors.zip = t("validation.zipLength");
    }

    if (!address.trim()) {
      newErrors.address = t("validation.addressRequired");
    } else if (numericOnlyRegex.test(address)) {
      newErrors.address = t("validation.numbersOnly");
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
    } else if (!numericOnlyRegex.test(surfaceArea) || Number(surfaceArea) <= 0) {
      newErrors.surfaceArea = t("validation.positiveNumbers");
    }

    if (!phone) {
      newErrors.phoneNumber = t("validation.phoneRequired");
    } else if (!egyptianPhoneRegex.test(phone)) {
      newErrors.phoneNumber = t("validation.phoneValid");
    }

    if (!position) newErrors.location = t("propertyForm.locationRequired");
    if (images.length === 0) newErrors.images = t("propertyForm.imagesRequired");

    scrollToErrorOnRender.current = Object.keys(newErrors).length > 0;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const props = {
    listType: "picture",
    fileList: images,
    onChange: ({ fileList }) => {
      if (fileList.length > 10) message.error(t("propertyForm.imageLimit"));
      setImages(fileList.slice(0, 10));
      if (fileList.length) setErrors((current) => ({ ...current, images: undefined }));
    },
    beforeUpload: (file) => {
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) {
        message.error(t("propertyForm.imageInvalid"));
        return Upload.LIST_IGNORE;
      }
      if (images.length >= 10) {
        message.error(t("propertyForm.imageLimit"));
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    accept: "image/png,image/jpeg,image/webp",
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
      setLoading(true);
      const uploadedPaths = [];
      try {
        if (!userId) throw new Error("Sign in is required to publish a property");
        const token = await getToken({ template: "supabase" });
        if (!token) throw new Error("Supabase access token is unavailable");
        const imageUrls = [];
        for (const image of images) {
          if (image.url && !image.originFileObj) {
            imageUrls.push(image.url);
            continue;
          }
          const source = image.originFileObj || image;
          const compressedFile = await compressImage(source);
          const path = `${userId}/${crypto.randomUUID()}.webp`;
          const { error: uploadError } = await supabase.storage.from("images").upload(path, compressedFile, { contentType: "image/webp" });
          if (uploadError) throw uploadError;
          uploadedPaths.push(path);
          imageUrls.push(supabase.storage.from("images").getPublicUrl(path).data.publicUrl);
        }

      // Safe integer cast payloads right before transmission
      let propertyData = {
        title: title.trim(),
        price: Number(price),
        property_type: propertyType,
        description: description.trim(),
        country,
        state,
        city: city.trim(),
        zip_code: zip,
        address: address.trim(),
        Bedrooms: parseInt(bedrooms, 10) || 0,
        Bathrooms: parseInt(bathrooms, 10) || 0,
        ParkingSpaces: parseInt(parkingSpaces, 10) || 0,
        surface_area: parseInt(surfaceArea, 10),
        seller_phone: phone,
        images: imageUrls,
        file_list: imageUrls.map((url, index) => ({ uid: `image-${index}`, name: `Property photo ${index + 1}`, status: "done", url })),
        latitude: position[0],
        longitude: position[1],
      };

        if (property && id) {
          await UpdateData(supabase, propertyData, id, userId);
          const removedUrls = (property.images || []).filter((url) => !imageUrls.includes(url));
          const removedPaths = ownedImagePaths(removedUrls, userId);
          if (removedPaths.length) {
            const { error: cleanupError } = await supabase.storage.from("images").remove(removedPaths);
            if (cleanupError) console.warn("Could not clean up removed property photos:", cleanupError);
          }
        } else {
          await InsertData(supabase, propertyData, userId);
        }
        message.success(t("toast.submitSuccess"));
        navigate("/MyProperty");
      } catch (error) {
        console.error("Could not save property:", error);
        if (uploadedPaths.length) await supabase.storage.from("images").remove(uploadedPaths);
        message.error(t("toast.submitError"));
      } finally {
        setLoading(false);
      }
    } else {
      message.error(t("toast.fixErrors"));
    }
  };

  // High-performance theme classes helper
  const inputThemeClasses = `h-12 rounded-xl text-base px-4 border transition-all duration-200 ${
    isDarkMode
      ? "bg-gray-700 text-white border-gray-600 focus:bg-gray-600 focus:border-teal-600 hover:border-gray-500"
      : "bg-white text-gray-800 border-gray-300 focus:bg-white focus:border-teal-700 hover:border-gray-400"
  }`;

  return (
    <div className="listing-editor-page">
      <section className="listing-editor-hero" aria-labelledby="listing-editor-title">
        <div className="site-container listing-editor-hero-grid">
          <div className="listing-editor-hero-copy">
            <span className="listing-editor-hero-index">{t("propertyForm.heroIndex")}</span>
            <h1 id="listing-editor-title">{property ? t("propertyForm.editHeroTitle") : t("propertyForm.heroTitle")}</h1>
            <p>{t("propertyForm.heroIntro")}</p>
          </div>
          <div className="listing-editor-hero-image"><img src={listingHero} alt="" aria-hidden="true" /></div>
        </div>
      </section>
      <div className="site-container listing-editor-layout">
        <aside className="listing-editor-aside" aria-label={t("propertyForm.guideTitle")}>
          <div className="listing-editor-aside-inner">
            <p className="listing-editor-aside-title">{t("propertyForm.guideTitle")}</p>
            <nav className="listing-editor-step-nav" aria-label={t("propertyForm.guideTitle")}>
              <a href="#property-details"><span>01</span>{t("propertyForm.guideDetails")}</a>
              <a href="#property-photos"><span>02</span>{t("propertyForm.guidePhotos")}</a>
              <a href="#property-location"><span>03</span>{t("propertyForm.guideLocation")}</a>
            </nav>
            <p className="listing-editor-aside-note">{t("propertyForm.guideNote")}</p>
          </div>
        </aside>
      <div ref={formColumnRef} className="listing-editor-form-column">
      <Spin spinning={loading} size="large">
        <Card
          className={`listing-form-card ${
            isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-100 text-gray-800"
          }`}
        >
          <div className="listing-editor-card-heading">
            <Title level={2}>
              {property ? t("propertyForm.editFormTitle") : t("form.postAd")}
            </Title>
            <p>{t("propertyForm.intro")}</p>
          </div>

          <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
            <div id="property-details" className="property-section-heading property-form-step-heading"><div><span className="property-step">{t("propertyForm.detailsStep")}</span><h3>{t("propertyForm.detailsTitle")}</h3></div></div>
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
              label={<span className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t("form.description")}<span className="text-red-500 ml-1">*</span></span>}
              validateStatus={errors.description ? "error" : ""}
              help={errors.description}
            >
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={`rounded-xl text-base p-4 border transition-all duration-200 ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600 focus:bg-gray-600 focus:border-teal-600 hover:border-gray-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                    : "bg-gray-50 text-gray-800 border-gray-200 focus:bg-white focus:border-teal-600 hover:border-gray-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]"
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
                label={<span className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t("form.city")}<span className="text-red-500 ml-1">*</span></span>}
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
            <div id="property-photos" className="mb-6">
              <div className="property-section-heading property-form-step-heading"><div><span className="property-step">{t("propertyForm.photosStep")}</span><h3>{t("propertyForm.photosTitle")}</h3></div></div>
              <Upload
                {...props}
                className={`property-upload w-full ${isDarkMode ? "dark-upload" : ""}`}
                disabled={!isOnline}
                listType="picture-card"
              >
                {images.length < 10 && <div className="property-upload-prompt">
                  <UploadOutlined aria-hidden="true" />
                  <strong>{t("form.upload")}</strong>
                  <span>{t("propertyForm.imageHelp")}</span>
                </div>}
              </Upload>
              {errors.images && <p role="alert" className="property-field-error">{errors.images}</p>}
            </div>

            <PropertyLocationPicker position={position} onChange={(next) => { setPosition(next); setErrors((current) => ({ ...current, location: undefined })); }} error={errors.location} />

            {/* Premium Gilded Accent Submit Button */}
            <Form.Item className="listing-editor-submit">
              <Tooltip title={!isOnline ? t("network.offline") : ""}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  disabled={!isOnline}
                  className="property-submit-button"
                >
                  {property ? t("propertyForm.saveChanges") : t("propertyForm.publish")}
                </Button>
              </Tooltip>
            </Form.Item>
          </Form>
        </Card>
      </Spin>
      </div>
      </div>
    </div>
  );
}

AntdForm.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  property: PropTypes.shape({
    title: PropTypes.string,
    price: PropTypes.number,
    property_type: PropTypes.string,
    country: PropTypes.string,
    description: PropTypes.string,
    state: PropTypes.string,
    city: PropTypes.string,
    zip_code: PropTypes.string,
    address: PropTypes.string,
    Bedrooms: PropTypes.number,
    Bathrooms: PropTypes.number,
    ParkingSpaces: PropTypes.number,
    surface_area: PropTypes.number,
    seller_phone: PropTypes.string,
    file_list: PropTypes.array,
    images: PropTypes.array,
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
};
