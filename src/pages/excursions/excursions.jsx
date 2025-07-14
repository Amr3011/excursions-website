import React, { useState, useEffect } from "react";
import HotelDropdown from "../../components/shared/Dropdown/HotelDropdown";
import CityDropdown from "../../components/shared/Dropdown/CityDropdown";
import NationalityDropdown from "../../components/shared/Dropdown/NationalityDropdown";
import CurrencyDropdown from "../../components/shared/Dropdown/CurrencyDropdown";
import RoadDropdown from "./../../components/shared/Dropdown/RoadDropdown";
import PriceTable from "../../components/shared/form/PriceTable";

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
  const [paid, setPaid] = useState(""); // تغيير القيمة الأولية إلى نص فارغ بدلاً من صفر
  const [unpaid, setUnpaid] = useState(0);

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

    // إعادة حساب المبلغ المتبقي عند تغيير السعر الإجمالي
    if (priceData) {
      const paidAmount = parseFloat(paid) || 0;
      const remaining = Math.max(0, priceData.grandTotal - paidAmount);
      setUnpaid(remaining);
    }
  };

  // معالجة تغيير قيمة المبلغ المدفوع - تم تعديل الدالة لتسمح بإدخال أي قيمة نصية
  const handlePaidChange = (value) => {
    // السماح بأي قيمة نصية في الحقل
    setPaid(value);

    // حساب المبلغ المتبقي بناءً على القيمة المدخلة (إذا كانت رقم صالح)
    if (priceSummary) {
      const paidAmount = parseFloat(value) || 0;
      const remaining = Math.max(0, priceSummary.grandTotal - paidAmount);
      setUnpaid(remaining);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // تحويل قيمة المدفوع إلى رقم عند إرسال النموذج
    const paidAmount = parseFloat(paid) || 0;

    console.log("تم تأكيد الحجز", {
      hotel: selectedHotel,
      city: selectedCity,
      pricing: priceSummary,
      name,
      telephone,
      roomNo,
      tripDate,
      tripTime,
      receiver,
      paid: paidAmount,
      unpaid,
    });
  };

  // مكون حقل الإدخال المخصص لإعادة الاستخدام
  const InputField = ({
    label,
    id,
    value,
    onChange,
    type = "text",
    placeholder,
    required = false,
    disabled = false,
  }) => (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block mb-2 font-bold text-gray-700 text-left"
      >
        {label}:
      </label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full p-2 border border-gray-300 rounded focus:outline-none ${
          disabled
            ? "bg-gray-100"
            : "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        } rtl`}
        dir="rtl"
        required={required}
        disabled={disabled}
      />
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-left">Tourist trips</h1>

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
                <InputField
                  label="Name"
                  id="name"
                  value={name}
                  onChange={setName}
                  placeholder="Enter full name"
                  required
                />

                <InputField
                  label="Telephone"
                  id="telephone"
                  value={telephone}
                  onChange={setTelephone}
                  placeholder="Enter phone number"
                  type="tel"
                  required
                />

                <InputField
                  label="Room number"
                  id="roomNo"
                  value={roomNo}
                  onChange={setRoomNo}
                  placeholder="Enter room number"
                />

                <InputField
                  label="Receiver"
                  id="receiver"
                  value={receiver}
                  onChange={setReceiver}
                  placeholder="Enter the recipient's name"
                />

                <InputField
                  label="Trip date"
                  id="tripDate"
                  value={tripDate}
                  onChange={setTripDate}
                  placeholder="Enter trip date"
                  type="date"
                  required
                />

                <InputField
                  label="Trip time"
                  id="tripTime"
                  value={tripTime}
                  onChange={setTripTime}
                  placeholder="Enter trip time"
                  type="time"
                  required
                />
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
                  {/* تم تغيير نوع الحقل إلى "text" بدلاً من "number" */}
                  <InputField
                    label="Paid amount"
                    id="paid"
                    value={paid}
                    onChange={handlePaidChange}
                    placeholder="Enter paid amount"
                    type="text" // تغيير نوع الحقل
                    required
                  />

                  <InputField
                    label="Unpaid amount"
                    id="unpaid"
                    value={unpaid.toFixed(2)}
                    onChange={() => {}}
                    type="text"
                    disabled={true}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* قسم للإجراءات والزر */}
        <div className="flex flex-col sm:flex-row justify-center items-center">
          <button
            type="submit"
            className="bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-8 rounded-md w-full sm:w-auto"
          >
            Confirm your reservation{" "}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Excursions;
