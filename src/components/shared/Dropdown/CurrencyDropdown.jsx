import React, { useState, useEffect } from "react";

const CurrencyDropdown = ({ onSelectCurrency }) => {
  const [currencies, setCurrencies] = useState([]);
  const [filteredCurrencies, setFilteredCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [currencyCode, setCurrencyCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // استخدام API URL
  const api_url = "https://excursions-api.vercel.app/api";

  useEffect(() => {
    const fetchCurrencies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${api_url}/currencies`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const responseData = await response.json();

        if (responseData.success && Array.isArray(responseData.data)) {
          // تنظيف أسماء العملات (إزالة المسافات الزائدة)
          const processedCurrencies = responseData.data.map((currency) => ({
            ...currency,
            CurrencyName: currency.CurrencyName.trim(),
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

  return (
    <div className="my-4">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        {/* حقل البحث بالكود */}
        <div className="flex-1">
          <label
            htmlFor="currency-code"
            className="block mb-2 font-bold text-gray-700"
          >
            رمز العملة:
          </label>
          <input
            type="text"
            id="currency-code"
            value={currencyCode}
            onChange={handleCodeChange}
            placeholder="أدخل رمز العملة"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
            dir="rtl"
          />
        </div>

        {/* قائمة العملات المنسدلة */}
        <div className="flex-1">
          <label
            htmlFor="currency-select"
            className="block mb-2 font-bold text-gray-700"
          >
            اختر العملة:
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
              id="currency-select"
              value={selectedCurrency}
              onChange={handleSelectChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
              dir="rtl"
            >
              <option value="">-- اختر العملة --</option>
              {filteredCurrencies.map((currency) => (
                <option
                  key={currency.CurrencyCode}
                  value={currency.CurrencyCode.toString()}
                >
                  {currency.CurrencyName} ({currency.CurrencyCode})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* عرض تفاصيل العملة المحددة إذا وجدت */}
      {selectedCurrency &&
        currencies.find(
          (c) => c.CurrencyCode.toString() === selectedCurrency
        ) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200 text-right">
            <p className="text-sm text-blue-800">
              تم اختيار العملة:{" "}
              {
                currencies.find(
                  (c) => c.CurrencyCode.toString() === selectedCurrency
                ).CurrencyName
              }
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
