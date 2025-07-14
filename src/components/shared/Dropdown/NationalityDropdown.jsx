import React, { useState, useEffect } from "react";
import { api_url } from "../../../utils/ApiClient";

const NationalityDropdown = ({ onSelectNationality }) => {
  const [nationalities, setNationalities] = useState([]);
  const [filteredNationalities, setFilteredNationalities] = useState([]);
  const [selectedNationality, setSelectedNationality] = useState("");
  const [nationalityCode, setNationalityCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);

  // تحديد ما إذا كانت الشاشة موبايل أو لا
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 640);
    };

    // التحقق عند تحميل المكون
    if (typeof window !== "undefined") {
      checkIfMobile();

      // التحقق عند تغيير حجم الشاشة
      window.addEventListener("resize", checkIfMobile);

      return () => window.removeEventListener("resize", checkIfMobile);
    }
  }, []);

  useEffect(() => {
    const fetchNationalities = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${api_url}/nationalities`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const responseData = await response.json();

        if (responseData.success && Array.isArray(responseData.data)) {
          // تنظيف أسماء الجنسيات (إزالة المسافات الزائدة)
          const processedNationalities = responseData.data.map(
            (nationality) => ({
              ...nationality,
              NationalityName: nationality.NationalityName
                ? nationality.NationalityName.trim()
                : "جنسية بدون اسم",
            })
          );

          setNationalities(processedNationalities);
          setFilteredNationalities(processedNationalities);
        } else {
          setError("لم يتم العثور على بيانات الجنسيات");
        }
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch nationalities:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNationalities();
  }, []);

  // البحث بالكود
  const handleCodeChange = (e) => {
    const code = e.target.value;
    setNationalityCode(code);

    if (code) {
      // البحث عن الجنسية بالكود
      const codeNumber = parseInt(code, 10);
      const found = nationalities.find(
        (nationality) => nationality.NationalityCode === codeNumber
      );

      if (found) {
        setSelectedNationality(found.NationalityCode.toString());
        if (onSelectNationality) {
          onSelectNationality(found);
        }
      }

      // تصفية القائمة المنسدلة لإظهار الجنسيات التي تبدأ بالكود المدخل
      const filtered = nationalities.filter((nationality) =>
        nationality.NationalityCode.toString().startsWith(code)
      );
      setFilteredNationalities(filtered);
    } else {
      setFilteredNationalities(nationalities);
    }
  };

  // اختيار جنسية من القائمة المنسدلة
  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedNationality(selectedValue);

    if (selectedValue) {
      const codeNumber = parseInt(selectedValue, 10);
      const selected = nationalities.find(
        (nationality) => nationality.NationalityCode === codeNumber
      );

      if (selected) {
        setNationalityCode(selected.NationalityCode.toString());

        if (onSelectNationality) {
          onSelectNationality(selected);
        }
      }
    } else {
      setNationalityCode("");
      if (onSelectNationality) {
        onSelectNationality(null);
      }
    }
  };

  // التخطيط للشاشات الكبيرة
  const renderDesktopLayout = () => (
    <div className="flex flex-row items-end gap-4">
      {/* حقل البحث بالكود - أصغر في العرض */}
      <div className="w-1/3">
        <label
          htmlFor="nationality-code"
          className="block mb-2 font-bold text-gray-700 text-left"
        >
          Nationality code:{" "}
        </label>
        <input
          type="text"
          id="nationality-code"
          value={nationalityCode}
          onChange={handleCodeChange}
          placeholder="enter nationality code"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
          dir="rtl"
        />
      </div>

      {/* قائمة الجنسيات المنسدلة - أكبر في العرض */}
      <div className="w-2/3">
        <label
          htmlFor="nationality-select"
          className="block mb-2 font-bold text-gray-700 text-left"
        >
          Select nationality:{" "}
        </label>
        {renderNationalitySelect()}
      </div>
    </div>
  );

  // التخطيط للموبايل
  const renderMobileLayout = () => (
    <div className="flex flex-col gap-3">
      {/* قائمة الجنسيات المنسدلة أولاً */}
      <div>
        <label
          htmlFor="nationality-select-mobile"
          className="block mb-2 font-bold text-gray-700 text-right"
        >
          Select nationality:{" "}
        </label>
        {renderNationalitySelect("nationality-select-mobile")}
      </div>

      {/* حقل البحث بالكود ثانياً */}
      <div className="flex gap-2">
        <input
          type="text"
          id="nationality-code-mobile"
          value={nationalityCode}
          onChange={handleCodeChange}
          placeholder="أدخل كود الجنسية"
          className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
          dir="rtl"
        />
        <label
          htmlFor="nationality-code-mobile"
          className="flex items-center font-bold text-gray-700"
        >
          Code:
        </label>
      </div>
    </div>
  );

  // القائمة المنسدلة للجنسيات - مشترك بين التخطيطين
  const renderNationalitySelect = (id = "nationality-select") => {
    if (isLoading) {
      return (
        <div className="p-2 bg-gray-100 text-gray-600 rounded text-center">
          Loading...{" "}
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-2 bg-red-100 text-red-700 rounded text-center">
          خطأ: {error}
        </div>
      );
    }

    return (
      <select
        id={id}
        value={selectedNationality}
        onChange={handleSelectChange}
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
        dir="rtl"
      >
        <option value="">Choose nationality</option>
        {filteredNationalities.map((nationality) => (
          <option
            key={nationality.NationalityCode}
            value={nationality.NationalityCode}
          >
            {nationality.NationalityName} ({nationality.NationalityCode})
          </option>
        ))}
      </select>
    );
  };

  return (
    <div className="my-3">
      {/* عرض التخطيط المناسب بناءً على حجم الشاشة */}
      <div className="hidden sm:block">{renderDesktopLayout()}</div>
      <div className="sm:hidden">{renderMobileLayout()}</div>

      {/* عرض تفاصيل الجنسية المحددة إذا وجدت */}
      {selectedNationality &&
        nationalities.find(
          (n) => n.NationalityCode.toString() === selectedNationality
        ) && (
          <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-200 text-left">
            <p className="text-sm text-blue-800">
              Selected {" "}
              <span className="font-bold">
                {
                  nationalities.find(
                    (n) => n.NationalityCode.toString() === selectedNationality
                  ).NationalityName
                }
              </span>{" "}
              (Code: {selectedNationality})
            </p>
          </div>
        )}
    </div>
  );
};

export default NationalityDropdown;
