import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useInview from "../../../hooks/useInview";

import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import BMISection from "./components/BMISection";
import ProgramSection from "./components/ProgramSection";
import MembershipSection from "./components/MembershipSection";
import TrainersSection from "./components/TrainersSection";
import TrainerModal from "./components/TrainerModal";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";

import { words, heroImages, programs, pricing, trainers } from "./data";
import { getBMIData } from "./utils";

import { X } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [typedText, setTypedText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [prevImageIndex, setPrevImageIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

  const [bmiForm, setBmiForm] = useState({
    height: "170",
    weight: "65",
    age: "25",
    gender: "male",
  });

  const [bmiResult, setBmiResult] = useState(null);

  const [introRef, heroVisible] = useInview();
  const [getReadyRef, getReadyVisible] = useInview();
  const [trainerRef, trainerVisible] = useInview();
  const [programRef, programVisible] = useInview();
  const [memberRef, memberVisible] = useInview();
  const [contactRef, contactVisible] = useInview();
  const [bmiRef, bmiVisible] = useInview();

  const currentWord = useMemo(() => words[wordIndex], [wordIndex]);

  useEffect(() => {
    let timeout;

    if (!isDeleting && typedText.length < currentWord.length) {
      timeout = setTimeout(() => {
        setTypedText(currentWord.slice(0, typedText.length + 1));
      }, 90);
    } else if (!isDeleting && typedText.length === currentWord.length) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 1000);
    } else if (isDeleting && typedText.length > 0) {
      timeout = setTimeout(() => {
        setTypedText(currentWord.slice(0, typedText.length - 1));
      }, 50);
    } else if (isDeleting && typedText.length === 0) {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
    }

    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, currentWord]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevImageIndex(imageIndex);
      setImageIndex((prev) => (prev + 1) % heroImages.length);
      setIsSliding(true);

      setTimeout(() => {
        setIsSliding(false);
      }, 1000);
    }, 3000);

    return () => clearInterval(interval);
  }, [imageIndex]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const handleCalculateBMI = () => {
    const height = Number(bmiForm.height);
    const weight = Number(bmiForm.weight);

    if (!height || !weight || height <= 0 || weight <= 0) return;
    setBmiResult(getBMIData(weight, height));
  };

  return (
    <div className="min-h-screen bg-[#2b2626] text-white">
      <Header navigate={navigate} />

      <HeroSection
        introRef={introRef}
        heroVisible={heroVisible}
        typedText={typedText}
        heroImages={heroImages}
        prevImageIndex={prevImageIndex}
        imageIndex={imageIndex}
        isSliding={isSliding}
        setIsVideoOpen={setIsVideoOpen}
        navigate={navigate}
      />

      <AboutSection
        getReadyRef={getReadyRef}
        getReadyVisible={getReadyVisible}
        show={show}
        navigate={navigate}
      />
      <BMISection
        bmiRef={bmiRef}
        bmiVisible={bmiVisible}
        bmiResult={bmiResult}
        bmiForm={bmiForm}
        setBmiForm={setBmiForm}
        handleCalculateBMI={handleCalculateBMI}
      />

      <ProgramSection
        programRef={programRef}
        programVisible={programVisible}
        programs={programs}
      />

      <MembershipSection
        memberRef={memberRef}
        memberVisible={memberVisible}
        isAnnual={isAnnual}
        setIsAnnual={setIsAnnual}
        pricing={pricing}
        navigate={navigate}
      />

      <TrainersSection
        trainerRef={trainerRef}
        trainerVisible={trainerVisible}
        trainers={trainers}
        setSelectedTrainer={setSelectedTrainer}
      />

      <ContactSection
        contactRef={contactRef}
        contactVisible={contactVisible}
        navigate={navigate}
      />

      <Footer />

      {isVideoOpen && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md transition-opacity"
          onClick={() => setIsVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl animate-[pulse_0.3s_ease-out_1]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute -right-4 -top-12 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-slate-300 transition-all hover:scale-110 hover:bg-red-600 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl shadow-black/80">
              <video
                className="h-full w-full object-cover"
                src="/vidAd.mp4"
                controls
                autoPlay
                playsInline
              >
                Trình duyệt của bạn không hỗ trợ thẻ video.
              </video>
            </div>
          </div>
        </div>
      )}

      <TrainerModal
        selectedTrainer={selectedTrainer}
        setSelectedTrainer={setSelectedTrainer}
      />
    </div>
  );
}
