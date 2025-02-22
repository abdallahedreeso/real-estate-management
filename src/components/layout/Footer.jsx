import { FaFacebookSquare } from "react-icons/fa";
import { SiInstagram } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-8 bg-gray-800 text-white py-5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="mb-4">
            <ul className="mt-2 space-y-2">
              <li>
                <Link to="/" className="hover:text-gray-300">
                  Home
                </Link>
              </li>
              {/* <li>
                <Link to="property" className="hover:text-gray-300">
                  Property
                </Link>
              </li> */}
              <li>
                <Link to="About" className="hover:text-gray-300">
                  About
                </Link>
              </li>
              <li>
                <Link to="ContactUs" className="hover:text-gray-300">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div className="mb-4">
            <h5 className="text-xl font-bold">Follow Us</h5>
            <ul className="flex space-x-4 mt-2">
              <li>
                <Link
                  to="https://www.facebook.com"
                  target="_blank"
                  className="text-gray-400 hover:text-white"
                >
                  <FaFacebookSquare className="w-7 h-7 fill-current" />
                </Link>
              </li>
              <li>
                <Link
                  to="https://www.instagram.com"
                  target="_blank"
                  className="text-gray-400 hover:text-white"
                >
                  <SiInstagram className="w-7 h-7 fill-current" />
                </Link>
              </li>
              <li>
                <Link
                  to="https://x.com"
                  target="_blank"
                  className="text-gray-400 hover:text-white"
                >
                  <FaXTwitter className="w-7 h-7 fill-current" />
                </Link>
              </li>
              <li>
                <Link
                  to="https://www.linkedin.com"
                  target="_blank"
                  className="text-gray-400 hover:text-white"
                >
                  <FaLinkedin className="w-7 h-7 fill-current" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="mb-4">
            <h5 className="text-xl font-bold">Get in Touch</h5>
            <p className="mt-2">
              Any questions? Let us know by call us on 0123456789 or
            </p>

            <form className="mt-4 w-full flex rounded">
              <input
                type="email"
                className="flex-grow w-full p-2 border border-gray-500 rounded-l-md bg-gray-700 text-white placeholder-gray-400"
                placeholder="email@example.com"
              />
              <button
                className="p-2 bg-gray-600 text-white rounded-r-md hover:bg-gray-500"
                type="button"
              >
                <a href="mailto:abdallahedreeso2@gmail.com">mail</a>
              </button>
            </form>
          </div>
        </div>
        <div className="text-center mt-4">
          <p>
            Copyright &copy; 2024 All rights reserved | Made by{" "}
            <span className="text-white hover:text-gray-400">
              Component Crafterz
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
