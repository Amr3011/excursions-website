import React, { useState, useEffect } from "react";
import { api_url } from "../../../utils/ApiClient";

const CityDropdown = ({ onSelectCity }) => {
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [cityCode, setCityCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);


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

  return (
    <div className="my-4">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        {/* حقل البحث بالكود */}
        <div className="flex-1">
          <label
            htmlFor="city-code"
            className="block mb-2 font-bold text-gray-700 text-right"
          >
            كود المدينة:
          </label>
          <input
            type="text"
            id="city-code"
            value={cityCode}
            onChange={handleCodeChange}
            placeholder="أدخل كود المدينة"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
            dir="rtl"
          />
        </div>

        {/* قائمة المدن المنسدلة */}
        <div className="flex-1">
          <label
            htmlFor="city-select"
            className="block mb-2 font-bold text-gray-700"
          >
            اختر مدينة:
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
              id="city-select"
              value={selectedCity}
              onChange={handleSelectChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
              dir="rtl"
            >
              <option value="">-- اختر مدينة --</option>
              {filteredCities.map((city) => (
                <option key={city.CityCode} value={city.CityCode}>
                  {city.CityName} ({city.CityCode})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* عرض تفاصيل المدينة المحددة إذا وجدت */}
      {selectedCity &&
        cities.find((c) => c.CityCode.toString() === selectedCity) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200 text-right">
            <p className="text-sm text-blue-800">
              تم اختيار مدينة:{" "}
              {
                cities.find((c) => c.CityCode.toString() === selectedCity)
                  .CityName
              }
            </p>
          </div>
        )}
    </div>
  );
};

export default CityDropdown;
