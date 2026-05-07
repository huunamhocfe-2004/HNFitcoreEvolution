export const words = [
  "Fitness",
  "Health",
  "Workout",
  "Movement",
  "Healthy Lifestyle",
];

export const heroImages = [
  "/intro.jpg",
  "/intro1.png",
  "/intro2.jpg",
  "/intro3.jpg",
  "/intro4.webp",
];

export const programs = [
  {
    title: "Strength Training",
    desc: "Quản lý giáo án, huấn luyện viên cá nhân và tiến độ tập luyện cho từng hội viên.",
    active: false,
    icon: "🏋️",
    details: [
      "Quản lý giáo án theo từng hội viên",
      "Theo dõi tiến độ tập luyện theo từng giai đoạn",
      "Phân công huấn luyện viên và lịch tập rõ ràng",
    ],
  },
  {
    title: "Yoga Class",
    desc: "Sắp xếp lớp học, HLV, số lượng học viên và lịch đặt chỗ theo thời gian thực.",
    active: false,
    icon: "🧘",
    details: [
      "Quản lý lớp học và khung giờ linh hoạt",
      "Theo dõi số lượng học viên theo từng buổi",
      "Đặt chỗ và check-in nhanh chóng",
    ],
  },
  {
    title: "Bodybuilding",
    desc: "Theo dõi gói tập, check-in, thanh toán và hiệu suất vận hành phòng gym tập trung.",
    active: true,
    icon: "💪",
    details: [
      "Quản lý gói tập, gia hạn và lịch sử check-in",
      "Theo dõi thanh toán và doanh thu tổng quan",
      "Tối ưu vận hành PT, lễ tân và hội viên",
    ],
  },
  {
    title: "Weight Loss",
    desc: "Quản lý mục tiêu thể chất, đo chỉ số cơ thể và lộ trình chăm sóc khách hàng.",
    active: false,
    icon: "🔥",
    details: [
      "Lưu trữ chỉ số cơ thể theo từng mốc thời gian",
      "Theo dõi mục tiêu giảm cân rõ ràng",
      "Cá nhân hóa lộ trình chăm sóc khách hàng",
    ],
  },
];

export const pricing = [
  {
    name: "Gói cơ bản",
    monthlyPrice: "300000",
    annualPrice: "3000000",
    features: [
      "5 lớp mỗi tuần",
      "4 buổi PT mỗi tháng",
      "Báo cáo cơ bản",
    ],
    highlight: false,
  },
  {
    name: "Gói nâng cao",
    monthlyPrice: "500000",
    annualPrice: "5000000",
    features: [
      "PT không giới hạn",
      "Báo cáo nâng cao",
      "Quản lý check-in thông minh",
    ],
    highlight: true,
  },
  {
    name: "Gói cao cấp",
    monthlyPrice: "900000",
    annualPrice: "9000000",
    features: ["8 lớp mỗi tháng", "Quản lý HLV", "Theo dõi doanh thu"],
    highlight: false,
  },
];

export const trainers = [
  {
    name: "Bùi Hữu Nam",
    role: "Senior Bodybuilding Coach",
    img: "../../../public/me.jpg",
    bio: "Bùi Hữu Nam là một huấn luyện viên dày dặn kinh nghiệm với hơn 10 năm thay đổi vóc dáng cho học viên.",
    rate: "500k/hr",
    status: "HN Fitcore",
    badge: "available",
    skills: ["Gym", "Nutrition", "Bulking", "+2"],
    email: "nam.bui@hnfitcore.com",
    phone: "0367 397 104",
    address: "Cơ sở 1 - Cầu Giấy, Hà Nội",
    certifications: [
      "NASM Certified Personal Trainer",
      "Chứng nhận chuyên gia Dinh dưỡng Thể thao (ISSA)",
    ],
    teaching: [
      "Bodybuilding Advanced",
      "Strength Training",
      "Kiểm soát cân nặng",
    ],
  },
  {
    name: "Alex Johnson",
    role: "Yoga Master",
    img: "../../../public/Stones.jpg",
    bio: "Alex là một chuyên gia Yoga giúp bạn tìm lại sự cân bằng giữa tâm trí và cơ thể một cách hiệu quả.",
    rate: "300k/hr",
    status: "Freelancer",
    badge: "",
    skills: ["Yoga", "Meditation", "Flexibility", "+1"],
    email: "alex.j@gmail.com",
    phone: "0988 123 456",
    address: "Cơ sở 2 - Quận 1, TP.HCM",
    certifications: [
      "200-Hour RYT Yoga Alliance",
      "Chứng chỉ Trị liệu Thiền định",
    ],
    teaching: ["Hatha Yoga", "Vinyasa Flow", "Meditation Core"],
  },
  {
    name: "Minh Tuấn",
    role: "Strength & Conditioning",
    img: "../../../public/garcia.webp",
    bio: "Chuyên gia đào tạo vận động viên chuyên nghiệp với các giáo án sức mạnh nâng cao.",
    rate: "450k/hr",
    status: "HN Fitcore",
    badge: "hot",
    skills: ["Powerlifting", "Crossfit", "Cardio", "+3"],
    email: "tuan.minh@hnfitcore.com",
    phone: "0912 345 678",
    address: "Cơ sở 1 - Cầu Giấy, Hà Nội",
    certifications: [
      "CSCS (Certified Strength and Conditioning Specialist)",
      "Cử nhân Giáo dục Thể chất",
    ],
    teaching: ["Powerlifting", "Crossfit", "Huấn luyện Thể lực chuyên sâu"],
  },
  {
    name: "Sarah Kim",
    role: "Weight Loss Specialist",
    img: "../../../public/Sarah Kim.png",
    bio: "Đồng hành cùng bạn trên hành trình giảm mỡ, siết cơ khoa học mà không cần nhịn ăn cực đoan.",
    rate: "350k/hr",
    status: "Freelancer",
    badge: "available",
    skills: ["Diet", "HIIT", "Pilates", "+1"],
    email: "sarah.kim@gmail.com",
    phone: "0933 555 777",
    address: "Cơ sở 3 - Đống Đa, Hà Nội",
    certifications: [
      "ACE Weight Management Specialist",
      "Chứng chỉ HLV Pilates Quốc tế",
    ],
    teaching: ["Weight Loss Bootcamp", "Pilates", "HIIT Cardio"],
  },
  {
    name: "Linda",
    role: "Kickboxing Coach",
    img: "../../../public/Linda.png",
    bio: "Huấn luyện viên võ thuật tự do giúp bạn rèn luyện phản xạ, đốt mỡ và tự vệ thực chiến.",
    rate: "400k/hr",
    status: "HN Fitcore",
    badge: "",
    skills: ["Boxing", "Muay Thai", "Fitness", "+2"],
    email: "linda.fight@hnfitcore.com",
    phone: "0977 888 999",
    address: "Cơ sở 1 - Cầu Giấy, Hà Nội",
    certifications: [
      "Đai đen Taekwondo",
      "Huấn luyện viên Muay Thai chuyên nghiệp",
    ],
    teaching: ["Kickboxing", "Muay Thai Cơ Bản", "Phản xạ tự vệ"],
  },
  {
    name: "Ngọc Diệp",
    role: "Interactive Designer",
    img: "../../../public/anna.jpg",
    bio: "Chuyên gia thiết kế lộ trình tập luyện cá nhân hóa theo từng thể trạng đặc biệt của khách hàng.",
    rate: "300k/hr",
    status: "Freelancer",
    badge: "free trial",
    skills: ["Planning", "Anatomy", "Recovery", "+4"],
    email: "diep.ngoc@gmail.com",
    phone: "0909 111 222",
    address: "Cơ sở 2 - Quận 1, TP.HCM",
    certifications: [
      "Chứng chỉ Phục hồi chức năng",
      "Chuyên gia Phân tích Vận động",
    ],
    teaching: [
      "Thiết kế Lộ trình Dinh dưỡng",
      "Bài tập Phục hồi (Recovery)",
      "Posture Correction",
    ],
  },
];


export const blogs = [
  {
    title: "Vì sao HN Fitcore là điểm bắt đầu lý tưởng cho người mới?",
    category: "Người mới",
    date: "07/05/2026",
    readTime: "4 phút đọc",
    image: "/gym.webp",
    summary:
      "Tìm hiểu cách không gian tập luyện, đội ngũ PT và lộ trình cá nhân hóa giúp khách mới bắt đầu an toàn, tự tin và có động lực hơn.",
    content: [
      "HN Fitcore Evolution được xây dựng như một không gian tập luyện thân thiện cho cả người mới lẫn người đã có kinh nghiệm. Khi bước vào phòng gym, khách hàng không chỉ nhìn thấy máy móc hiện đại mà còn được định hướng rõ ràng về mục tiêu, lịch tập và cách theo dõi tiến độ.",
      "Với người mới, điều quan trọng nhất không phải là tập thật nặng ngay từ đầu mà là hiểu cơ thể, học kỹ thuật đúng và duy trì thói quen đều đặn. Đội ngũ huấn luyện viên sẽ hỗ trợ kiểm tra thể trạng, lựa chọn bài tập phù hợp và điều chỉnh cường độ theo từng giai đoạn.",
      "Bên cạnh đó, hệ thống quản lý hội viên, lịch lớp và gói tập giúp trải nghiệm trở nên mượt mà hơn. Khách hàng dễ dàng theo dõi lịch tập, nhận tư vấn và duy trì kết nối với phòng gym trong suốt hành trình thay đổi vóc dáng."
    ],
  },
  {
    title: "Không gian tập luyện hiện đại giúp bạn giữ động lực mỗi ngày",
    category: "Trải nghiệm",
    date: "07/05/2026",
    readTime: "3 phút đọc",
    image: "/intro2.jpg",
    summary:
      "Một môi trường tập luyện tốt có thể tạo ra sự khác biệt lớn trong việc duy trì kỷ luật, tinh thần và hiệu quả rèn luyện lâu dài.",
    content: [
      "Không gian tập luyện ảnh hưởng trực tiếp đến cảm xúc và khả năng duy trì thói quen của hội viên. Một phòng gym sạch sẽ, thoáng, đủ khu vực chức năng và có thiết bị được bố trí khoa học sẽ giúp buổi tập trở nên hiệu quả hơn.",
      "HN Fitcore chú trọng trải nghiệm tổng thể: từ khu vực strength training, cardio, lớp nhóm cho đến khu tư vấn cá nhân. Mỗi khu vực đều được thiết kế để khách hàng dễ tiếp cận, tập trung vào bài tập và hạn chế cảm giác bỡ ngỡ khi mới bắt đầu.",
      "Khi có môi trường tốt, bạn sẽ dễ quay lại phòng tập hơn. Động lực không chỉ đến từ mục tiêu hình thể mà còn đến từ cảm giác mình đang thuộc về một cộng đồng tích cực và luôn tiến bộ."
    ],
  },
  {
    title: "Lộ trình tập luyện cá nhân hóa: chìa khóa để tiến bộ bền vững",
    category: "Huấn luyện",
    date: "07/05/2026",
    readTime: "5 phút đọc",
    image: "/intro3.jpg",
    summary:
      "Mỗi người có thể trạng và mục tiêu khác nhau, vì vậy một lộ trình cá nhân hóa sẽ giúp tối ưu kết quả và giảm rủi ro chấn thương.",
    content: [
      "Một giáo án hiệu quả cần xuất phát từ mục tiêu thực tế: tăng cơ, giảm mỡ, cải thiện sức bền, phục hồi vận động hoặc đơn giản là xây dựng lối sống năng động hơn. Vì vậy, HN Fitcore ưu tiên tư vấn và cá nhân hóa lộ trình ngay từ đầu.",
      "Huấn luyện viên sẽ theo dõi các chỉ số cơ bản, khả năng vận động, lịch sinh hoạt và mức độ cam kết của từng hội viên. Từ đó, bài tập, tần suất và cường độ được điều chỉnh để người tập tiến bộ đều nhưng vẫn an toàn.",
      "Khi lộ trình rõ ràng, hội viên dễ biết mình đang ở đâu, cần cải thiện điều gì và khi nào nên tăng độ khó. Đây là cách giúp việc tập luyện không còn cảm tính mà trở thành một quá trình có kế hoạch và đo lường được."
    ],
  },
];
