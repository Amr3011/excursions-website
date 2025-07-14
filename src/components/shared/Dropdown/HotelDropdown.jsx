import React, { useState, useEffect } from "react";
import { api_url } from "../../../utils/ApiClient";

const HotelDropdown = ({ onSelectHotel }) => {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState("");
  const [hotelCode, setHotelCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);


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
            HotelName: hotel.HotelName.trim(),
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

  return (
    <div className="my-4">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        {/* حقل البحث بالكود */}
        <div className="flex-1">
          <label
            htmlFor="hotel-code"
            className="block mb-2 font-bold text-gray-700 text-right"
          >
            : كود الفندق
          </label>
          <input
            type="text"
            id="hotel-code"
            value={hotelCode}
            onChange={handleCodeChange}
            placeholder="أدخل كود الفندق"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
            dir="rtl"
          />
        </div>

        {/* قائمة الفنادق المنسدلة */}
        <div className="flex-1">
          <label
            htmlFor="hotel-select"
            className="block mb-2 font-bold text-gray-700 text-right"
          >
            : اختر فندق
          </label>

          {isLoading ? (
            <div className="mt-2 p-2 bg-gray-100 text-gray-600 rounded">
              جاري التحميل...
            </div>
          ) : error ? (
            <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
              خطأ: {error}
            </div>
          ) : (
            <select
              id="hotel-select"
              value={selectedHotel}
              onChange={handleSelectChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
              dir="rtl"
            >
              <option value="">-- اختر فندق --</option>
              {filteredHotels.map((hotel) => (
                <option key={hotel.HotelCode} value={hotel.HotelCode}>
                  {hotel.HotelName} ({hotel.HotelCode})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* عرض تفاصيل الفندق المحدد إذا وجد */}
      {selectedHotel &&
        hotels.find((h) => h.HotelCode.toString() === selectedHotel) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200 text-right">
            <p className="text-sm text-blue-800">
              تم اختيار فندق:{" "}
              {
                hotels.find((h) => h.HotelCode.toString() === selectedHotel)
                  .HotelName
              }
            </p>
          </div>
        )}
    </div>
  );
};

export default HotelDropdown;
