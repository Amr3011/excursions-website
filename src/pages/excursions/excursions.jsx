import React, { useState, useEffect } from "react";
import HotelDropdown from "../../components/shared/Dropdown/HotelDropdown";
import CityDropdown from "../../components/shared/Dropdown/CityDropdown";
import NationalityDropdown from "../../components/shared/Dropdown/NationalityDropdown";
import CurrencyDropdown from "../../components/shared/Dropdown/CurrencyDropdown";
import RoadDropdown from "./../../components/shared/Dropdown/RoadDropdown";
import PriceTable from "../../components/shared/form/PriceTable";
import { api_url } from "../../utils/ApiClient";

const Excursions = () => {
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedNationality, setSelectedNationality] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [priceSummary, setPriceSummary] = useState(null);

  // إضافة الحقول الشخصية
  const [name, setName] = useState("");
  const [telephone, setTelephone] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [tripDate, setTripDate] = useState("");
  const [tripTime, setTripTime] = useState("");
  const [receiver, setReceiver] = useState("");

  // إضافة حقول الدفع
  const [paid, setPaid] = useState("");
  const [unpaid, setUnpaid] = useState(0);

  // إضافة حالة للـ loading والأخطاء
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // حساب المبلغ المتبقي تلقائيًا عند تغيير المبلغ المدفوع أو السعر الإجمالي
  useEffect(() => {
    if (priceSummary) {
      const paidAmount = parseFloat(paid) || 0;
      const totalAmount = priceSummary.grandTotal || 0;
      const remaining = Math.max(0, totalAmount - paidAmount);
      setUnpaid(remaining);
    }
  }, [paid, priceSummary]);

  const handleHotelSelect = (hotel) => {
    setSelectedHotel(hotel);
    console.log("تم اختيار الفندق:", hotel);
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    console.log("تم اختيار المدينة:", city);
  };

  const handleNationalitySelect = (nationality) => {
    setSelectedNationality(nationality);
    console.log("تم اختيار الجنسية:", nationality);
  };

  const handleCurrencySelect = (currency) => {
    setSelectedCurrency(currency);
    console.log("تم اختيار العملة:", currency);
  };

  const handleRoadSelect = (road) => {
    setSelectedRoad(road);
    console.log("تم اختيار الطريق:", road);
  };

  const handlePriceChange = (priceData) => {
    setPriceSummary(priceData);
    console.log("تم تحديث بيانات الأسعار:", priceData);
  };

  // دالة لإرسال البيانات إلى API
  const sendToAPI = async (requestData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${api_url}/excursions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Login": "Amr3011",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API Response:", result);

      // يمكنك إضافة معالجة للرد هنا
      setSuccessMessage("تم إرسال البيانات بنجاح!");

      // إخفاء الرسالة بعد 3 ثوان
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

      return result;
    } catch (error) {
      console.error("Error sending data:", error);
      setError("حدث خطأ أثناء إرسال البيانات: " + error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // الحصول على تاريخ اليوم بتنسيق YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // تحويل قيمة المدفوع إلى رقم عند إرسال النموذج
    const paidAmount = parseFloat(paid) || 0;

    // التحقق من البيانات المطلوبة
    if (
      !selectedNationality ||
      !selectedHotel ||
      !selectedRoad ||
      !selectedCurrency ||
      !priceSummary
    ) {
      setError("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }

    // تحضير البيانات للإرسال
    const requestData = {
      voucherDate: getCurrentDate(), // تاريخ اليوم
      name: name,
      nationality: selectedNationality.NationalityCode, // إرسال NationalityCode
      telephone: telephone,
      hotel: selectedHotel.HotelCode, // إرسال HotelCode
      roomNo: roomNo,
      customer: 999, // ثابت كما طلبت
      excursion: selectedRoad.RoadCode, // إرسال RoadCode
      ad: priceSummary.adultCount || 0,
      child: priceSummary.childCount || 0,
      inf: priceSummary.infantCount || 0,
      tripDate: tripDate,
      tripTime: tripTime,
      currency: selectedCurrency.CurrencyCode, // إرسال CurrencyCode
      price: priceSummary.grandTotal || 0,
      paid: paidAmount,
      unpaid: unpaid,
      receiver: receiver,
    };

    console.log("تم تأكيد الحجز", requestData);

    try {
      await sendToAPI(requestData);
    } catch (error) {
      // الخطأ تم معالجته في دالة sendToAPI
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-left">Tourist trips</h1>

      {/* عرض رسالة الخطأ */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* عرض رسالة النجاح */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setSuccessMessage(null)}
                className="inline-flex text-green-400 hover:text-green-600"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* القسم الأيسر - بيانات الرحلة */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-left">
                Flight information
              </h2>

              {/* البيانات الشخصية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block mb-2 font-bold text-gray-700 text-left"
                  >
                    Name:
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
                    dir="rtl"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="telephone"
                    className="block mb-2 font-bold text-gray-700 text-left"
                  >
                    Telephone:
                  </label>
                  <input
                    type="tel"
                    id="telephone"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
                    dir="rtl"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="roomNo"
                    className="block mb-2 font-bold text-gray-700 text-left"
                  >
                    Room number:
                  </label>
                  <input
                    type="text"
                    id="roomNo"
                    value={roomNo}
                    onChange={(e) => setRoomNo(e.target.value)}
                    placeholder="Enter room number"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
                    dir="rtl"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="receiver"
                    className="block mb-2 font-bold text-gray-700 text-left"
                  >
                    Receiver:
                  </label>
                  <input
                    type="text"
                    id="receiver"
                    value={receiver}
                    onChange={(e) => setReceiver(e.target.value)}
                    placeholder="Enter the recipient's name"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
                    dir="rtl"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="tripDate"
                    className="block mb-2 font-bold text-gray-700 text-left"
                  >
                    Trip date:
                  </label>
                  <input
                    type="date"
                    id="tripDate"
                    value={tripDate}
                    onChange={(e) => setTripDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
                    dir="rtl"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="tripTime"
                    className="block mb-2 font-bold text-gray-700 text-left"
                  >
                    Trip time:
                  </label>
                  <input
                    type="time"
                    id="tripTime"
                    value={tripTime}
                    onChange={(e) => setTripTime(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
                    dir="rtl"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-md shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-left">
                Hotel Selection{" "}
              </h2>
              <HotelDropdown onSelectHotel={handleHotelSelect} />
            </div>

            <div className="bg-white p-4 rounded-md shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-left">
                Select city{" "}
              </h2>
              <CityDropdown onSelectCity={handleCitySelect} />
            </div>

            <div className="bg-white p-4 rounded-md shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-left">
                Select nationality{" "}
              </h2>
              <NationalityDropdown
                onSelectNationality={handleNationalitySelect}
              />
            </div>
          </div>

          {/* القسم الأيمن - بيانات السعر والمعلومات الإضافية */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-left">
                Select currency{" "}
              </h2>
              <CurrencyDropdown onSelectCurrency={handleCurrencySelect} />
            </div>

            <div className="bg-white p-4 rounded-md shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-left">
                Select Excursions{" "}
              </h2>
              <RoadDropdown onSelectRoad={handleRoadSelect} />
            </div>

            {/* مكون جدول الأسعار */}
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-left">
                Price calculation{" "}
              </h2>
              <PriceTable onPriceChange={handlePriceChange} />
            </div>

            {/* قسم بيانات الدفع */}
            {priceSummary && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-left">
                  Payment data{" "}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label
                      htmlFor="paid"
                      className="block mb-2 font-bold text-gray-700 text-left"
                    >
                      Paid amount:
                    </label>
                    <input
                      type="text"
                      id="paid"
                      value={paid}
                      onChange={(e) => setPaid(e.target.value)}
                      placeholder="Enter paid amount"
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
                      dir="rtl"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="unpaid"
                      className="block mb-2 font-bold text-gray-700 text-left"
                    >
                      Unpaid amount:
                    </label>
                    <input
                      type="text"
                      id="unpaid"
                      value={unpaid.toFixed(2)}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none bg-gray-100 rtl"
                      dir="rtl"
                      disabled
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* قسم للإجراءات والزر */}
        <div className="flex flex-col sm:flex-row justify-center items-center">
          <button
            type="submit"
            disabled={isLoading}
            className={`font-bold py-3 px-8 rounded-md w-full sm:w-auto text-white ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-700 hover:bg-red-800"
            }`}
          >
            {isLoading ? "جاري الإرسال..." : "Confirm your reservation"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Excursions;
