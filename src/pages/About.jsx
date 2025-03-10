import { useState, useEffect } from "react";
import Image from "../assets/img/about-banner.png";
import { Avatar, Card, Carousel } from "antd";
import { useTheme } from "../context/ThemeContext";

const reviews = [
  {
    avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=1",
    id: "1",
    name: "Edrees",
    review:
      "The team at RealEstate Agency helped me find my dream home. Their attention to detail and dedication is unparalleled. Highly recommend!",
  },
  {
    avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=2",
    id: "2",
    name: "Shahd",
    review:
      "A seamless and stress-free experience from start to finish. I was able to sell my home quickly and at a great price, thanks to their excellent service.",
  },
  {
    avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=3",
    id: "3",
    name: "Rana",
    review:
      "Professional, knowledgeable, and committed to helping their clients. I had a great experience working with RealEstate Agency and would not hesitate to work with them again.",
  },
  {
    avatar: "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
    id: "4",
    name: "Youssef",
    review:
      "I couldn't have asked for a better experience. The agents were responsive and truly cared about helping me find the perfect property.",
  },
  {
    avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=4",
    id: "5",
    name: "Emad",
    review:
      "The RealEstate Agency team made the process of buying my first home so easy. They were with me every step of the way, providing valuable insights and guidance.",
  },
];

export default function About() {
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  return (
    <div className="font-sans">
      <section className={`h-full max-h-[640px] mb-8 xl:mb-32 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-r'}`}>
        <div className="flex flex-col lg:flex-row">
          <div className="lg:ml-8 xl:ml-[135px] flex flex-col items-center lg:items-start text-center lg:text-left justify-center flex-1 px-4 lg:px-0">
            <h1 className={`text-4xl lg:text-[58px] font-bold leading-none mb-6 ${isDarkMode ? 'text-violet-400' : 'text-violet-700'}`}>
              About Us
            </h1>
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : ''}`}>
              Welcome To Your RealEstate Agency
            </h2>
            <p className={`max-w-[480px] mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              A small river named Duden flows by their place and supplies it
              with the necessary regelialia...
            </p>
            <div className="max-w-[480px] text-left">
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-[480px] text-left`}>
                Our real estate agency is committed to providing exceptional
                service.
              </p>
            </div>
          </div>
          <div className="hidden lg:flex flex-1 justify-end items-end">
            <img
              src={Image}
              style={{borderRadius: "165px 0 0 0"}}
              className="max-h-full max-w-full"
              alt="Real Estate Banner"
            />
          </div>
        </div>
      </section>

      <section className={`px-4 py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="max-w-6xl mx-auto text-center">
          <h2 className={`text-3xl font-semibold mb-8 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            About Us
          </h2>
          <p className={`mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            We are dedicated to providing exceptional real estate services...
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["mission", "vision", "values"].map((card) => (
              <div
                key={card}
                className={`p-6 rounded-lg shadow-lg cursor-pointer text-white transition duration-300 ease-in-out transform hover:scale-105 ${
                  isDarkMode
                    ? selectedCard === card
                      ? "bg-gradient-to-r from-violet-700 to-violet-800"
                      : "bg-gradient-to-r from-violet-600 to-violet-700"
                    : selectedCard === card
                      ? "bg-gradient-to-r from-indigo-500 to-indigo-600"
                      : "bg-gradient-to-r from-indigo-400 to-indigo-500"
                } ${
                  isDarkMode
                    ? "hover:from-violet-800 hover:to-violet-700"
                    : "hover:from-indigo-600 hover:to-indigo-500"
                }`}
                onClick={() => handleCardClick(card)}
              >
                <h3 className="text-xl font-semibold mb-4 capitalize">
                  Our {card}
                </h3>
                <p className="text-gray-200">
                  {card === "values" ? (
                    <div>
                      <p>Integrity</p>
                      <p>Customer Focus</p>
                      <p>Innovation</p>
                      <p>Community</p>
                    </div>
                  ) : card === "mission" ? (
                    "To simplify the real estate process, offering tailored services and building long-term relationships."
                  ) : (
                    "To lead the real estate industry by providing seamless property transactions and fostering trust."
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`px-4 py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="max-w-6xl mx-auto">
          <h2 className={`text-3xl font-semibold mb-8 text-center ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            What Our Clients Say
          </h2>
          <div className="max-w-3xl mx-auto">
            {loading ? (
              <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading reviews...</p>
            ) : (
              <Carousel autoplay>
                {reviews.map((review) => (
                  <Card
                    key={review.id}
                    title={
                      <div className="flex items-center">
                        <Avatar src={review.avatar} />
                        <span className={`ml-2 font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {review.name}
                        </span>
                      </div>
                    }
                    bordered={false}
                    className={isDarkMode ? 'bg-gray-700' : ''}
                  >
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{review.review}</p>
                  </Card>
                ))}
              </Carousel>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
