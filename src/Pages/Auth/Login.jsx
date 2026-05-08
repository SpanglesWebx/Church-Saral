
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { URL } from "../../App";
import axios from "axios";
import churchLogo from "../../assets/logo.png";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";



function Login() {
  const navigate = useNavigate();

  // UI states
  const [tab, setTab] = useState("login"); // "login" | "signup"
  const [PasswordVisible, setPasswordVisible] = useState(false);




  const [Response, setResponse] = useState({ status: null, message: "" });

  // Signup states
  const [memberId, setMemberId] = useState("");
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [memberResponse, setMemberResponse] = useState("");

  const [forgotMode, setForgotMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isTypingSignup, setIsTypingSignup] = useState(false);

  const [memberName, setMemberName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  const [memberVerified, setMemberVerified] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [step, setStep] = useState(1);
  // 1 = enter member
  // 2 = verified screen
  // 3 = otp screen



  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginLoading(true);
    const data = {
      username: event.target.username.value,
      password: event.target.password.value,
    };
    try {
      const response = await axios.post(`${URL}/login`, data);
      window.sessionStorage.setItem("token", response.data.token);
      sessionStorage.removeItem("role")

      const payload = JSON.parse(atob(response.data.token.split(".")[1]));
      const roles = payload.roles || [];

      // ✅ TOAST SUCCESS
      setResponse({
        status: "Success",
        message: "Login Successful"
      });

      // setTimeout(() => {
      //   if (roles.includes("member")) navigate("/admin/dashmember");
      //   else navigate("/admin/dashboard");
      // }, 1000);

      setTimeout(() => {

        const roleRoutes = {
          admin: "/admin/dashboard",
          pastorprimary: "/admin/dashboard",

          churchadmin: "/admin/churchadmindash",
          treasurer: "/admin/treasurerdash",
          accountant: "/admin/accountantdash",
          secretary: "/admin/secretarydash",
          sundaysclaccountant: "/admin/sundaysclaccdash",
          churchofficeworker: "/admin/churchofficeworkerdash",
          churchofficestaff: "/admin/churchadmindash",

          member: "/admin/dashmember"
        };

        const userRole = roles[0]; // first role from token
        navigate(roleRoutes[userRole] || "/");

      }, 1000);




    } catch (error) {
      console.error(error);

      // ❌ TOAST ERROR
      setResponse({
        status: "Failed",
        message: "Login Failed! Invalid credentials"
      });


    } finally {

      setLoginLoading(false);

    }
  };



  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (token) {
      sessionStorage.clear();
    }
  }, []);


  const resetSignupState = () => {
    setMemberId("");
    setEmail("");
    setOtpSent(false);
    setOtpVerified(false);
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setOtpArray(["", "", "", "", "", ""]);
    setOtpTimer(0);
    setMemberResponse("");
    setMemberName("");
    setMemberVerified(false);


  };


  const resetLoginState = () => {
    setPasswordVisible(false);


  };


  // ------------------- SIGNUP -------------------

  const handleCheckMember = async (e) => {
    e.preventDefault();
    setVerifyLoading(true);

    // ✅ FULL RESET (IMPORTANT)
    setOtpSent(false);
    setOtpVerified(false);
    setOtp("");
    setOtpArray(["", "", "", "", "", ""]);
    setPassword("");
    setConfirmPassword("");
    setMemberVerified(false);
    setMemberName("");
    setEmail("");
    setOtpTimer(0);
    setMemberResponse("");

    if (!memberId.trim()) {
      setResponse({
        status: "Failed",
        message: "Please enter Member ID"
      });
      setVerifyLoading(false); // 🔥 IMPORTANT
      return;
    }

    try {
      const res = await axios.post(`${URL}/signup-request`, {
        member_id: memberId,
        mode: forgotMode ? "forgot" : "signup"
      });

      console.log("Response:", res.data);


      setEmail(res.data.email);
      setMemberName(res.data.member_name || "");
      setMemberVerified(true);

      // ✅ MOVE TO NEXT STEP
      setStep(2);


      setResponse({
        status: "Success",
        message: "Member verified successfully"
      });

    }


    catch (err) {
      

      setMemberVerified(false);

      const errorMessage =
        err.response?.data?.message || err.message || "Something went wrong";

      setResponse({ status: null, message: "" });

      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: errorMessage
        });
      }, 100);
    }


    finally {
      setVerifyLoading(false);
    }
  };


  const handleSendOtp = () => {
    setOtpSent(true);
    setOtpTimer(90);

    setStep(3);

    setResponse({
      status: "Success",
      message: "OTP sent successfully"
    });
  };







  useEffect(() => {
    resetSignupState();
    resetLoginState();
  }, [tab]);


  useEffect(() => {
    if (tab === "signup") {
      // only reset when switching TO signup
      setStep(1);
    }
  }, [tab]);

  // Step 2: OTP timer countdown
  useEffect(() => {
    if (otpTimer <= 0) return;
    const timer = setInterval(() => {
      setOtpTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpTimer]);

  // Step 3: Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) return;

    setOtpLoading(true);

    try {
      await axios.post(`${URL}/verify-otp`, { member_id: memberId, otp });
      setOtpVerified(true);
      setResponse({
        status: "Success",
        message: "OTP verified successfully"
      });
    } catch (err) {
      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Invalid OTP"
      });
    } finally {
      setOtpLoading(false);
    }
  };
  // Step 4: Complete signup
  const handleCompleteSignup = async () => {
    if (!password) return;
    setSignupLoading(true);
    try {
      await axios.post(`${URL}/complete-signup`, { member_id: memberId, password });


      setResponse({
        status: "Success",
        message: "Signup successful! Please login."
      });
      setTimeout(() => setTab("login"), 1500);
    } catch (err) {
      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Signup failed!"
      });
    } finally {
      setSignupLoading(false);
    }
  };

  // ------------------- PASSWORD VALIDATION -------------------
  const isPasswordValid = () => {
    return password.length >= 6 && /[A-Za-z]/.test(password) && /\d/.test(password);
  };


  const passwordsMatch = () => {
    return password === confirmPassword && password.length > 0;
  };


  const handleOtpChange = (e, index) => {

    const value = e.target.value;

    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otpArray];
    newOtp[index] = value;

    setOtpArray(newOtp);
    setOtp(newOtp.join(""));

    // move cursor to next box
    if (value && e.target.nextSibling) {
      e.target.nextSibling.focus();
    }
  };


  const handleResetPassword = async () => {

    if (!password) return;

    setResetLoading(true);

    try {

      await axios.post(`${URL}/reset-password`, {
        member_id: memberId,
        password: password
      });

      setTimeout(() => {
        setResponse({
          status: "Success",
          message: "Password updated successfully"
        });
      }, 100);

      setTimeout(() => {

        setTab("login");

        // 🔥 reset everything
        setMemberId("");
        setOtpSent(false);
        setOtpVerified(false);
        setMemberVerified(false);
        setPassword("");
        setConfirmPassword("");
        setOtp("");
        setOtpArray(["", "", "", "", "", ""]);

        setForgotMode(false);

      }, 2000);

    } catch (err) {
      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Password reset failed"
      });
    } finally {
      setResetLoading(false);
    }
  };





  const maskEmail = (email) => {

    if (!email) return "";

    const [name, domain] = email.split("@");

    const visible = name.substring(0, 3);

    return visible + "******@" + domain;
  };




  return (

    <section className="min-h-screen w-full flex items-center justify-center bg-[url('../../assets/login-bg-min.png')] bg-cover bg-center bg-lavender--600 px-4 py-10">



      {/* Login Card */}
      <div className="w-full max-w-md mx-auto bg-white shadow-xl rounded-2xl border border-gray-200 p-6">

        {/* Top Logo & Heading */}
        <div className="flex flex-col items-center mb-8 animate-[fadeSlideDown_1s_ease-out]">


          <img
            src={churchLogo}
            alt="CSI Church Logo"
            className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mb-3 object-contain"
          />
          <h1
            className="text-lg sm:text-xl md:text-2xl font-bold text-lavender--600 tracking-wide text-center"
          >
            CSI Church - KK
          </h1>

        </div>


        <style>
          {`
@keyframes fadeSlideDown {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
`}
        </style>




        {/* Tab Switch */}
        <div className="w-72 mx-auto flex mb-6  ">
          <button
            className={`flex-1 text-center py-2 font-semibold ${tab === "login"
              ? "text-lavender--600 border-b-2 border-lavender--600"
              : "text-gray-400"
              }`}
            onClick={() => setTab("login")}
          >
            Login
          </button>

          <button
            className={`flex-1 text-center py-2 font-semibold ${tab === "signup"
              ? "text-lavender--600 border-b-2 border-lavender--600"
              : "text-gray-400"
              }`}
            onClick={() => setTab("signup")}
          >
            Signup
          </button>
        </div>
        {/* ------------------- LOGIN FORM ------------------- */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="space-y-6">

            <h5 className="text-xl font-bold text-center text-lavender--600">
              LOG IN
            </h5>

            {/* Member ID */}
            <div className="relative w-72 mx-auto">
              <input
                type="text"
                name="username"
                id="username"
                autoComplete="username"
                className="w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm px-2 pb-2 pt-3 focus:outline-none focus:border-lavender--600"
                placeholder=" "
                required
              />
              <label className="absolute text-sm text-gray-500 transform -translate-y-4 scale-75 top-2 left-2">
                Member ID
              </label>
            </div>

            {/* Password */}
            <div className="relative w-72 mx-auto">
              <input
                type={PasswordVisible ? "text" : "password"}
                name="password"
                id="password"
                className="w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm px-2 pb-2 pt-3 focus:outline-none focus:border-lavender--600"
                placeholder=" "
                required
              />
              <label className="absolute text-sm text-gray-500 transform -translate-y-4 scale-75 top-2 left-2">
                Password
              </label>

              {/* Eye Icon */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {PasswordVisible ? (
                  <i onClick={() => setPasswordVisible(false)} className="fa-solid fa-eye text-lavender--600 cursor-pointer"></i>
                ) : (
                  <i onClick={() => setPasswordVisible(true)} className="fa-solid fa-eye-slash text-lavender--600 cursor-pointer"></i>
                )}
              </div>
            </div>

            {/* Forgot Password */}
            <div className="w-72 mx-auto flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setTab("signup");
                  setForgotMode(true);
                }}
                className="text-sm text-lavender--600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <div className="flex justify-center pt-2">



              <button
                type="submit"
                disabled={loginLoading}
                className="bg-lavender--600 text-white w-50 px-10 py-2.5 rounded-lg hover:bg-lavender--700 flex items-center justify-center gap-2"
              >
                {loginLoading ? (
                  <>
                    {/* 🔄 Spinner LEFT */}
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>

                    {/* Text */}
                    <span>Logging...</span>
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </div>


          </form>
        )}

        {/* ------------------- SIGNUP FORM ------------------- */}
        {tab === "signup" && (
          <form className="space-y-6">
            <h5 className="text-xl font-bold text-center text-lavender--600">SIGN UP</h5>

            {/* Step 1: Enter Member ID */}
            {step === 1 && (
              <>
                {/* Member ID Input */}
                <div className="relative w-72 mx-auto">
                  <input
                    type="text"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm px-2 pb-2 pt-3 focus:outline-none focus:border-lavender--600"
                    placeholder=" "
                  />
                  <label className="absolute text-sm text-gray-500 transform -translate-y-4 scale-75 top-2 left-2">
                    Member ID
                  </label>
                </div>

                {/* Verify Button */}
                <div className="flex justify-center mt-4">
                  <button
                    type="button"
                    onClick={handleCheckMember}
                    disabled={verifyLoading}
                    className="bg-lavender--600 text-white px-10 py-2.5 rounded-lg"
                  >
                    {verifyLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Verifying...
                      </span>
                    ) : "Verify Member"}
                  </button>
                </div>
              </>
            )}




            {step === 2 && (
              <div className="text-center space-y-4 mt-4">

                {/* ✅ Success Icon */}
                <div className="flex justify-center">
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-green-100
        animate-[pop_0.4s_ease-out]">

                    <i className="fa-solid fa-check text-green-600 text-xl"></i>
                  </div>
                </div>

                {/* ✅ Title */}
                <h3 className="text-green-700 font-semibold text-lg">
                  Member Verified Successfully
                </h3>

                {/* ✅ Member Name */}
                <p className="text-gray-700">
                  Member Name : <span className="font-semibold">{memberName}</span>
                </p>

                {/* ✅ Email */}
                <p className="text-gray-600">Send OTP to</p>

                <p className="text-lavender--600 font-medium text-sm bg-lavender--50 inline-block px-3 py-1 rounded-md">
                  {maskEmail(email)}
                </p>

                {/* ✅ Button with animation */}
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="mt-4 w-50 mx-auto block bg-lavender--600 text-white px-10 py-2.5 rounded-lg
      hover:bg-lavender--700 transition duration-200 shadow-md
      hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-paper-plane"></i>
                    Send OTP
                  </span>
                </button>

                {/* ✅ INLINE KEYFRAMES */}
                <style>
                  {`
        @keyframes fadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pop {
          0% {
            transform: scale(0.6);
            opacity: 0;
          }
          70% {
            transform: scale(1.15);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}
                </style>

              </div>
            )}

            {/* Step 2: OTP input */}
            {step === 3 && !otpVerified && (
              <div className="space-y-6 text-center ">

                <p className="text-gray-600">
                  Enter OTP sent to
                </p>

                <p className="text-blue-600 font-medium">
                  {email}
                </p>

                {/* OTP BOXES */}
                <div className="flex justify-center gap-4 mt-4">

                  {otpArray.map((digit, i) => (
                    <input
                      key={i}
                      type="text"
                      value={digit}
                      maxLength="1"
                      onChange={(e) => handleOtpChange(e, i)}
                      className="w-12 h-12 text-center text-lavender--600 font-bold text-lg border border-gray-300 rounded-lg
          focus:outline-none focus:border-lavender--600 focus:ring-2 focus:ring-lavender--300
          transition-all duration-200
          animate-[pop_0.3s_ease-out]"
                    />
                  ))}

                </div>

                {/* TIMER */}
                <p className="text-red-500 text-sm animate-pulse">
                  OTP Timeout {otpTimer}s
                </p>

                {/* BUTTON */}
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otpLoading}
                  className="bg-lavender--600 text-white py-2.5 px-6 rounded-lg
      hover:bg-lavender--700 transition duration-200
      hover:scale-105 active:scale-95 shadow-md"
                >
                  {otpLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <i className="fa-solid fa-shield-check"></i>
                      Verify OTP
                    </span>
                  )}
                </button>

                {/* INLINE KEYFRAMES */}
                <style>
                  {`
        @keyframes fadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pop {
          0% {
            transform: scale(0.7);
            opacity: 0;
          }
          60% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}
                </style>

              </div>
            )}

            {/* Step 3: Password input */}
            {otpVerified && !forgotMode && (
              <div className="space-y-5">

                <h3 className="text-green-700 text-lg font-semibold text-center">
                  Verification Completed
                </h3>

                {/* PASSWORD */}
                <div className="relative w-72 mx-auto">

                  <input
                    type={PasswordVisible ? "text" : "password"}
                    placeholder="Create Password"
                    value={password}
                    // onChange={(e) => setPassword(e.target.value)}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setIsTypingSignup(true); // 👈 show validation
                    }}

                    onBlur={() => {
                      if (!password) setIsTypingSignup(false); // 👈 hide if empty
                    }}
                    className="w-full border rounded-lg px-3 py-2 focus:border-lavender--600 focus:outline-none"
                  />

                  <span
                    className="absolute right-3 top-2.5 cursor-pointer text-lavender--600"
                    onClick={() => setPasswordVisible(!PasswordVisible)}
                  >
                    <i className={`fa-solid ${PasswordVisible ? "fa-eye" : "fa-eye-slash"}`} />
                  </span>

                </div>

                {/* CONFIRM PASSWORD */}
                <div className="relative w-72 mx-auto">

                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:border-lavender--600 focus:outline-none"
                  />

                  {confirmPassword && !passwordsMatch() && (
                    <p className="text-red-500 text-sm">
                      Passwords do not match
                    </p>
                  )}

                </div>
                {/* VALIDATION */}
                {isTypingSignup && (
                  <div className="text-sm space-y-2 w-72 mx-auto">

                    {/* Length */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-5 h-5 flex items-center justify-center rounded-full text-xs transition-all duration-300 transform
      ${password.length >= 6
                            ? "bg-green-600 text-white scale-110 shadow-md"
                            : "bg-gray-300 text-gray-500 scale-100"}`}
                      >
                        <i className={`fa-solid ${password.length >= 6 ? "fa-check" : "fa-xmark"} transition-all duration-300`}></i>
                      </span>
                      <p className="transition-colors duration-300">
                        Minimum 6 characters
                      </p>
                    </div>

                    {/* Alphabet */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-5 h-5 flex items-center justify-center rounded-full text-xs transition-all duration-300 transform
      ${/[A-Za-z]/.test(password)
                            ? "bg-green-600 text-white scale-110 shadow-md"
                            : "bg-gray-300 text-gray-500 scale-100"}`}
                      >
                        <i className={`fa-solid ${/[A-Za-z]/.test(password) ? "fa-check" : "fa-xmark"} transition-all duration-300`}></i>
                      </span>
                      <p>At least one alphabet</p>
                    </div>

                    {/* Number */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-5 h-5 flex items-center justify-center rounded-full text-xs transition-all duration-300 transform
      ${/\d/.test(password)
                            ? "bg-green-600 text-white scale-110 shadow-md"
                            : "bg-gray-300 text-gray-500 scale-100"}`}
                      >
                        <i className={`fa-solid ${/\d/.test(password) ? "fa-check" : "fa-xmark"} transition-all duration-300`}></i>
                      </span>
                      <p>At least one number</p>
                    </div>

                  </div>
                )}
                <button
                  type="button"
                  onClick={handleCompleteSignup}
                  disabled={
                    signupLoading || !isPasswordValid() || !passwordsMatch()
                  }
                  className={`w-50 mx-auto block rounded-lg text-white font-medium px-6 py-2.5
  ${signupLoading || !isPasswordValid() || !passwordsMatch()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-lavender--600 hover:bg-lavender--700"
                    }`}
                >
                  {signupLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      {/* 🔄 Spinner */}
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Signing Up...
                    </span>
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </div>
            )}


            {otpVerified && forgotMode && (
              <div className="space-y-5 animate-[fadeIn_0.4s_ease-out]">

                <h3 className="text-green-700 text-lg font-semibold text-center">
                  Reset Password
                </h3>

                {/*  PASSWORD INPUT WITH EYE ICON */}
                <div className="relative w-72 mx-auto">

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter New Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setIsTyping(true); // 👈 show validation when typing
                    }}
                    onBlur={() => {
                      if (!password) setIsTyping(false); // 👈 hide if empty
                    }}
                    className="w-full border rounded-lg px-3 py-2 focus:border-lavender--600 focus:outline-none"
                  />

                  {/*  Eye Icon */}
                  <span
                    className="absolute right-3 top-2.5 cursor-pointer text-lavender--600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fa-solid ${showPassword ? "fa-eye" : "fa-eye-slash"}`} />
                  </span>

                </div>

                {/*  VALIDATION  */}
                {isTyping && (
                  <div className="text-sm space-y-2 w-72 mx-auto animate-[fadeIn_0.3s_ease-out]">

                    {/* Length */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-5 h-5 flex items-center justify-center rounded-full text-xs transition-all duration-300
            ${password.length >= 6
                            ? "bg-green-600 text-white scale-110"
                            : "bg-gray-300 text-gray-500"}`}
                      >
                        <i className={`fa-solid ${password.length >= 6 ? "fa-check" : "fa-xmark"}`} />
                      </span>
                      <p>Minimum 6 characters</p>
                    </div>

                    {/* Alphabet */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-5 h-5 flex items-center justify-center rounded-full text-xs transition-all duration-300
            ${/[A-Za-z]/.test(password)
                            ? "bg-green-600 text-white scale-110"
                            : "bg-gray-300 text-gray-500"}`}
                      >
                        <i className={`fa-solid ${/[A-Za-z]/.test(password) ? "fa-check" : "fa-xmark"}`} />
                      </span>
                      <p>At least one alphabet</p>
                    </div>

                    {/* Number */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-5 h-5 flex items-center justify-center rounded-full text-xs transition-all duration-300
            ${/\d/.test(password)
                            ? "bg-green-600 text-white scale-110"
                            : "bg-gray-300 text-gray-500"}`}
                      >
                        <i className={`fa-solid ${/\d/.test(password) ? "fa-check" : "fa-xmark"}`} />
                      </span>
                      <p>At least one number</p>
                    </div>

                  </div>
                )}

                {/* 🔥 BUTTON */}
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={
                    resetLoading ||
                    password.length < 6 ||
                    !/[A-Za-z]/.test(password) ||
                    !/\d/.test(password)
                  }
                  className={`w-50 mx-auto block rounded-lg text-white px-6 py-2.5 transition-all duration-300
        ${resetLoading ||
                      password.length < 6 ||
                      !/[A-Za-z]/.test(password) ||
                      !/\d/.test(password)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-lavender--600 hover:bg-lavender--700 hover:scale-105"
                    }`}
                >
                  {resetLoading ? "Updating..." : "Reset Password"}
                </button>

                {/* ANIMATION */}
                <style>
                  {`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}
                </style>

              </div>
            )}

          </form>
        )}

      </div>


      {Response.status && (
        Response.status === "Success"
          ? <SuccessMessage key={Response.message} Message={Response.message} />
          : <FailedMessage key={Response.message} Message={Response.message} />
      )}
    </section>
  );
}

export default Login;





