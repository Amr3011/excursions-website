import React, { useState } from "react";
import HotelDropdown from "../../components/shared/Dropdown/HotelDropdown";
import CityDropdown from "../../components/shared/Dropdown/CityDropdown";
import NationalityDropdown from "../../components/shared/Dropdown/NationalityDropdown";
import CurrencyDropdown from "../../components/shared/Dropdown/CurrencyDropdown";

const Excursions = () => {
  const [selectedHotel, setSelectedHotel] = useState(null);

  const handleHotelSelect = (hotel) => {
    setSelectedHotel(hotel);
    console.log("تم اختيار الفندق:", hotel);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-right">الرحلات السياحية</h1>

      {/* مكون القائمة المنسدلة للفنادق */}
      <div className="mb-6 bg-white p-4 rounded-md shadow-sm">
        <HotelDropdown onSelectHotel={handleHotelSelect} />
      </div>
      <div className="mb-6 bg-white p-4 rounded-md shadow-sm">
        <CityDropdown onSelectHotel={handleHotelSelect} />
      </div>
      <div className="mb-6 bg-white p-4 rounded-md shadow-sm">
        <NationalityDropdown onSelectHotel={handleHotelSelect} />
      </div>
      <div className="mb-6 bg-white p-4 rounded-md shadow-sm">
        <CurrencyDropdown onSelectHotel={handleHotelSelect} />
      </div>
    </div>
  );
};

export default Excursions;
