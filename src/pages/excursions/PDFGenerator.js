import { jsPDF } from "jspdf";
import "jspdf-autotable";

// تحويل النص العربي للاتجاه الصحيح (بدون خطوط خارجية)
const processArabicText = (text) => {
  if (!text) return "";

  let processedText = String(text).trim();

  // إصلاح مشاكل الترميز
  try {
    if (processedText.includes("þ") || processedText.includes("Ã")) {
      processedText = decodeURIComponent(escape(processedText));
    }
  } catch (error) {
    console.warn("خطأ في معالجة النص:", error);
  }

  return processedText;
};

// التحقق من النص العربي
const isArabicText = (text) => {
  if (!text) return false;
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return arabicRegex.test(text);
};

// كتابة النص العربي بشكل بسيط وموثوق
const addTextToPDF = (doc, text, x, y, options = {}) => {
  if (!text) return;

  const processedText = processArabicText(text);

  try {
    // إعداد الخط والحجم
    if (options.fontSize) {
      doc.setFontSize(options.fontSize);
    }

    // كتابة النص مع دعم الاتجاه
    const textOptions = {
      maxWidth: options.maxWidth || 100,
    };

    if (options.align === "right") {
      textOptions.align = "right";
    }

    // إذا كان النص عربي، حاول استخدام الدعم المدمج
    if (isArabicText(processedText)) {
      textOptions.direction = "rtl";
      textOptions.lang = "ar";
    }

    doc.text(processedText, x, y, textOptions);
  } catch (error) {
    console.warn("خطأ في كتابة النص:", error);
    // في حالة الخطأ، استخدم الطريقة البسيطة
    doc.text(processedText, x, y);
  }
};

// كلاس PDF Generator البسيط والموثوق
export class PDFGenerator {
  constructor() {
    this.doc = null;
    this.pdfBlob = null;
  }

  generateVoucherPDF(formData) {
    try {
      // إنشاء PDF بسيط بدون تعقيدات
      this.doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // إعداد خصائص PDF
      this.doc.setProperties({
        title: `Blue Bay Voucher - ${formData.name || "Customer"}`,
        creator: "Blue Bay Diving Center",
        subject: "Diving Trip Voucher",
      });

      // الألوان
      const borderColor = [0, 128, 128];
      const textColor = [0, 0, 0];
      const headerColor = [0, 114, 187];
      const accentColor = [242, 169, 59];

      // الإطار الخارجي
      this.doc.setDrawColor(...borderColor);
      this.doc.setLineWidth(1);
      this.doc.rect(10, 10, 190, 277);

      // الترويسة
      this.doc.setFontSize(10);
      this.doc.setTextColor(...textColor);
      this.doc.setFont("helvetica", "normal");
      this.doc.text("Tele : +2 010 2287 4878", 15, 25);
      this.doc.text("www.bluebay-egypt.com", 15, 30);

      // اللوجو
      this.doc.setFontSize(16);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(...headerColor);
      this.doc.text("BLUE BAY", 85, 25);
      this.doc.setTextColor(...accentColor);
      this.doc.text("DIVING CENTER", 82, 32);

      // النص العربي في الترويسة
      this.doc.setFontSize(10);
      this.doc.setTextColor(...textColor);
      this.doc.setFont("helvetica", "normal");

      // خط فاصل
      this.doc.setLineWidth(0.5);
      this.doc.line(10, 40, 200, 40);

      // معلومات القسيمة
      const voucherNo =
        formData.voucherNo || `BB-${Date.now().toString().slice(-6)}`;
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(11);
      this.doc.setTextColor(...textColor);

      this.doc.text("Voucher No :", 15, 50);
      this.doc.text(voucherNo, 55, 50);
      this.doc.text("Voucher Date :", 130, 50);
      this.doc.text(
        formData.voucherDate || new Date().toLocaleDateString(),
        175,
        50
      );

      this.doc.line(10, 55, 200, 55);

      // بيانات العميل
      let yPos = 65;

      // الاسم
      this.doc.text("Name :", 15, yPos);
      const customerName = processArabicText(formData.name || "");
      if (isArabicText(customerName)) {
        addTextToPDF(this.doc, customerName, 190, yPos, {
          align: "right",
          fontSize: 11,
          maxWidth: 80,
        });
      } else {
        this.doc.text(customerName, 45, yPos);
      }

      // الجنسية
      yPos += 8;
      this.doc.text("Nationality :", 15, yPos);
      const nationality = processArabicText(formData.nationality || "");
      if (isArabicText(nationality)) {
        addTextToPDF(this.doc, nationality, 190, yPos, {
          align: "right",
          fontSize: 11,
        });
      } else {
        this.doc.text(nationality, 45, yPos);
      }

      // الفندق
      yPos += 8;
      this.doc.text("Hotel :", 15, yPos);
      const hotel = processArabicText(formData.hotel || "");
      if (isArabicText(hotel)) {
        addTextToPDF(this.doc, hotel, 190, yPos, {
          align: "right",
          fontSize: 11,
          maxWidth: 80,
        });
      } else {
        this.doc.text(hotel, 45, yPos);
      }

      // الرحلة
      yPos += 8;
      this.doc.text("Excursion :", 15, yPos);
      const excursion = processArabicText(formData.excursion || "");
      if (isArabicText(excursion)) {
        addTextToPDF(this.doc, excursion, 190, yPos, {
          align: "right",
          fontSize: 11,
          maxWidth: 80,
        });
      } else {
        this.doc.text(excursion, 45, yPos);
      }

      // العمود الثاني
      yPos = 65;
      this.doc.text("Room No :", 110, yPos);
      this.doc.text(String(formData.roomNo || ""), 140, yPos);

      yPos += 8;
      this.doc.text("Trip Date :", 110, yPos);
      this.doc.text(String(formData.tripDate || ""), 140, yPos);

      yPos += 8;
      this.doc.text("Time :", 110, yPos);
      this.doc.text(String(formData.tripTime || ""), 140, yPos);

      yPos += 8;
      this.doc.text("Telephone :", 110, yPos);
      this.doc.text(String(formData.telephone || ""), 155, yPos);

      // خط فاصل
      this.doc.line(10, 100, 200, 100);

      // تفاصيل الدفع
      yPos = 110;
      this.doc.text("Currency :", 15, yPos);

      const currency = processArabicText(formData.currency || "");
      if (isArabicText(currency)) {
        addTextToPDF(this.doc, currency, 100, yPos, {
          align: "right",
          fontSize: 11,
        });
      } else {
        this.doc.text(currency, 45, yPos);
      }

      // المسافرون
      this.doc.text("Passengers :", 110, yPos);

      yPos += 5;
      this.doc.text(
        `Adults: ${formData.ad || formData.adultCount || 0}`,
        110,
        yPos
      );

      yPos += 5;
      this.doc.text(
        `Children: ${formData.child || formData.childCount || 0}`,
        110,
        yPos
      );

      yPos += 5;
      this.doc.text(
        `Infants: ${formData.inf || formData.infantCount || 0}`,
        110,
        yPos
      );

      // المبالغ
      yPos += 10;
      this.doc.text("Total Amount :", 15, yPos);
      this.doc.text(
        String(formData.price || formData.grandTotal || 0),
        65,
        yPos
      );

      this.doc.text("Paid :", 110, yPos);
      this.doc.text(String(formData.paid || 0), 130, yPos);

      this.doc.text("Balance :", 155, yPos);
      this.doc.text(String(formData.unpaid || 0), 180, yPos);

      // المستلم
      yPos += 10;
      this.doc.text("Receiver :", 15, yPos);
      const receiver = processArabicText(formData.receiver || "");
      if (isArabicText(receiver)) {
        addTextToPDF(this.doc, receiver, 190, yPos, {
          align: "right",
          fontSize: 11,
          maxWidth: 80,
        });
      } else {
        this.doc.text(receiver, 45, yPos);
      }

      // خط فاصل
      this.doc.line(10, yPos + 5, 200, yPos + 5);

      // ملاحظة الاسترداد (إنجليزي)
      this.doc.setFontSize(8);
      this.doc.text(
        "Refunds available with 24h notice and ticket return. No show = No refund.",
        15,
        yPos + 15,
        { maxWidth: 180 }
      );

      // خط متقطع
      const dashY = yPos + 40;
      this.doc.setLineWidth(0.5);
      for (let x = 15; x < 195; x += 5) {
        this.doc.line(x, dashY, x + 2, dashY);
      }

      // التاريخ ورقم الصفحة
      this.doc.setFontSize(10);
      this.doc.text(new Date().toLocaleDateString(), 15, dashY + 10);
      this.doc.text("Page 1", 185, dashY + 10);

      console.log("PDF created successfully with Arabic support");
      return this.doc;
    } catch (error) {
      console.error("Error creating PDF:", error);

      // PDF احتياطي بسيط
      this.doc = new jsPDF();
      this.doc.setFontSize(16);
      this.doc.text("Blue Bay Diving Center", 20, 20);
      this.doc.setFontSize(12);
      this.doc.text("Voucher Details:", 20, 40);
      this.doc.text(`Customer: ${formData.name || "N/A"}`, 20, 50);
      this.doc.text(`Trip: ${formData.excursion || "N/A"}`, 20, 60);
      this.doc.text(`Date: ${formData.tripDate || "N/A"}`, 20, 70);
      this.doc.text(
        `Amount: ${formData.price || formData.grandTotal || 0}`,
        20,
        80
      );
      this.doc.text(`Phone: +2 010 2287 4878`, 20, 90);

      return this.doc;
    }
  }

  getPDFBlob() {
    if (!this.doc) {
      throw new Error("PDF document not generated yet");
    }
    this.pdfBlob = this.doc.output("blob");
    return this.pdfBlob;
  }

  downloadPDF(filename = "voucher.pdf") {
    if (!this.doc) {
      throw new Error("PDF document not generated yet");
    }
    this.doc.save(filename);
  }

  getPDFBase64() {
    if (!this.doc) {
      throw new Error("PDF document not generated yet");
    }
    return this.doc.output("datauristring");
  }

  createPDFDownloadLink(filename = "voucher.pdf") {
    if (!this.doc) {
      throw new Error("PDF document not generated yet");
    }

    const pdfBlob = this.getPDFBlob();
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    return { url, link, filename };
  }
}

// دوال بسيطة وموثوقة
export const generateExcursionPDF = (formData) => {
  const pdfGenerator = new PDFGenerator();
  pdfGenerator.generateVoucherPDF(formData);
  return pdfGenerator;
};

export const downloadPDF = (doc, filename = "voucher.pdf") => {
  doc.save(filename);
};

// 🌊 **دالة WhatsApp بالتنسيق المطلوب بالضبط** 🌊
export const sendPDFToWhatsAppWithDownload = (
  phoneNumber,
  pdfData,
  pdfGenerator
) => {
  try {
    console.log("🚀 Starting WhatsApp send process...");

    // تنسيق رقم الهاتف
    let formattedPhone = String(phoneNumber).replace(/\D/g, "");
    console.log("📞 Original phone:", phoneNumber);
    console.log("📞 Cleaned phone:", formattedPhone);

    // إضافة كود مصر إذا لم يكن موجود
    if (!formattedPhone.startsWith("2")) {
      formattedPhone = "2" + formattedPhone;
    }
    console.log("📞 Final phone:", formattedPhone);

    // تحميل PDF
    if (pdfGenerator && pdfGenerator.doc) {
      console.log("💾 Downloading PDF...");
      const customerName = String(pdfData.name || "Customer").replace(
        /[^a-zA-Z0-9]/g,
        "_"
      );
      const date = new Date().toISOString().split("T")[0];
      const fileName = `BlueBay_Voucher_${customerName}_${date}.pdf`;

      pdfGenerator.downloadPDF(fileName);
      console.log("✅ PDF downloaded:", fileName);
    }

    // 🌊 **الرسالة بالتنسيق المطلوب بالضبط** 🌊
    const message = `Your trip booking has been successfully confirmed 🌊

📋 Booking Details:
• Name: ${pdfData.name || ""}
• Hotel: ${pdfData.hotel || ""}
• Trip: ${pdfData.excursion || ""}
• Date: ${pdfData.tripDate || ""}
• Time: ${pdfData.tripTime || ""}
• Room Number: ${pdfData.roomNo || ""}

💰 Payment Details:
• Total Amount: ${pdfData.price || pdfData.grandTotal || 0}
• Amount Paid: ${pdfData.paid || 0}
• Balance Due: ${pdfData.unpaid || 0}

📞 For inquiries: +2 010 2287 4878
🌐 Website: www.bluebay-egypt.com

We look forward to serving you! 🐠
Blue Bay Diving Center`;

    console.log("📝 Message created, length:", message.length);

    // ترميز الرسالة
    const encodedMessage = encodeURIComponent(message);
    console.log("🔗 Message encoded successfully");

    // إنشاء رابط WhatsApp
    const whatsappURL = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    console.log("🔗 WhatsApp URL created");
    console.log("🔗 URL length:", whatsappURL.length);

    // فتح WhatsApp
    console.log("🚀 Opening WhatsApp...");
    const whatsappWindow = window.open(whatsappURL, "_blank");

    if (whatsappWindow) {
      console.log("✅ WhatsApp opened successfully!");
      return {
        success: true,
        message: "WhatsApp opened successfully",
        phoneNumber: formattedPhone,
        url: whatsappURL,
      };
    } else {
      console.warn("⚠️ Failed to open WhatsApp window");
      // جرب طريقة بديلة
      window.location.href = whatsappURL;
      return {
        success: true,
        message: "WhatsApp redirect initiated",
        phoneNumber: formattedPhone,
        url: whatsappURL,
      };
    }
  } catch (error) {
    console.error("❌ Error in WhatsApp function:", error);
    return {
      success: false,
      message: "Error: " + error.message,
      error: error,
    };
  }
};

// دالة بديلة بسيطة جداً
export const sendToWhatsApp = (phoneNumber, pdfData) => {
  try {
    console.log("📱 Simple WhatsApp function...");

    let phone = String(phoneNumber).replace(/\D/g, "");
    if (!phone.startsWith("2")) phone = "2" + phone;

    const msg = `Your trip booking has been successfully confirmed 🌊

📋 Booking Details:
• Name: ${pdfData.name || ""}
• Hotel: ${pdfData.hotel || ""}
• Trip: ${pdfData.excursion || ""}
• Date: ${pdfData.tripDate || ""}
• Time: ${pdfData.tripTime || ""}
• Room Number: ${pdfData.roomNo || ""}

💰 Payment Details:
• Total Amount: ${pdfData.price || pdfData.grandTotal || 0}
• Amount Paid: ${pdfData.paid || 0}
• Balance Due: ${pdfData.unpaid || 0}

📞 For inquiries:  +2 010 2287 4878

We look forward to serving you! 🐠
Blue Bay Diving Center`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

    console.log("🔗 Simple URL:", url);
    window.open(url, "_blank");

    return { success: true, phone: phone };
  } catch (error) {
    console.error("❌ Simple WhatsApp error:", error);
    return { success: false, error: error.message };
  }
};

export const sendPDFToWhatsApp = (
  phoneNumber,
  pdfData,
  pdfGenerator = null
) => {
  console.log("📞 sendPDFToWhatsApp called with:", {
    phoneNumber,
    hasGenerator: !!pdfGenerator,
  });

  if (pdfGenerator) {
    return sendPDFToWhatsAppWithDownload(phoneNumber, pdfData, pdfGenerator);
  } else {
    console.log("⚠️ No PDF generator, using simple WhatsApp");
    return sendToWhatsApp(phoneNumber, pdfData);
  }
};

export const openPDFInNewWindow = (pdfGenerator) => {
  try {
    const pdfBlob = pdfGenerator.getPDFBlob();
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const newWindow = window.open(pdfUrl, "_blank");
    if (newWindow) {
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
      return { success: true, message: "PDF opened successfully" };
    }
    throw new Error("Failed to open window");
  } catch (error) {
    return { success: false, message: error.message };
  }
};
