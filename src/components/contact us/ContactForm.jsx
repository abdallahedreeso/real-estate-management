import { useState } from "react";
import { Input, Button, Card, Form, Typography, message, Spin } from "antd";
import emailjs from "emailjs-com";
import { useTheme } from "../../context/ThemeContext";
const { TextArea } = Input;
const { Title } = Typography;

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const { isDarkMode } = useTheme();

  const englishRegex = /^[a-zA-Z0-9\s.,'-]+$/;
  const numericOnlyRegex = /^\d+$/;
  const englishLettersOnlyRegex = /^[a-zA-Z\s]+$/;
  const egyptianPhoneRegex = /^(?:\+20|0020)?01[0125]\d{8}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Email regex

  const validate = () => {
    let newErrors = {};

    if (!subject) {
      newErrors.subject = "Subject is required.";
    } else if (!englishLettersOnlyRegex.test(subject)) {
      newErrors.subject = "Field must contain only English letters.";
    }

    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!body) {
      newErrors.body = "body is required.";
    }
    if (numericOnlyRegex.test(body)) {
      newErrors.body = "body cannot consist only of numbers.";
    } else if (!englishRegex.test(body)) {
      newErrors.body = "body must contain only English characters.";
    }
    if (!firstName) {
      newErrors.firstName = "First Name is required.";
    } else if (firstName && !englishLettersOnlyRegex.test(firstName)) {
      newErrors.firstName = "Field must contain only English letters.";
    }

    if (!lastName) {
      newErrors.lastName = "Last Name is required.";
    } else if (lastName && !englishLettersOnlyRegex.test(lastName)) {
      newErrors.lastName = "Field must contain only English letters.";
    }

    if (!phone) {
      newErrors.phoneNumber = "Phone number is required.";
    } else if (!egyptianPhoneRegex.test(phone)) {
      newErrors.phoneNumber = "Enter a valid egyptian phone number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      let formData = {
        subject,
        email,
        body,
        firstName,
        lastName,
        seller_phone: phone,
      };
      setLoading(true);
      emailjs
        .send(
          "service_14n2tub",
          "template_7jh3nau",
          formData,
          "wTm29m44MLbQaNTd3"
        )
        .then((response) => {
          setLoading(false);
          console.log(
            "Email sent successfully!",
            response.status,
            response.text
          );
          message.success("Form submitted successfully");
          setFirstName("");
          setLastName("");
          setSubject("");
          setEmail("");
          setBody("");
          setPhone("");
        })
        .catch((err) => {
          console.error("Failed to send email.", err);
          message.error("server side error, please try again later");
        });
    } else {
      message.error("Please fix the errors.");
    }
  };

  return (
    <>
      <Spin spinning={loading} size="large" className="mt-24">
        <Card
          style={{ maxWidth: "600px", margin: "20px auto", padding: "20px" }}
          className={isDarkMode ? "bg-gray-800 border-gray-700" : ""}
        >
          <Title level={3} className={isDarkMode ? "text-gray-200" : ""}>Contact Us</Title>
          <Form layout="vertical" onFinish={handleSubmit}>
            <div className="flex justify-between gap-2">
              <div className="flex flex-col w-1/2">
                <Form.Item
                  label={<span className={isDarkMode ? "text-gray-300" : ""}>First Name<span className="text-red-600">*</span></span>}
                  validateStatus={errors.firstName ? "error" : ""}
                  help={errors.firstName}
                >
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    
                    className={isDarkMode ? "bg-gray-700 text-white border-gray-600" : ""}
                  />
                </Form.Item>
              </div>
              <div className="flex flex-col w-1/2">
                <Form.Item
                  label={<span className={isDarkMode ? "text-gray-300" : ""}>Last Name<span className="text-red-600">*</span></span>}
                  validateStatus={errors.lastName ? "error" : ""}
                  help={errors.lastName}
                >
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    
                    className={isDarkMode ? "bg-gray-700 text-white border-gray-600" : ""}
                  />
                </Form.Item>
              </div>
            </div>
            <Form.Item
              label={<span className={isDarkMode ? "text-gray-300" : ""}>Email<span className="text-red-600">*</span></span>}
              validateStatus={errors.email ? "error" : ""}
              help={errors.email}
            >
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                
                className={isDarkMode ? "bg-gray-700 text-white border-gray-600" : ""}
              />
            </Form.Item>
            <Form.Item
              label={<span className={isDarkMode ? "text-gray-300" : ""}>Subject<span className="text-red-600">*</span></span>}
              validateStatus={errors.subject ? "error" : ""}
              help={errors.subject}
            >
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                
                className={isDarkMode ? "bg-gray-700 text-white border-gray-600" : ""}
              />
            </Form.Item>
            <Form.Item
              label={<span className={isDarkMode ? "text-gray-300" : ""}>Phone Number<span className="text-red-600">*</span></span>}
              validateStatus={errors.phoneNumber ? "error" : ""}
              help={errors.phoneNumber}
            >
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                
                className={isDarkMode ? "bg-gray-700 text-white border-gray-600" : ""}
              />
            </Form.Item>
            <Form.Item
              label={<span className={isDarkMode ? "text-gray-300" : ""}>body<span className="text-red-600">*</span></span>}
              validateStatus={errors.body ? "error" : ""}
              help={errors.body}
            >
              <TextArea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                
                rows={8}
                className={isDarkMode ? "bg-gray-700 text-white border-gray-600" : ""}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="Dashed"
                htmlType="submit"
                block
                className={`mt-2 ${isDarkMode 
                  ? "bg-violet-700 text-white hover:bg-violet-600 active:bg-violet-700" 
                  : "bg-indigo-500 text-white hover:bg-indigo-600 active:bg-indigo-500"}`}
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Spin>
    </>
  );
}
