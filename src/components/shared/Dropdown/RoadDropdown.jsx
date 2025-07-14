import React, { useState, useEffect } from "react";
import { api_url } from "../../../utils/ApiClient";

const RoadDropdown = ({ onSelectRoad }) => {
  const [roads, setRoads] = useState([]);
  const [filteredRoads, setFilteredRoads] = useState([]);
  const [selectedRoad, setSelectedRoad] = useState("");
  const [roadCode, setRoadCode] = useState("");
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
    const fetchRoads = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${api_url}/roads`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const responseData = await response.json();

        if (responseData.success && Array.isArray(responseData.data)) {
          // تنظيف أسماء الطرق (إزالة المسافات الزائدة)
          const processedRoads = responseData.data.map((road) => ({
            ...road,
            RoadName: road.RoadName ? road.RoadName.trim() : "طريق بدون اسم",
          }));

          setRoads(processedRoads);
          setFilteredRoads(processedRoads);
        } else {
          setError("لم يتم العثور على بيانات الطرق");
        }
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch roads:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoads();
  }, []);

  // البحث بالكود
  const handleCodeChange = (e) => {
    const code = e.target.value;
    setRoadCode(code);

    if (code) {
      // البحث عن الطريق بالكود - تحويل إلى نص للمقارنة
      const codeNumber = parseInt(code, 10);
      const found = roads.find((road) => {
        const roadCodeValue = road.RoadCode;
        // التعامل مع الكود كرقم أو نص
        return (
          roadCodeValue === codeNumber ||
          roadCodeValue === code ||
          (typeof roadCodeValue === "string" && roadCodeValue.includes(code)) ||
          roadCodeValue.toString() === code
        );
      });

      if (found) {
        setSelectedRoad(found.RoadCode.toString());
        if (onSelectRoad) {
          onSelectRoad(found);
        }
      }

      // تصفية القائمة المنسدلة - التأكد من تحويل الكود إلى نص للمقارنة
      const filtered = roads.filter((road) => {
        const roadCodeString = road.RoadCode.toString();
        return roadCodeString.includes(code);
      });

      setFilteredRoads(filtered);
    } else {
      setFilteredRoads(roads);
    }
  };

  // اختيار طريق من القائمة المنسدلة
  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedRoad(selectedValue);

    if (selectedValue) {
      // يمكن أن يكون الكود رقمًا أو نصًا
      const selected = roads.find(
        (road) => road.RoadCode.toString() === selectedValue
      );

      if (selected) {
        setRoadCode(selected.RoadCode.toString());

        if (onSelectRoad) {
          onSelectRoad(selected);
        }
      }
    } else {
      setRoadCode("");
      if (onSelectRoad) {
        onSelectRoad(null);
      }
    }
  };

  // التخطيط للشاشات الكبيرة
  const renderDesktopLayout = () => (
    <div className="flex flex-row items-end gap-4">
      {/* حقل البحث بالكود - أصغر في العرض */}
      <div className="w-1/3">
        <label
          htmlFor="road-code"
          className="block mb-2 font-bold text-gray-700 text-left"
        >
          Excursions Code :
        </label>
        <input
          type="text"
          id="road-code"
          value={roadCode}
          onChange={handleCodeChange}
          placeholder="Enter excursions code"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
          dir="rtl"
        />
      </div>

      {/* قائمة الطرق المنسدلة - أكبر في العرض */}
      <div className="w-2/3">
        <label
          htmlFor="road-select"
          className="block mb-2 font-bold text-gray-700 text-left"
        >
          Choose Excursions :{" "}
        </label>
        {renderRoadSelect()}
      </div>
    </div>
  );

  // التخطيط للموبايل
  const renderMobileLayout = () => (
    <div className="flex flex-col gap-3">
      {/* قائمة الطرق المنسدلة أولاً */}
      <div>
        <label
          htmlFor="road-select-mobile"
          className="block mb-2 font-bold text-gray-700 text-left"
        >
          Choose Excursions :{" "}
        </label>
        {renderRoadSelect("road-select-mobile")}
      </div>

      {/* حقل البحث بالكود ثانياً */}
      <div className="flex gap-2">
        <input
          type="text"
          id="road-code-mobile"
          value={roadCode}
          onChange={handleCodeChange}
          placeholder="Enter excursions code"
          className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
          dir="rtl"
        />
        <label
          htmlFor="road-code-mobile"
          className="flex items-center font-bold text-gray-700"
        >
          Code Excursions :
        </label>
      </div>
    </div>
  );

  // القائمة المنسدلة للطرق - مشترك بين التخطيطين
  const renderRoadSelect = (id = "road-select") => {
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
        value={selectedRoad}
        onChange={handleSelectChange}
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
        dir="rtl"
      >
        <option value=""> Choose Excursions</option>
        {filteredRoads.map((road) => (
          <option key={road.RoadCode} value={road.RoadCode.toString()}>
            {road.RoadName} ({road.RoadCode})
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

      {/* عرض تفاصيل الطريق المحدد إذا وجد */}
      {selectedRoad &&
        roads.find((r) => r.RoadCode.toString() === selectedRoad) && (
          <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-200 text-left">
            <p className="text-sm text-blue-800">
              Selected {" "}
              <span className="font-bold">
                {
                  roads.find((r) => r.RoadCode.toString() === selectedRoad)
                    .RoadName
                }
              </span>{" "}
              (Code : {selectedRoad})
            </p>
          </div>
        )}
    </div>
  );
};

export default RoadDropdown;
