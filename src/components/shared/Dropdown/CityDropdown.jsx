import React, { useState, useEffect } from "react";
import { api_url } from "../../../utils/ApiClient";

const CityDropdown = ({ onSelectCity }) => {
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [cityCode, setCityCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);

  // تحديد ما إذا كانت الشاشة موبايل أو لا
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 640);
    };

    // التحقق عند تحميل المكون
    checkIfMobile();

    // التحقق عند تغيير حجم الشاشة
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${api_url}/cities`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const responseData = await response.json();

        if (responseData.success && Array.isArray(responseData.data)) {
          // تنظيف أسماء المدن (إزالة المسافات الزائدة)
          const processedCities = responseData.data.map((city) => ({
            ...city,
            CityName: city.CityName.trim(),
          }));

          setCities(processedCities);
          setFilteredCities(processedCities);
        } else {
          setError("لم يتم العثور على بيانات المدن");
        }
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch cities:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCities();
  }, []);

  // البحث بالكود
  const handleCodeChange = (e) => {
    const code = e.target.value;
    setCityCode(code);

    if (code) {
      // البحث عن المدينة بالكود
      const codeNumber = parseInt(code, 10);
      const found = cities.find((city) => city.CityCode === codeNumber);

      if (found) {
        setSelectedCity(found.CityCode.toString());
        if (onSelectCity) {
          onSelectCity(found);
        }
      }

      // تصفية القائمة المنسدلة لإظهار المدن التي تبدأ بالكود المدخل
      const filtered = cities.filter((city) =>
        city.CityCode.toString().startsWith(code)
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities(cities);
    }
  };

  // اختيار مدينة من القائمة المنسدلة
  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedCity(selectedValue);

    if (selectedValue) {
      const codeNumber = parseInt(selectedValue, 10);
      const selected = cities.find((city) => city.CityCode === codeNumber);

      if (selected) {
        setCityCode(selected.CityCode.toString());

        if (onSelectCity) {
          onSelectCity(selected);
        }
      }
    } else {
      setCityCode("");
      if (onSelectCity) {
        onSelectCity(null);
      }
    }
  };

  // التخطيط للشاشات الكبيرة
  const renderDesktopLayout = () => (
    <div className="flex flex-row items-end gap-4">
      {/* حقل البحث بالكود - أصغر في العرض */}
      <div className="w-1/3">
        <label
          htmlFor="city-code"
          className="block mb-2 font-bold text-gray-700 text-left"
        >
          City code:{" "}
        </label>
        <input
          type="text"
          id="city-code"
          value={cityCode}
          onChange={handleCodeChange}
          placeholder="enter city code"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
          dir="rtl"
        />
      </div>

      {/* قائمة المدن المنسدلة - أكبر في العرض */}
      <div className="w-2/3">
        <label
          htmlFor="city-select"
          className="block mb-2 font-bold text-gray-700 text-left"
        >
          Select a city:
        </label>
        {renderCitySelect()}
      </div>
    </div>
  );

  // التخطيط للموبايل
  const renderMobileLayout = () => (
    <div className="flex flex-col gap-3">
      {/* قائمة المدن المنسدلة أولاً */}
      <div>
        <label
          htmlFor="city-select"
          className="block mb-2 font-bold text-gray-700 text-left"
        >
          Select a city:
        </label>
        {renderCitySelect()}
      </div>

      {/* حقل البحث بالكود ثانياً */}
      <div className="flex gap-2">
        <input
          type="text"
          id="city-code-mobile"
          value={cityCode}
          onChange={handleCodeChange}
          placeholder="enter city code"
          className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
          dir="rtl"
        />
        <label
          htmlFor="city-code-mobile"
          className="flex items-center font-bold text-gray-700"
        >
          الكود:
        </label>
      </div>
    </div>
  );

  // القائمة المنسدلة للمدن - مشترك بين التخطيطين
  const renderCitySelect = () => {
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
        id="city-select"
        value={selectedCity}
        onChange={handleSelectChange}
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
        dir="rtl"
      >
        <option value="">Choose a city</option>
        {filteredCities.map((city) => (
          <option key={city.CityCode} value={city.CityCode}>
            {city.CityName} ({city.CityCode})
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

      {/* عرض تفاصيل المدينة المحددة إذا وجدت */}
      {selectedCity &&
        cities.find((c) => c.CityCode.toString() === selectedCity) && (
          <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-200 text-left ">
            <p className="text-sm text-blue-800">
              Selected{" "}
              <span className="font-bold">
                {
                  cities.find((c) => c.CityCode.toString() === selectedCity)
                    .CityName
                }
              </span>{" "}
              (Code: {selectedCity})
            </p>
          </div>
        )}
    </div>
  );
};

export default CityDropdown;
