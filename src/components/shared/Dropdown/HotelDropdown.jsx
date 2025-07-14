import React, { useState, useEffect } from "react";
import { api_url } from "../../../utils/ApiClient";

const HotelDropdown = ({ onSelectHotel }) => {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState("");
  const [hotelCode, setHotelCode] = useState("");
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
    const fetchHotels = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${api_url}/hotels`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const responseData = await response.json();

        if (responseData.success && Array.isArray(responseData.data)) {
          // تنظيف أسماء الفنادق (إزالة المسافات الزائدة)
          const processedHotels = responseData.data.map((hotel) => ({
            ...hotel,
            HotelName: hotel.HotelName
              ? hotel.HotelName.trim()
              : "فندق بدون اسم",
          }));

          setHotels(processedHotels);
          setFilteredHotels(processedHotels);
        } else {
          setError("لم يتم العثور على بيانات الفنادق");
        }
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch hotels:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotels();
  }, []);

  // البحث بالكود
  const handleCodeChange = (e) => {
    const code = e.target.value;
    setHotelCode(code);

    if (code) {
      // البحث عن الفندق بالكود
      const codeNumber = parseInt(code, 10);
      const found = hotels.find((hotel) => hotel.HotelCode === codeNumber);

      if (found) {
        setSelectedHotel(found.HotelCode.toString());
        if (onSelectHotel) {
          onSelectHotel(found);
        }
      }

      // تصفية القائمة المنسدلة لإظهار الفنادق التي تبدأ بالكود المدخل
      const filtered = hotels.filter((hotel) =>
        hotel.HotelCode.toString().startsWith(code)
      );
      setFilteredHotels(filtered);
    } else {
      setFilteredHotels(hotels);
    }
  };

  // اختيار فندق من القائمة المنسدلة
  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedHotel(selectedValue);

    if (selectedValue) {
      const codeNumber = parseInt(selectedValue, 10);
      const selected = hotels.find((hotel) => hotel.HotelCode === codeNumber);

      if (selected) {
        setHotelCode(selected.HotelCode.toString());

        if (onSelectHotel) {
          onSelectHotel(selected);
        }
      }
    } else {
      setHotelCode("");
      if (onSelectHotel) {
        onSelectHotel(null);
      }
    }
  };

  // التخطيط للشاشات الكبيرة
  const renderDesktopLayout = () => (
    <div className="flex flex-row items-end gap-4">
      {/* حقل البحث بالكود - أصغر في العرض */}
      <div className="w-1/3">
        <label
          htmlFor="hotel-code"
          className="block mb-2 font-bold text-gray-700 text-left"
        >
          Hotel code:{" "}
        </label>
        <input
          type="text"
          id="hotel-code"
          value={hotelCode}
          onChange={handleCodeChange}
          placeholder="enter hotel code"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
          dir="rtl"
        />
      </div>

      {/* قائمة الفنادق المنسدلة - أكبر في العرض */}
      <div className="w-2/3">
        <label
          htmlFor="hotel-select"
          className="block mb-2 font-bold text-gray-700 text-left"
        >
          Choose a hotel:{" "}
        </label>
        {renderHotelSelect()}
      </div>
    </div>
  );

  // التخطيط للموبايل
  const renderMobileLayout = () => (
    <div className="flex flex-col gap-3">
      {/* قائمة الفنادق المنسدلة أولاً */}
      <div>
        <label
          htmlFor="hotel-select-mobile"
          className="block mb-2 font-bold text-gray-700 text-right"
        >
          Choose a hotel:{" "}
        </label>
        {renderHotelSelect("hotel-select-mobile")}
      </div>

      {/* حقل البحث بالكود ثانياً */}
      <div className="flex gap-2">
        <input
          type="text"
          id="hotel-code-mobile"
          value={hotelCode}
          onChange={handleCodeChange}
          placeholder="Enter the hotel code"
          className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
          dir="rtl"
        />
        <label
          htmlFor="hotel-code-mobile"
          className="flex items-center font-bold text-gray-700"
        >
          Code :
        </label>
      </div>
    </div>
  );

  // القائمة المنسدلة للفنادق - مشترك بين التخطيطين
  const renderHotelSelect = (id = "hotel-select") => {
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
        value={selectedHotel}
        onChange={handleSelectChange}
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
        dir="rtl"
      >
        <option value="">Choose a hotel</option>
        {filteredHotels.map((hotel) => (
          <option key={hotel.HotelCode} value={hotel.HotelCode}>
            {hotel.HotelName} ({hotel.HotelCode})
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

      {/* عرض تفاصيل الفندق المحدد إذا وجد */}
      {selectedHotel &&
        hotels.find((h) => h.HotelCode.toString() === selectedHotel) && (
          <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-200 text-left">
            <p className="text-sm text-blue-800">
              Selected{" "}
              <span className="font-bold">
                {
                  hotels.find((h) => h.HotelCode.toString() === selectedHotel)
                    .HotelName
                }
              </span>{" "}
              (Code: {selectedHotel})
            </p>
          </div>
        )}
    </div>
  );
};

export default HotelDropdown;
