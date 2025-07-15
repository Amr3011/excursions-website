import React, { useState, useEffect } from "react";
import { api_url } from "./../../../utils/ApiClient";

const CurrencyDropdown = ({ onSelectCurrency }) => {
  const [currencies, setCurrencies] = useState([]);
  const [filteredCurrencies, setFilteredCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [currencyCode, setCurrencyCode] = useState("");
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
    const fetchCurrencies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${api_url}/currencies`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Accept: "application/json; charset=utf-8",
            "Accept-Charset": "utf-8",
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        // تأكد من قراءة الاستجابة بترميز UTF-8
        const responseText = await response.text();
        const responseData = JSON.parse(responseText);

        if (responseData.success && Array.isArray(responseData.data)) {
          // تنظيف أسماء العملات مع الحفاظ على النص العربي
          const processedCurrencies = responseData.data.map((currency) => ({
            ...currency,
            CurrencyName: currency.CurrencyName
              ? currency.CurrencyName.trim()
              : "عملة بدون اسم",
          }));

          setCurrencies(processedCurrencies);
          setFilteredCurrencies(processedCurrencies);
        } else {
          setError("لم يتم العثور على بيانات العملات");
        }
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch currencies:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  // البحث بالكود
  const handleCodeChange = (e) => {
    const code = e.target.value;
    setCurrencyCode(code);

    if (code) {
      // البحث عن العملة بالكود - تحويل إلى نص للمقارنة
      const codeNumber = parseInt(code, 10);
      const found = currencies.find((currency) => {
        const currencyCodeValue = currency.CurrencyCode;
        // التعامل مع الكود كرقم أو نص
        return (
          currencyCodeValue === codeNumber ||
          currencyCodeValue === code ||
          (typeof currencyCodeValue === "string" &&
            currencyCodeValue.includes(code)) ||
          currencyCodeValue.toString() === code
        );
      });

      if (found) {
        setSelectedCurrency(found.CurrencyCode.toString());
        if (onSelectCurrency) {
          onSelectCurrency(found);
        }
      }

      // تصفية القائمة المنسدلة - التأكد من تحويل الكود إلى نص للمقارنة
      const filtered = currencies.filter((currency) => {
        const currencyCodeString = currency.CurrencyCode.toString();
        return currencyCodeString.includes(code);
      });

      setFilteredCurrencies(filtered);
    } else {
      setFilteredCurrencies(currencies);
    }
  };

  // اختيار عملة من القائمة المنسدلة
  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedCurrency(selectedValue);

    if (selectedValue) {
      // يمكن أن يكون الكود رقمًا أو نصًا
      const selected = currencies.find(
        (currency) => currency.CurrencyCode.toString() === selectedValue
      );

      if (selected) {
        setCurrencyCode(selected.CurrencyCode.toString());

        if (onSelectCurrency) {
          onSelectCurrency(selected);
        }
      }
    } else {
      setCurrencyCode("");
      if (onSelectCurrency) {
        onSelectCurrency(null);
      }
    }
  };

  // التخطيط للشاشات الكبيرة
  const renderDesktopLayout = () => (
    <div className="flex flex-row items-end gap-4">
      {/* حقل البحث بالكود - أصغر في العرض */}
      <div className="w-1/3">
        <label
          htmlFor="currency-code"
          className="block mb-2 font-bold text-gray-700 text-left"
        >
          Code Currency :{" "}
        </label>
        <input
          type="text"
          id="currency-code"
          value={currencyCode}
          onChange={handleCodeChange}
          placeholder="Enter currency code"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
          dir="rtl"
        />
      </div>

      {/* قائمة العملات المنسدلة - أكبر في العرض */}
      <div className="w-2/3">
        <label
          htmlFor="currency-select"
          className="block mb-2 font-bold text-gray-700 text-left"
        >
          Select currency:{" "}
        </label>
        {renderCurrencySelect()}
      </div>
    </div>
  );

  // التخطيط للموبايل
  const renderMobileLayout = () => (
    <div className="flex flex-col gap-3">
      {/* قائمة العملات المنسدلة أولاً */}
      <div>
        <label
          htmlFor="currency-select-mobile"
          className="block mb-2 font-bold text-gray-700 text-left"
        >
          Select currency:{" "}
        </label>
        {renderCurrencySelect("currency-select-mobile")}
      </div>

      {/* حقل البحث بالكود ثانياً */}
      <div className="flex gap-2">
        <input
          type="text"
          id="currency-code-mobile"
          value={currencyCode}
          onChange={handleCodeChange}
          placeholder="Enter currency code"
          className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
          dir="rtl"
        />
        <label
          htmlFor="currency-code-mobile"
          className="flex items-center font-bold text-gray-700"
        >
          Code :
        </label>
      </div>
    </div>
  );

  // القائمة المنسدلة للعملات - مشترك بين التخطيطين
  const renderCurrencySelect = (id = "currency-select") => {
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
        value={selectedCurrency}
        onChange={handleSelectChange}
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        style={{ direction: "rtl", fontFamily: "Arial, sans-serif" }}
      >
        <option value="">Choose currency</option>
        {filteredCurrencies.map((currency) => (
          <option
            key={currency.CurrencyCode}
            value={currency.CurrencyCode.toString()}
          >
            {currency.CurrencyName} ({currency.CurrencyCode})
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

      {/* عرض تفاصيل العملة المحددة إذا وجدت */}
      {selectedCurrency &&
        currencies.find(
          (c) => c.CurrencyCode.toString() === selectedCurrency
        ) && (
          <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-200 text-left">
            <p className="text-sm text-blue-800">
              Selected{" "}
              <span
                className="font-bold"
                style={{ direction: "rtl", fontFamily: "Arial, sans-serif" }}
              >
                {
                  currencies.find(
                    (c) => c.CurrencyCode.toString() === selectedCurrency
                  ).CurrencyName
                }
              </span>{" "}
              (
              {
                currencies.find(
                  (c) => c.CurrencyCode.toString() === selectedCurrency
                ).CurrencyCode
              }
              )
            </p>
          </div>
        )}
    </div>
  );
};

export default CurrencyDropdown;
