export function getBMIData(weight, heightCm) {
  const heightM = heightCm / 100;
  const bmi = weight / (heightM * heightM);

  let category = "Bình thường";
  let color = "#22c55e";
  let advice =
    "Bạn đang ở vùng BMI cân đối. Hãy duy trì tập luyện và dinh dưỡng ổn định.";
  let detail =
    "Cơ thể đang ở ngưỡng an toàn, phù hợp để duy trì hoặc tối ưu thêm hiệu suất tập luyện.";

  if (bmi < 18.5) {
    category = "Thiếu cân";
    color = "#f59e0b";
    advice =
      "Bạn nên tăng nhẹ lượng calories, ưu tiên protein và tập sức mạnh để cải thiện thể trạng.";
    detail =
      "BMI thấp cho thấy bạn có thể cần tăng cân lành mạnh để hỗ trợ sức bền và khối cơ.";
  } else if (bmi < 25) {
    category = "Bình thường";
    color = "#22c55e";
    advice =
      "Chỉ số rất tốt. Tiếp tục duy trì lối sống lành mạnh, ngủ đủ và tập đều.";
    detail = "Bạn đang ở vùng BMI lý tưởng với đa số người trưởng thành.";
  } else if (bmi < 30) {
    category = "Thừa cân";
    color = "#f97316";
    advice =
      "Nên kết hợp cardio, kiểm soát khẩu phần và duy trì lịch tập đều để hạ chỉ số BMI.";
    detail =
      "BMI đang cao hơn ngưỡng khuyến nghị và phù hợp để bắt đầu kế hoạch siết mỡ khoa học.";
  } else {
    category = "Béo phì";
    color = "#ef4444";
    advice =
      "Bạn nên theo dõi chặt chế độ ăn, tăng vận động và cân nhắc tham vấn chuyên gia nếu cần.";
    detail =
      "BMI ở vùng rủi ro cao hơn, nên ưu tiên mục tiêu giảm mỡ an toàn và bền vững.";
  }

  const healthyMin = 18.5 * (heightM * heightM);
  const healthyMax = 24.9 * (heightM * heightM);

  return {
    bmi,
    category,
    color,
    advice,
    detail,
    healthyMin,
    healthyMax,
  };
}