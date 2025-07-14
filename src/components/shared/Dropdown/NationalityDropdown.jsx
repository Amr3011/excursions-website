import React, { useState, useEffect } from "react";
import { api_url } from "../../../utils/ApiClient";

const NationalityDropdown = ({ onSelectNationality }) => {
  const [nationalities, setNationalities] = useState([]);
  const [filteredNationalities, setFilteredNationalities] = useState([]);
  const [selectedNationality, setSelectedNationality] = useState("");
  const [nationalityCode, setNationalityCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);


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
              NationalityName: nationality.NationalityName.trim(),
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

  return (
    <div className="my-4">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        {/* حقل البحث بالكود */}
        <div className="flex-1">
          <label
            htmlFor="nationality-code"
            className="block mb-2 font-bold text-gray-700"
          >
            كود الجنسية:
          </label>
          <input
            type="text"
            id="nationality-code"
            value={nationalityCode}
            onChange={handleCodeChange}
            placeholder="أدخل كود الجنسية"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
            dir="rtl"
          />
        </div>

        {/* قائمة الجنسيات المنسدلة */}
        <div className="flex-1">
          <label
            htmlFor="nationality-select"
            className="block mb-2 font-bold text-gray-700"
          >
            اختر الجنسية:
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
              id="nationality-select"
              value={selectedNationality}
              onChange={handleSelectChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
              dir="rtl"
            >
              <option value="">-- اختر الجنسية --</option>
              {filteredNationalities.map((nationality) => (
                <option
                  key={nationality.NationalityCode}
                  value={nationality.NationalityCode}
                >
                  {nationality.NationalityName} ({nationality.NationalityCode})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* عرض تفاصيل الجنسية المحددة إذا وجدت */}
      {selectedNationality &&
        nationalities.find(
          (n) => n.NationalityCode.toString() === selectedNationality
        ) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200 text-right">
            <p className="text-sm text-blue-800">
              تم اختيار الجنسية:{" "}
              {
                nationalities.find(
                  (n) => n.NationalityCode.toString() === selectedNationality
                ).NationalityName
              }
            </p>
          </div>
        )}
    </div>
  );
};

export default NationalityDropdown;
