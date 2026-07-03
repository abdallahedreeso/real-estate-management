import { Button, message, Popconfirm, Space, Spin, Switch, Table } from "antd";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import useSupabaseClient from "../backend/supabase/supabase";
import "@/assets/style/pages/listing.css";
import { useAuth } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const Listing = () => {
  const { t } = useTranslation();
  const [properties, setProperties] = useState();
  const supabase = useSupabaseClient();
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { isDarkMode } = useTheme();

  // fetch properties
  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select(
          "property_id,title, price, state, property_type, address, is_available"
        )
        .eq("seller_id", userId);
      if (error) {
        console.error("Error fetching data:", error.message);
        setError(error.message);
        return;
      }
      const hanafy = data?.sort((a, b) => a.property_id - b.property_id);
      //   format fetching data to match table
      const formattedProperties = hanafy?.map((property) => ({
        key: property.property_id,
        property_type: property.property_type,
        price: property.price,
        title: property.title,
        state: property.state,
        address: property.address,
        is_available: property.is_available,
      }));

      setProperties(formattedProperties);
    } catch (err) {
      console.error("Error fetching data from Supabase:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (supabase && userId) {
      fetchProperties();
    }
  }, [supabase, userId]);

  // Table delete function
  const confirm = async (propertyId) => {
    if (!userId) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("property_id", propertyId)
        .eq("seller_id", userId);

      if (error) throw error;
      console.log("Property deleted successfully");

      message.success(t("listings.deleteSuccess"));
      // Re-fetch properties after deletion
      fetchProperties();
    } catch (err) {
      console.error("Error deleting property:", err.message);
      message.error(t("listings.deleteFailed"));
    } finally {
      setDeleting(false);
    }
  };

  // Toggle availability status in Supabase
  const onChange = async (propertyId, currentAvailability) => {
    if (!userId) return;
    try {
      const { error } = await supabase
        .from("properties")
        .update({ is_available: !currentAvailability }) // Toggle the current value
        .eq("property_id", propertyId)
        .eq("seller_id", userId);

      if (error) {
        console.error("Error updating is_available:", error.message);
        message.error(t("listings.updateFailed"));
      } else {
        message.success(t("listings.updateSuccess"));

        setProperties((pre) =>
          pre.map((property) =>
            property.key === propertyId
              ? { ...property, is_available: !currentAvailability }
              : property
          )
        );
      }
    } catch (err) {
      console.error("Error updating is_available:", err.message);
      message.error(t("listings.updateError"));
    }
  };

  // table header
  const columns = [
    {
      title: t("listings.title"),
      key: "title",
      dataIndex: "title",
    },
    {
      title: t("listings.propertyType"),
      dataIndex: "property_type",
      key: "property_type",
    },
    {
      title: t("listings.price"),
      dataIndex: "price",
      key: "price",
    },
    {
      title: t("listings.state"),
      dataIndex: "state",
      key: "state",
    },
    {
      title: t("listings.address"),
      dataIndex: "address",
      key: "address",
      width: 100,
    },
    {
      title: t("listings.isAvailable"),
      key: "is_available",
      render: (_, record) => (
        <Switch
          checked={record.is_available}
          onChange={() => onChange(record.key, record.is_available)}
          className={isDarkMode ? "dark-switch" : ""}
        />
      ),
    },
    {
      title: t("listings.actions"),
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Link
            to={`/MyProperty/edit/${record.key}`}
            className={`${
              isDarkMode
                ? "text-gray-300 hover:text-violet-400"
                : "text-gray-600 hover:text-indigo-500"
            }`}
            aria-label="editProperty"
          >
            <Button
              color="primary"
              variant="solid"
              className={isDarkMode ? "dark-button" : ""}
              style={{ backgroundColor: "#5B21B6", borderColor: "#4C1D95" }}
            >
              {t("listings.edit")}
            </Button>
          </Link>

          <Popconfirm
            title={t("listings.deleteConfirm")}
            description={t("listings.deleteWarning")}
            onConfirm={() => confirm(record.key)}
            okText={t("listings.yes")}
            cancelText={t("listings.no")}
            overlayClassName={isDarkMode ? "dark-popconfirm" : ""}
            getPopupContainer={(element) => element}
            placement="top"
            okButtonProps={{
              style: { backgroundColor: "#5B21B6", borderColor: "#4C1D95" },
            }}
            cancelButtonProps={{
              style: isDarkMode
                ? {
                    backgroundColor: "#374151",
                    borderColor: "#4B5563",
                    color: "#E5E7EB",
                  }
                : {},
            }}
          >
            <Button
              danger
              loading={deleting}
              className={isDarkMode ? "dark-danger-button" : ""}
            >
              {t("listings.delete")}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div
      className={`listing px-10 md:px-28 lg:px-40 mt-14 ${
        isDarkMode ? "bg-gray-900" : ""
      }`}
    >
      <h1
        className={`font-extrabold text-3xl text-center text-white ${
          isDarkMode ? "bg-violet-800" : "bg-violet-700"
        } rounded-lg px-16 py-5 mb-10`}
      >
        {t("listings.myProperties")}
      </h1>

      {loading ? (
        <Spin fullscreen size="large" />
      ) : error ? (
        <p className={isDarkMode ? "text-gray-300" : ""}>Error: {error}</p>
      ) : (
        <Table
          scroll={{ x: "max-content" }}
          dataSource={properties}
          columns={columns}
          className={isDarkMode ? "dark-table" : ""}
        />
      )}
    </div>
  );
};

export default Listing;
