import React from "react";
/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-black text-gray-400  w-full md:px-16 border-t-1 border-gray-700">
      <div id="Footer" className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Left - Brand / Social Media */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Echo Meet</h2>
          <p className="text-sm text-gray-500">
            Connecting people across the globe, one call at a time.
          </p>
          <br />
          <div className="flex space-x-4">
            {[
              { Icon: FaFacebookF, link: "#" },
              { Icon: FaTwitter, link: "#" },
              { Icon: FaInstagram, link: "#" },
              { Icon: FaLinkedinIn, link: "#" },
            ].map((item, i) => (
              <motion.a
                key={i}
                href={item.link}
                whileHover={{ scale: 1.2, y: -2 }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-gray-300 hover:text-white hover:bg-blue-600 transition"
              >
                <item.Icon />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Middle - Quick Links */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">Quick Links</h3>
          <ul className="space-y-3">
            {["Home", "About", "Features", "Contact"].map((link, i) => (
              <motion.li
                key={i}
                whileHover={{ x: 5, scale: 1.05 }}
                className="hover:text-blue-400 cursor-pointer transition"
              >
                {link}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Right - Policy */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">Legal</h3>
          <ul className="space-y-3">
            {["Privacy Policy", "Terms & Conditions"].map((policy, i) => (
              <motion.li
                key={i}
                whileHover={{ x: 5, scale: 1.05 }}
                className="hover:text-purple-400 cursor-pointer transition"
              >
                {policy}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-10 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Echo Meet. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
