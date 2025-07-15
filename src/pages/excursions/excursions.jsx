import React, { useState, useEffect } from "react";
import HotelDropdown from "../../components/shared/Dropdown/HotelDropdown";
import CityDropdown from "../../components/shared/Dropdown/CityDropdown";
import NationalityDropdown from "../../components/shared/Dropdown/NationalityDropdown";
import CurrencyDropdown from "../../components/shared/Dropdown/CurrencyDropdown";
import RoadDropdown from "./../../components/shared/Dropdown/RoadDropdown";
import PriceTable from "../../components/shared/form/PriceTable";
import { PDFGenerator, sendPDFToWhatsApp } from "./PDFGenerator";
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

  // إضافة رقم الواتس
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // دالة إعادة تعيين جميع القيم
  const resetForm = () => {
    setSelectedHotel(null);
    setSelectedCity(null);
    setSelectedNationality(null);
    setSelectedCurrency(null);
    setSelectedRoad(null);
    setPriceSummary(null);
    setName("");
    setTelephone("");
    setRoomNo("");
    setTripDate("");
    setTripTime("");
    setReceiver("");
    setPaid("");
    setUnpaid(0);
    setWhatsappNumber("");
    setError(null);
    setSuccessMessage(null);

    // إعادة تعيين الـ dropdowns عن طريق إعادة تحميل الصفحة أو إرسال إشارة reset
    window.location.reload();
  };

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

  // الحصول على تاريخ اليوم بتنسيق YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // إعداد رقم الواتس (إضافة +2 إذا لم يكن موجود)
  const formatWhatsAppNumber = (number) => {
    if (!number) return "";

    // إزالة المسافات والرموز غير المرغوبة
    const cleanNumber = number.replace(/[^\d]/g, "");

    // إضافة +2 إذا لم يكن موجود
    if (cleanNumber.startsWith("2")) {
      return cleanNumber;
    } else {
      return `2${cleanNumber}`;
    }
  };

  // تحضير بيانات PDF
  const preparePDFData = (requestData) => {
    return {
      voucherDate: requestData.voucherDate,
      voucherNo: "", // يمكن إضافة رقم الفاوتشر هنا
      name: requestData.name,
      roomNo: requestData.roomNo,
      nationality: selectedNationality?.NationalityName || "",
      tripDate: requestData.tripDate,
      hotel: selectedHotel?.HotelName || "",
      tripTime: requestData.tripTime,
      excursion: selectedRoad?.RoadName || "",
      telephone: requestData.telephone,
      currency: selectedCurrency?.CurrencyName || "",
      ad: requestData.ad,
      child: requestData.child,
      inf: requestData.inf,
      price: requestData.price,
      paid: requestData.paid,
      unpaid: requestData.unpaid,
      receiver: requestData.receiver,
    };
  };

  // دالة لإرسال البيانات إلى API
  const sendToAPI = async (requestData) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("إرسال البيانات إلى API:", requestData);

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

      return result;
    } catch (error) {
      console.error("Error sending data:", error);
      setError("حدث خطأ أثناء إرسال البيانات: " + error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // دالة لإنشاء وإرسال PDF
  const generateAndSendPDF = async (requestData) => {
    try {
      // تحضير بيانات PDF
      const pdfData = preparePDFData(requestData);

      // إنشاء PDF
      const pdfGenerator = new PDFGenerator();
      const doc = pdfGenerator.generateVoucherPDF(pdfData);
      const pdfBlob = pdfGenerator.getPDFBlob();

      // إنشاء اسم الملف
      const fileName = `Blue_Bay_Voucher_${requestData.name}_${requestData.voucherDate}.pdf`;

      // تحميل PDF
      pdfGenerator.downloadPDF(fileName);

      // إرسال تفاصيل الحجز عبر WhatsApp إذا كان رقم الواتس موجود
      if (whatsappNumber) {
        const formattedNumber = formatWhatsAppNumber(whatsappNumber);
        const whatsappResult = sendPDFToWhatsApp(formattedNumber, pdfData);

        if (whatsappResult.success) {
          setSuccessMessage("تم إنشاء PDF وإرسال تفاصيل الحجز عبر الواتساب!");
        } else {
          setError(whatsappResult.message);
        }
      } else {
        setSuccessMessage("تم إنشاء PDF بنجاح!");
      }

      console.log("تم إنشاء PDF بنجاح");
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("حدث خطأ أثناء إنشاء PDF: " + error.message);
    }
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
      voucherDate: getCurrentDate(),
      name: name,
      nationality: selectedNationality.NationalityCode,
      telephone: telephone,
      hotel: selectedHotel.HotelCode,
      roomNo: roomNo,
      customer: 999,
      excursion: selectedRoad.RoadCode,
      ad: priceSummary.adultCount || 0,
      child: priceSummary.childCount || 0,
      inf: priceSummary.infantCount || 0,
      tripDate: tripDate,
      tripTime: tripTime,
      currency: selectedCurrency.CurrencyCode,
      price: priceSummary.grandTotal || 0,
      paid: paidAmount,
      unpaid: unpaid,
      receiver: receiver,
    };

    console.log("تم تأكيد الحجز", requestData);

    try {
      // إرسال البيانات إلى API أولاً
      await sendToAPI(requestData);

      // إظهار رسالة نجاح لـ API
      setSuccessMessage("تم حفظ البيانات بنجاح!");

      // إنشاء وإرسال PDF بعد نجاح إرسال البيانات
      await generateAndSendPDF(requestData);

      // إعادة تعيين النموذج بعد نجاح الإرسال
      resetForm();

      // إخفاء رسالة النجاح بعد 5 ثوان
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error) {
      // الخطأ تم معالجته في الدوال المختصة
      console.error("Error in handleSubmit:", error);
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

                {/* حقل رقم الواتس */}
                <div className="mb-4 md:col-span-2">
                  <label
                    htmlFor="whatsappNumber"
                    className="block mb-2 font-bold text-gray-700 text-left"
                  >
                    WhatsApp Number :
                  </label>
                  <input
                    type="tel"
                    id="whatsappNumber"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="Enter WhatsApp number (e.g., 01234567890)"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl"
                    dir="rtl"
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
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
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
