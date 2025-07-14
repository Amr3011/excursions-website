import React, { useState, useEffect, useRef, useCallback } from "react";

const PriceTable = ({
  initialValues = {},
  onPriceChange,
  currencySymbol = "$",
  readOnly = false,
}) => {
  // أعداد الأشخاص
  const [adultCount, setAdultCount] = useState(initialValues.adultCount || 0);
  const [childCount, setChildCount] = useState(initialValues.childCount || 0);
  const [infantCount, setInfantCount] = useState(
    initialValues.infantCount || 0
  );

  // أسعار الفرد الواحد
  const [adultPrice, setAdultPrice] = useState(initialValues.adultPrice || 0);
  const [childPrice, setChildPrice] = useState(initialValues.childPrice || 0);
  const [infantPrice, setInfantPrice] = useState(
    initialValues.infantPrice || 0
  );
  const [taxPerPerson, setTaxPerPerson] = useState(
    initialValues.taxPerPerson || 0
  );

  // الإجماليات
  const [adultTotal, setAdultTotal] = useState(0);
  const [childTotal, setChildTotal] = useState(0);
  const [infantTotal, setInfantTotal] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  // تتبع الرندر الأولي والتغييرات المهمة
  const isFirstRender = useRef(true);
  const previousValues = useRef({
    adultCount: initialValues.adultCount || 0,
    childCount: initialValues.childCount || 0,
    infantCount: initialValues.infantCount || 0,
    adultPrice: initialValues.adultPrice || 0,
    childPrice: initialValues.childPrice || 0,
    infantPrice: initialValues.infantPrice || 0,
    taxPerPerson: initialValues.taxPerPerson || 0,
  });

  // متغير لتتبع وقت آخر استدعاء لدالة onPriceChange
  const lastCallTimeRef = useRef(0);
  // وقت الانتظار بين الاستدعاءات (بالمللي ثانية)
  const callDebounceTime = 500;

  // عرض العرض المتقدم (للشاشات الكبيرة) أو المبسط (للشاشات الصغيرة)
  // تم تعديله ليكون العرض المبسط هو الافتراضي (false بدلاً من true)
  const [isAdvancedView, setIsAdvancedView] = useState(false);

  // التبديل بين العرض المتقدم والعرض المبسط عند تغيير حجم الشاشة
  // تم تعديلها بحيث لا تغير نوع العرض تلقائياً عند تغيير حجم الشاشة
  useEffect(() => {
    // تجنب خطأ "window is not defined" في SSR
    if (typeof window === "undefined") return;

    // بدون تغيير تلقائي للعرض - العرض المبسط هو الافتراضي دائماً
    // وهذا يعني أن المستخدم فقط يمكنه تغيير نوع العرض يدوياً
  }, []);

  // دالة محسنة لاستدعاء onPriceChange مع تأخير وتجنب الاستدعاءات المتكررة
  const debouncedPriceChange = useCallback(
    (data) => {
      const now = Date.now();

      // تجنب استدعاء الدالة في الرندر الأولي
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      // تحقق من وجود تغييرات فعلية في البيانات
      const hasChanges = Object.keys(previousValues.current).some(
        (key) => previousValues.current[key] !== data[key]
      );

      // إذا لم تكن هناك تغييرات فعلية، لا تستدع الدالة
      if (!hasChanges) {
        return;
      }

      // تحديث القيم السابقة
      previousValues.current = {
        adultCount: data.adultCount,
        childCount: data.childCount,
        infantCount: data.infantCount,
        adultPrice: data.adultPrice,
        childPrice: data.childPrice,
        infantPrice: data.infantPrice,
        taxPerPerson: data.taxPerPerson,
      };

      // تطبيق تأخير بين الاستدعاءات
      if (now - lastCallTimeRef.current > callDebounceTime) {
        lastCallTimeRef.current = now;

        if (onPriceChange) {
          onPriceChange(data);
        }
      } else {
        // إلغاء أي استدعاء معلق وجدولة استدعاء جديد
        clearTimeout(lastCallTimeRef.current);
        lastCallTimeRef.current = setTimeout(() => {
          lastCallTimeRef.current = Date.now();
          if (onPriceChange) {
            onPriceChange(data);
          }
        }, callDebounceTime);
      }
    },
    [onPriceChange]
  );

  // إعادة حساب الإجماليات عند تغيير أي من القيم
  useEffect(() => {
    const newAdultTotal = adultPrice * adultCount;
    const newChildTotal = childPrice * childCount;
    const newInfantTotal = infantPrice * infantCount;
    const newTaxTotal = taxPerPerson * (adultCount + childCount);
    const newGrandTotal =
      newAdultTotal + newChildTotal + newInfantTotal + newTaxTotal;

    setAdultTotal(newAdultTotal);
    setChildTotal(newChildTotal);
    setInfantTotal(newInfantTotal);
    setTaxTotal(newTaxTotal);
    setGrandTotal(newGrandTotal);

    const pricingData = {
      adultCount,
      childCount,
      infantCount,
      adultPrice,
      childPrice,
      infantPrice,
      taxPerPerson,
      adultTotal: newAdultTotal,
      childTotal: newChildTotal,
      infantTotal: newInfantTotal,
      taxTotal: newTaxTotal,
      grandTotal: newGrandTotal,
      totalPassengers: adultCount + childCount + infantCount,
    };

    // استدعاء دالة التغيير المُحسنة
    debouncedPriceChange(pricingData);
  }, [
    adultCount,
    childCount,
    infantCount,
    adultPrice,
    childPrice,
    infantPrice,
    taxPerPerson,
    debouncedPriceChange,
  ]);

  // تعديل عدد الأفراد
  const handleCountChange = (type, value) => {
    // إذا كان المستخدم يمسح الحقل، نعتبرها صفر
    if (value === "") {
      value = 0;
    } else {
      value = parseInt(value, 10);
      // التأكد من أن القيمة عدد صحيح موجب
      if (isNaN(value) || value < 0) {
        value = 0;
      }
    }

    switch (type) {
      case "adult":
        setAdultCount(value);
        break;
      case "child":
        setChildCount(value);
        break;
      case "infant":
        setInfantCount(value);
        break;
      default:
        break;
    }
  };

  // تعديل سعر الفرد الواحد
  const handlePriceChange = (type, value) => {
    // إذا كان المستخدم يمسح الحقل، نعتبرها صفر
    if (value === "") {
      value = 0;
    } else {
      value = parseFloat(value);
      // التأكد من أن القيمة رقم موجب
      if (isNaN(value) || value < 0) {
        value = 0;
      }
    }

    switch (type) {
      case "adult":
        setAdultPrice(value);
        break;
      case "child":
        setChildPrice(value);
        break;
      case "infant":
        setInfantPrice(value);
        break;
      case "tax":
        setTaxPerPerson(value);
        break;
      default:
        break;
    }
  };

  // عند التركيز على حقل، إذا كانت قيمته صفراً نقوم بتفريغه
  const handleFocus = (e) => {
    if (e.target.value === "0") {
      e.target.value = "";
    }
    e.target.select(); // تحديد كامل المحتوى
  };

  // عند فقدان التركيز، إذا كان الحقل فارغاً نعيد القيمة إلى صفر
  const handleBlur = (e, type, setter) => {
    if (e.target.value === "") {
      setter(0);
    }
  };

  // تنسيق الرقم بإضافة فاصلة عشرية إذا كان ضروريًا
  const formatNumber = (num) => {
    return num.toFixed(2);
  };

  // إضافة رمز العملة إذا كان مطلوباً
  const formatWithCurrency = (num) => {
    return `${formatNumber(num)} ${currencySymbol}`;
  };

  // عرض واجهة للشاشات الكبيرة (الجدول العادي)
  const renderDesktopView = () => (
    <div className="w-full overflow-x-auto">
      <table className="w-full table-auto text-center border-collapse">
        <thead>
          <tr>
            <th className="bg-white p-2 border-b border-gray-200"></th>
            <th className="bg-red-800 text-white p-1 text-sm">
              <div className="py-1">Ad</div>
            </th>
            <th className="bg-red-800 text-white p-1 text-sm">
              <div className="py-1">Chd</div>
            </th>
            <th className="bg-red-800 text-white p-1 text-sm">
              <div className="py-1">Inf</div>
            </th>
            <th className="bg-red-800 text-white p-1 text-sm">
              <div className="py-1">T-Pax</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {/* صف عدد الأفراد */}
          <tr>
            <td className="bg-blue-500 text-white font-medium p-1 text-sm">
              <div className="py-1">Count</div>
            </td>
            <td className="p-1 border border-gray-300">
              <input
                type="number"
                min="0"
                value={adultCount || ""}
                onChange={(e) => handleCountChange("adult", e.target.value)}
                onFocus={handleFocus}
                onBlur={(e) => handleBlur(e, "adult", setAdultCount)}
                className="w-full px-1 py-1 text-center text-sm"
                placeholder="0"
                disabled={readOnly}
              />
            </td>
            <td className="p-1 border border-gray-300">
              <input
                type="number"
                min="0"
                value={childCount || ""}
                onChange={(e) => handleCountChange("child", e.target.value)}
                onFocus={handleFocus}
                onBlur={(e) => handleBlur(e, "child", setChildCount)}
                className="w-full px-1 py-1 text-center text-sm"
                placeholder="0"
                disabled={readOnly}
              />
            </td>
            <td className="p-1 border border-gray-300">
              <input
                type="number"
                min="0"
                value={infantCount || ""}
                onChange={(e) => handleCountChange("infant", e.target.value)}
                onFocus={handleFocus}
                onBlur={(e) => handleBlur(e, "infant", setInfantCount)}
                className="w-full px-1 py-1 text-center text-sm"
                placeholder="0"
                disabled={readOnly}
              />
            </td>
            <td className="p-1 border border-gray-300">
              <input
                type="text"
                value={adultCount + childCount + infantCount}
                readOnly
                className="w-full px-1 py-1 text-center text-sm bg-gray-100"
              />
            </td>
          </tr>

          {/* صف سعر الفرد */}
          <tr>
            <td className="bg-blue-500 text-white font-medium p-1 text-sm">
              <div className="py-1">Price</div>
            </td>
            <td className="p-1 border border-gray-300">
              <input
                type="number"
                min="0"
                step="0.01"
                value={adultPrice || ""}
                onChange={(e) => handlePriceChange("adult", e.target.value)}
                onFocus={handleFocus}
                onBlur={(e) => handleBlur(e, "adult", setAdultPrice)}
                className="w-full px-1 py-1 text-center text-sm"
                placeholder="0.00"
                disabled={readOnly}
              />
            </td>
            <td className="p-1 border border-gray-300">
              <input
                type="number"
                min="0"
                step="0.01"
                value={childPrice || ""}
                onChange={(e) => handlePriceChange("child", e.target.value)}
                onFocus={handleFocus}
                onBlur={(e) => handleBlur(e, "child", setChildPrice)}
                className="w-full px-1 py-1 text-center text-sm"
                placeholder="0.00"
                disabled={readOnly}
              />
            </td>
            <td className="p-1 border border-gray-300">
              <input
                type="number"
                min="0"
                step="0.01"
                value={infantPrice || ""}
                onChange={(e) => handlePriceChange("infant", e.target.value)}
                onFocus={handleFocus}
                onBlur={(e) => handleBlur(e, "infant", setInfantPrice)}
                className="w-full px-1 py-1 text-center text-sm"
                placeholder="0.00"
                disabled={readOnly}
              />
            </td>
           
          </tr>

          {/* صف السعر الإجمالي */}
          <tr>
            <td className="bg-red-700 text-white font-medium p-1 text-sm">
              <div className="py-1">Total Price</div>
            </td>
            <td className="p-1 border border-gray-300">
              <input
                type="text"
                value={formatWithCurrency(adultTotal)}
                readOnly
                className="w-full px-1 py-1 text-center text-sm bg-gray-100"
              />
            </td>
            <td className="p-1 border border-gray-300">
              <input
                type="text"
                value={formatWithCurrency(childTotal)}
                readOnly
                className="w-full px-1 py-1 text-center text-sm bg-gray-100"
              />
            </td>
            <td className="p-1 border border-gray-300">
              <input
                type="text"
                value={formatWithCurrency(infantTotal)}
                readOnly
                className="w-full px-1 py-1 text-center text-sm bg-gray-100"
              />
            </td>
            <td className="p-1 border border-gray-300">
              <input
                type="text"
                value={formatWithCurrency(grandTotal)}
                readOnly
                className="w-full px-1 py-1 text-center text-sm font-bold bg-gray-100"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  // عرض واجهة للشاشات الصغيرة (بطاقات مقسمة)
  const renderMobileView = () => (
    <div className="space-y-4">
      {/* بطاقة البالغين */}
      <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
        <div className="bg-red-800 text-white px-3 py-2 text-sm font-medium">
          Adults (Ad)
        </div>
        <div className="p-3 space-y-2">
          <div className="flex justify-between items-center">
            <label className="font-medium text-sm">Number :</label>
            <input
              type="number"
              min="0"
              value={adultCount || ""}
              onChange={(e) => handleCountChange("adult", e.target.value)}
              onFocus={handleFocus}
              onBlur={(e) => handleBlur(e, "adult", setAdultCount)}
              className="w-24 px-2 py-1 text-center border rounded"
              placeholder="0"
              disabled={readOnly}
            />
          </div>
          <div className="flex justify-between items-center">
            <label className="font-medium text-sm">Price :</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={adultPrice || ""}
              onChange={(e) => handlePriceChange("adult", e.target.value)}
              onFocus={handleFocus}
              onBlur={(e) => handleBlur(e, "adult", setAdultPrice)}
              className="w-24 px-2 py-1 text-center border rounded"
              placeholder="0.00"
              disabled={readOnly}
            />
          </div>
          <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
            <label className="font-medium text-sm">Total :</label>
            <div className="text-right font-bold">
              {formatWithCurrency(adultTotal)}
            </div>
          </div>
        </div>
      </div>

      {/* بطاقة الأطفال */}
      <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
        <div className="bg-red-800 text-white px-3 py-2 text-sm font-medium">
          Children (Chd)
        </div>
        <div className="p-3 space-y-2">
          <div className="flex justify-between items-center">
            <label className="font-medium text-sm">Number :</label>
            <input
              type="number"
              min="0"
              value={childCount || ""}
              onChange={(e) => handleCountChange("child", e.target.value)}
              onFocus={handleFocus}
              onBlur={(e) => handleBlur(e, "child", setChildCount)}
              className="w-24 px-2 py-1 text-center border rounded"
              placeholder="0"
              disabled={readOnly}
            />
          </div>
          <div className="flex justify-between items-center">
            <label className="font-medium text-sm">Price :</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={childPrice || ""}
              onChange={(e) => handlePriceChange("child", e.target.value)}
              onFocus={handleFocus}
              onBlur={(e) => handleBlur(e, "child", setChildPrice)}
              className="w-24 px-2 py-1 text-center border rounded"
              placeholder="0.00"
              disabled={readOnly}
            />
          </div>
          <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
            <label className="font-medium text-sm">Total :</label>
            <div className="text-right font-bold">
              {formatWithCurrency(childTotal)}
            </div>
          </div>
        </div>
      </div>

      {/* بطاقة الرضع */}
      <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
        <div className="bg-red-800 text-white px-3 py-2 text-sm font-medium">
          Infants (Inf)
        </div>
        <div className="p-3 space-y-2">
          <div className="flex justify-between items-center">
            <label className="font-medium text-sm">Number:</label>
            <input
              type="number"
              min="0"
              value={infantCount || ""}
              onChange={(e) => handleCountChange("infant", e.target.value)}
              onFocus={handleFocus}
              onBlur={(e) => handleBlur(e, "infant", setInfantCount)}
              className="w-24 px-2 py-1 text-center border rounded"
              placeholder="0"
              disabled={readOnly}
            />
          </div>
          <div className="flex justify-between items-center">
            <label className="font-medium text-sm">Price:</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={infantPrice || ""}
              onChange={(e) => handlePriceChange("infant", e.target.value)}
              onFocus={handleFocus}
              onBlur={(e) => handleBlur(e, "infant", setInfantPrice)}
              className="w-24 px-2 py-1 text-center border rounded"
              placeholder="0.00"
              disabled={readOnly}
            />
          </div>
          <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
            <label className="font-medium text-sm">Total:</label>
            <div className="text-right font-bold">
              {formatWithCurrency(infantTotal)}
            </div>
          </div>
        </div>
      </div>

      {/* بطاقة الضرائب والإجمالي */}
      <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
        <div className="p-3 space-y-2">
          <div className="flex justify-between items-center">
            <label className="font-medium text-sm">T.Pax</label>
            <div className="text-right">
              {adultCount + childCount + infantCount}
            </div>
          </div>
          <div className="flex justify-between items-center bg-red-50 p-2 rounded mt-2">
            <label className="font-bold">Total Value:</label>
            <div className="text-right font-bold text-lg text-red-700">
              {formatWithCurrency(grandTotal)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* زر التبديل بين العرضين - متاح دائماً على جميع أحجام الشاشة */}
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => setIsAdvancedView(!isAdvancedView)}
          className="text-xs px-2 py-1 bg-gray-200 rounded"
        >
          {isAdvancedView ? "Simplified view" : "View table"}
        </button>
      </div>

      {/* عرض مبسط افتراضياً */}
      {isAdvancedView ? renderDesktopView() : renderMobileView()}
    </div>
  );
};

export default PriceTable;
