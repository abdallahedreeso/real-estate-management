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
  const { userId } = useAuth();

  const englishRegex = /^[a-zA-Z0-9\s.,'-]+$/;
  const numericOnlyRegex = /^\d+$/;
  const zipCodeRegex = /^\d{3,9}$/;
  const englishLettersNumericOnlyRegex = /^[a-zA-Z0-9\s]+$/;
  const egyptianPhoneRegex = /^(?:\+20|0020)?01[0125]\d{8}$/;

  useEffect(() => {
    if (property) {
      setTitle(property.title);
      setPrice(property.price);
      setPropertyType(property.property_type);
      setDescription(property.description);
      setState(property.state);
      setCity(property.city);
      setZip(property.zip_code);
      setAddress(property.address);
      setBedrooms(property.Bedrooms);
      setBathrooms(property.Bathrooms);
      setParkingSpaces(property.ParkingSpaces);
      setSurfaceArea(property.surface_area);
      setPhone(property.seller_phone);
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
    } else if (!numericOnlyRegex.test(price) || parseInt(price) < 0) {
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
    } else if (!numericOnlyRegex.test(bedrooms) || parseInt(bedrooms) < 0) {
      newErrors.bedrooms = t("validation.positiveNumbers");
    }

    if (!bathrooms) {
      newErrors.bathrooms = t("validation.bathroomsRequired");
    } else if (!numericOnlyRegex.test(bathrooms) || parseInt(bathrooms) < 0) {
      newErrors.bathrooms = t("validation.positiveNumbers");
    }

    if (!parkingSpaces) {
      newErrors.parkingSpaces = t("validation.parkingRequired");
    } else if (
      !numericOnlyRegex.test(parkingSpaces) ||
      parseInt(parkingSpaces) < 0
    ) {
      newErrors.parkingSpaces = t("validation.positiveNumbers");
    }

    if (!surfaceArea) {
      newErrors.surfaceArea = t("validation.surfaceRequired");
    } else if (
      !numericOnlyRegex.test(surfaceArea) ||
      parseInt(surfaceArea) < 0
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
      // 1. Initial State: Signal compression has started
      if (onProgress) onProgress({ percent: 15 });

      // 2. Perform Client-Side Compression
      const compressedFile = await compressImage(file);
      if (onProgress) onProgress({ percent: 45 });

      // 3. Dispatch WebP file to Supabase Bucket
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
      let propertyData = {
        title,
        price,
        property_type: propertyType,
        description,
        country,
        state,
        city,
        zip_code: zip,
        address: address,
        Bedrooms: bedrooms,
        Bathrooms: bathrooms,
        ParkingSpaces: parkingSpaces,
        surface_area: surfaceArea,
        seller_phone: phone,
        images: imageUrls,
        file_list: images,
      };
      setLoading(true);
      let response;
      if (property && id) {
        response = await UpdateData(supabase, propertyData, id, userId);
      } else {
        response = await InsertData(supabase, propertyData);
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

  return (
    <>
      <Spin spinning={loading} size="large" className="mt-40">
        <Card
          style={{ maxWidth: "600px", margin: "20px auto", padding: "20px" }}
          className={isDarkMode ? "bg-gray-800 border-gray-700 text-white" : ""}
        >
          <Title level={3} className={isDarkMode ? "text-gray-200" : ""}>
            {t("form.postAd")}
          </Title>
          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label={<span className={isDarkMode ? "text-gray-300" : ""}>{t("form.title")}<span className="text-red-600">*</span></span>}
              validateStatus={errors.title ? "error" : ""}
              help={errors.title}
            >
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={isDarkMode ? "bg-gray-700 text-white border-gray-600" : ""}
              />
            </Form.Item>

            <Form.Item
              label={<span className={isDarkMode ? "text-gray-300" : ""}>{t("form.price")}<span className="text-red-600">*</span></span>}
              validateStatus={errors.price ? "error" : ""}
              help={errors.price}
            >
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={isDarkMode ? "bg-gray-700 text-white border-gray-600" : ""}
              />
            </Form.Item>

            <Form.Item
              label={<span className={isDarkMode ? "text-gray-300" : ""}>{t("form.propertyType")}<span className="text-red-600">*</span></span>}
              validateStatus={errors.propertyType ? "error" : ""}
              help={errors.propertyType}
            >
              <Select
                value={propertyType}
                onChange={setPropertyType}
                className={isDarkMode ? "dark-select" : ""}
                dropdownClassName={isDarkMode ? "dark-dropdown" : ""}
              >
                <Option value="rent">{t("form.forRent")}</Option>
                <Option value="sale">{t("form.forSale")}</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label={<span className={isDarkMode ? "text-gray-300" : ""}>{t("form.description")}</span>}
              validateStatus={errors.description ? "error" : ""}
              help={errors.description}
            >
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={isDarkMode ? "bg-gray-700 text-white border-gray-600" : ""}
              />
            </Form.Item>

            <div className="flex justify-between gap-2">
              <div className="flex flex-col w-1/2">
                <Form.Item label={<span className={isDarkMode ? "text-gray-300" : ""}>{t("form.country")}<span className="text-red-600">*</span></span>}>
                  <Select
                    value={country}
                    onChange={setCountry}
                    className={isDarkMode ? "dark-select" : ""}
                    dropdownClassName={isDarkMode ? "dark-dropdown" : ""}
                  >
                    <Option value="egypt">{t("form.egypt")}</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label={<span className={isDarkMode ? "text-gray-300" : ""}>{t("form.state")}<span className="text-red-600">*</span></span>}
                  validateStatus={errors.state ? "error" : ""}
                  help={errors.state}
                >
                  <Select
                    value={state}
                    onChange={setState}
                    className={isDarkMode ? "dark-select" : ""}
                    dropdownClassName={isDarkMode ? "dark-dropdown" : ""}
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
                    <Option value="qanatir">Qena</Option>
                    <Option value="red_sea">Red Sea</Option>
                    <Option value="sharqia">Sharqia</Option>
                    <Option value="sohag">Sohag</Option>
                    <Option value="south_sinai">South Sinai</Option>
                    <Option value="suez">Suez</Option>
                  </Select>
                </Form.Item>
              </div>

              <div className="flex flex-col w-1/2">
                <Form.Item
                  label={<span className={isDarkMode ? "text-gray-300" : ""}>{t("form.city")}</span>}
                  validateStatus={errors.city ? "error" : ""}
                  help={errors.city}
                >
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={isDarkMode ? "bg-gray-700 text-white border-gray-600" : ""}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className={isDarkMode ? "text-gray-300" : ""}>{t("form.zipCode")}</span>}
                  validateStatus={errors.zip ? "error" : ""}
                  help={errors.zip}
                >
                  <Input
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className={isDarkMode ? "bg-gray-700 text-white border-gray-600" : ""}
                  />
                </Form.Item>
              </div>
            </div>

            <Form.Item
              label={<span className={isDarkMode ? "text-gray-300" : ""}>{t("form.address")}<span className="text-red-600">*</span></span>}
              validateStatus={errors.address ? "error" : ""}
              help={errors.address}
            >
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={isDarkMode ? "bg-gray-700 text-white border-gray-600" : ""}
              />
            </Form.Item>

            <div className="flex justify-between gap-2">
              <div className="flex flex-col w-1/2">
                <Form.Item
                  label={<span className={isDarkMode ? "text-gray-300" : ""}>{t("form.bedrooms")}<span className="text-red-600">*</span></span>}
                  validateStatus={errors.bedrooms ? "error" : ""}
                  help={errors.bedrooms}
                >
                  <Input
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className={isDarkMode ? "bg-gray-700 text-white border-gray-600" : ""}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className={isDarkMode ? "text-gray-300" : ""}>{t("form.bathrooms")}<span className="text-red-600">*</span></span>}
                  validateStatus={errors.bathrooms ? "error" : ""}
                  help={errors.bathrooms}
                >
                  <Input
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className={isDarkMode ? "bg-gray-700 text-white border-gray-600" : ""}
                  />
                </Form.Item>
              </div>

              <div className="flex flex-col w-1/2">
                <Form.Item
                  label={<span className={isDarkMode ? "text-gray-300" : ""}>{t("form.parking")}<span className="text-red-600">*</span></span>}
                  validateStatus={errors.parkingSpaces ? "error" : ""}
                  help={errors.parkingSpaces}
                >
                  <Input
                    value={parkingSpaces}
                    onChange={(e) => setParkingSpaces(e.target.value)}
                    className={isDarkMode ? "bg-gray-700 text-white border-gray-600" : ""}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className={isDarkMode ? "text-gray-300" : ""}>{t("form.surfaceArea")}<span className="text-red-600">*</span></span>}
                  validateStatus={errors.surfaceArea ? "error" : ""}
                  help={errors.surfaceArea}
                >
                  <Input
                    value={surfaceArea}
                    onChange={(e) => setSurfaceArea(e.target.value)}
                    className={isDarkMode ? "bg-gray-700 text-white border-gray-600" : ""}
                  />
                </Form.Item>
              </div>
            </div>

            <Form.Item
              label={<span className={isDarkMode ? "text-gray-300" : ""}>{t("form.phone")}<span className="text-red-600">*</span></span>}
              validateStatus={errors.phoneNumber ? "error" : ""}
              help={errors.phoneNumber}
            >
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={isDarkMode ? "bg-gray-700 text-white border-gray-600" : ""}
              />
            </Form.Item>

            <Upload
              {...props}
              customRequest={customRequest}
              className={isDarkMode ? "dark-upload" : ""}
              disabled={!isOnline}
            >
              <Button
                icon={<UploadOutlined />}
                disabled={!isOnline}
                className={isDarkMode ? "bg-gray-700 text-white border-gray-600 hover:bg-gray-600" : ""}
              >
                {t("form.upload")}
              </Button>
            </Upload>

            <Form.Item>
              <Tooltip title={!isOnline ? t("network.offline") : ""}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  disabled={!isOnline}
                  className={`mt-2 ${
                    isDarkMode
                      ? "bg-violet-700 hover:bg-violet-600 active:bg-violet-700"
                      : "bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-700"
                  }`}
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
