import React, { useState, FormEvent } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ResetPassword: React.FC = () => {
  const params = useParams();
  const token = params.token as string;
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  // 🔐 Password Strength Logic
  const getStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = getStrength(newPassword);

  const strengthColor =
    strength <= 1
      ? "bg-red-500"
      : strength === 2
      ? "bg-yellow-500"
      : "bg-green-500";

  const strengthText =
    strength <= 1
      ? "Weak Password"
      : strength === 2
      ? "Medium Password"
      : "Strong Password";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `http://localhost:5000/api/admin/reset-password/${token}`,
        { newPassword }
      );

      setMessage(res.data.message);
      setSuccess(true);

      setTimeout(() => {
        navigate("/auth");
      }, 2500);

    } catch (error: any) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative">

        {success ? (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="mt-4 text-green-600 font-semibold">
              Password Updated Successfully!
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-center mb-6">
              Reset Password
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />

                {newPassword && (
                  <div className="mt-3">
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className={`h-2 rounded-full ${strengthColor} transition-all duration-300`}
                        style={{ width: `${(strength / 4) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm mt-1">{strengthText}</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={strength <= 1}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                Update Password
              </button>
            </form>

            {message && (
              <p className="text-center text-red-500 text-sm mt-4">
                {message}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;