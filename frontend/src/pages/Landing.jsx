/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { FaChevronDown, FaPlay } from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import { Link } from "react-router-dom";

// Fade-in animation helper
const fadeIn = (direction = "up", delay = 0) => ({
  hidden: {
    opacity: 0,
    x: direction === "left" ? -60 : direction === "right" ? 60 : 0,
    y: direction === "up" ? 60 : direction === "down" ? -60 : 0,
  },
  show: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.9, delay, ease: "easeOut" },
  },
});

// Stats for third section
const stats = [
  { emoji: "💫", number: "50+", title: "Stories shared", description: "Conversation that changed everything" },
  { emoji: "🎯", number: "99.9%", title: "Moments captured", description: "No connections ever lost" },
  { emoji: "🌍", number: "10+", title: "Dreams connected", description: "States where magic happens" },
  { emoji: "✨", number: "♾️", title: "Possibilities", description: "When hearts and minds align" },
];

// Card animation variants
const cardVariants = {
  offscreen: { y: 100, opacity: 0 },
  onscreen: { y: 0, opacity: 1, transition: { type: "spring", bounce: 0.4, duration: 0.8 } },
};

export default function Landing() {
  return (
    <section className="relative bg-black text-white font-sans">
      {/* First Page */}
      <div className="min-h-screen flex items-center justify-center px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a1a] to-black z-0"></div>
        <div className="absolute inset-0 bg-[url('/images/stars.png')] bg-cover bg-center opacity-15 z-0"></div>

        <div className="relative z-10 grid md:grid-cols-2 gap-12 max-w-7xl w-full items-center">
          <motion.div variants={fadeIn("left", 0.2)} initial="hidden" animate="show" className="space-y-6">
            <div className="inline-flex items-center gap-2 h-8 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 backdrop-blur">
              <BsStars className="text-blue-400" /> The Future of Connection
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              When Distance{" "}
              <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Disappears
              </span>
            </h1>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-md">
              In a world scattered across time zones, <span className="text-gray-200">Echo Meet</span> bridges the impossible—turning screens into windows, calls into conversations, and distance into connection.
            </p>
            <div className="flex gap-4 pt-4">
              <Link to={"/home"}>
                <motion.button whileHover={{ scale: 1.05 }} className="h-8 w-40 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-blue-500/30 transition">
                  Start Your Story ↓
                </motion.button>
              </Link>
              <motion.button whileHover={{ scale: 1.05 }} className="h-8 w-40 rounded-xl bg-white/10 backdrop-blur border border-white/10 text-white font-medium flex items-center gap-2 hover:bg-white/20 transition">
                <FaPlay className="text-sm" /> Watch the Magic
              </motion.button>
            </div>
          </motion.div>

          <motion.div variants={fadeIn("right", 0.3)} initial="hidden" animate="show" className="relative flex justify-center">
            <div className="relative">
              <img src="/images/landing.png" alt="Echo Meet Preview" className="rounded-2xl shadow-2xl max-h-[420px] border border-white/10" />
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-3xl"></div>
            </div>
            <div className="absolute top-6 right-6 bg-black/70 px-4 py-1.5 rounded-lg border border-white/10 text-xs font-medium flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500"></span> Live Connection
            </div>
            <div className="absolute bottom-6 right-6 h-9 w-45 text-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-semibold shadow-md">
              8 minds, one vision
            </div>
          </motion.div>

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <motion.button
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              onClick={() => document.getElementById("second")?.scrollIntoView({ behavior: "smooth" })}
              className="flex flex-col items-center text-gray-300 hover:text-white font-medium space-y-1"
            >
              <span>Discover More</span>
              <FaChevronDown className="text-xl" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Second Page */}
      <div id="secondlanding" className="relative z-10 bg-gradient-to-b from-black via-[#0a0a1a] to-black py-32 px-6 md:px-12">
        <div id="second" className="max-w-5xl mx-auto text-center space-y-6">
          <motion.h2 initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-700 bg-clip-text text-transparent">
            Every Connection Tells a Story
          </motion.h2>
          <br />
          <motion.p initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} viewport={{ once: true }} className="text-gray-400 max-w-6xl mx-auto text-center text-base md:text-lg leading-relaxed">
            In the tapestry of human connection, every thread matters. Every glance, every gesture, every shared moment of understanding. This is the story of how technology learned to honor the sacred space between minds.
          </motion.p>
        </div>

        <div id="cards" className="grid gap-20 md:grid-cols-3 max-w-7xl mx-auto justify-center items-stretch mt-16">
          {[
            { id: "01", title: "Chapter 1: The Disconnect", subtitle: "When the world went remote...", desc: "Millions found themselves islands in a digital ocean, struggling to maintain the human connection that drives innovation and collaboration." },
            { id: "02", title: "Chapter 2: The Search", subtitle: "Technology tried to bridge the gap...", desc: "But video calls felt cold, screen sharing was clunky, and the magic of spontaneous collaboration seemed lost forever." },
            { id: "03", title: "Chapter 3: The Revelation", subtitle: "Echo Meet emerged from this need...", desc: "Not just as another tool, but as a bridge between souls, minds, and dreams scattered across the globe." },
          ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: i * 0.2 }} viewport={{ once: true }} whileHover={{ scale: 1.05, translateY: -8 }} className="bg-gradient-to-b from-[#0e0e1a] to-[#050509] p-8 rounded-2xl border border-white/10 shadow-lg hover:shadow-blue-500/20 transition relative flex flex-col justify-between min-h-[220px] text-center">
              <div className="text-3xl font-extrabold text-gray-600/70">{card.id}</div>
              <h3 className="mt-4 text-lg md:text-xl font-semibold text-white">{card.title}</h3>
              <p className="text-sm italic text-blue-400 mt-1">{card.subtitle}</p>
              <p className="mt-4 text-gray-400 text-sm leading-relaxed flex-grow">{card.desc}</p>
              <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-blue-400"></div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Third Page */}
      <div id="about" className="relative z-10 bg-gradient-to-b from-black via-[#0a0a1a] to-black py-20 px-6 md:px-16">
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center" initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.3 }}>
          {stats.map((stat, index) => (
            <motion.div key={index} className="h-64 w-60 bg-gradient-to-t from-gray-900 to-gray-800 border-gray-700 rounded-2xl border-2 flex flex-col items-center justify-center p-4 text-center shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-300" variants={cardVariants}>
              <motion.h1 className="text-4xl mb-2 animate-bounce" whileHover={{ scale: 1.3, rotate: [0, 10, -10, 0] }}>
                {stat.emoji}
              </motion.h1>
              <h3 className="font-extrabold text-3xl mb-1 text-white">{stat.number}</h3>
              <p className="text-purple-400 font-bold mb-1">{stat.title}</p>
              <p className="text-gray-300 font-light text-sm">{stat.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
      <br /><br />

      {/* message last */}
      <div id="message" className="relative z-10 bg-gradient-to-b from-black via-[#0a0a1a] to-black py-20 px-6 md:px-16">
        <p className="text-[25px] font-medium text-center">"In world where we'are more connected than ever, yet feel more isolated than before, <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">Echo Meet reminds us what it means to truly see and be seen</span></p>
      </div>
    </section>
  );
}
