const banks = [
    {
        name: "Vietcombank",
        code: "VCB",
        logo: "https://hienlaptop.com/wp-content/uploads/2024/12/logo-vietcombank-vector-11.png",
        bankFullName: "Ngân hàng TMCP Ngoại thương Việt Nam"
    },
    {
        name: "VietinBank",
        code: "CTG",
        logo: "https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-VietinBank-CTG-Ori.png",
        bankFullName: "Ngân hàng TMCP Công Thương Việt Nam"
    },
    {
        name: "Techcombank",
        code: "TCB",
        logo: "https://vtc.edu.vn/wp-content/uploads/2020/09/techcombank.png",
        bankFullName: "Ngân hàng TMCP Kỹ thương Việt Nam"
    },
    {
        name: "BIDV",
        code: "BIDV",
        logo: "https://diendantructuyen.com/wp-content/uploads/2025/08/logo-bidv-05.png",
        bankFullName: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam"
    },
    {
        name: "Agribank",
        code: "VARB",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkEw53Tj8L4Yb0mWtylE--JM8MxDDqeUqeQQ&s",
        bankFullName: "Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam"
    },
    {
        name: "MB Bank",
        code: "MB",
        logo: "https://cellphones.com.vn/sforum/wp-content/uploads/2023/08/co-nen-vay-tien-qua-app-mb-bank-1.jpeg",
        bankFullName: "Ngân hàng TMCP Quân đội"
    },
    {
        name: "ACB",
        code: "ACB",
        logo: "https://acb.com.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FnotFound.c16f4396.jpg&w=3840&q=75",
        bankFullName: "Ngân hàng TMCP Á Châu"
    },
    {
        name: "VPBank",
        code: "VPB",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxmypSORDDheocHWo1A5ZkhI78YYLDXUwQbQ&s",
        bankFullName: "Ngân hàng TMCP Thịnh vượng và Phát triển"
    },
    {
        name: "TPBank",
        code: "TPB",
        logo: "https://play-lh.googleusercontent.com/65K0CCfxy_8kga51gCci4NxMZXv6qmDvvb3GhwG-tRzd9dZ8a_EsuX54DIJeWk18hgO9qD1pm1IawyvDgWWruw",
        bankFullName: "Ngân hàng TMCP Tiên Phong"
    },
    {
        name: "Sacombank",
        code: "STB",
        logo: "https://hoanghamobile.com/tin-tuc/wp-content/uploads/2024/03/e-sacombank.jpg",
        bankFullName: "Ngân hàng TMCP Sài Gòn Thương Tín"
    },
    {
        name: "HDBank",
        code: "HDB",
        logo: "https://static.wixstatic.com/media/9d8ed5_0f9b1175f94f4ce4a6789d63a1540044~mv2.png/v1/fill/w_560,h_560,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/9d8ed5_0f9b1175f94f4ce4a6789d63a1540044~mv2.png",
        bankFullName: "Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh"
    },
    {
        name: "VIB",
        code: "VIB",
        logo: "https://cafef1.mediacdn.vn/LOGO/VIB_20231013153652.jpg",
        bankFullName: "Ngân hàng TMCP Quốc tế Việt Nam"
    },
    {
        name: "SHB",
        code: "SHB",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXhKaIaoRQ5IaHwUaVM-knbyGmwcU7Pus5ig&s",
        bankFullName: "Ngân hàng TMCP Sài Gòn - Hà Nội"
    },
    {
        name: "Eximbank",
        code: "EIB",
        logo: "https://svtech.com.vn/wp-content/uploads/2020/09/Eximbank.png",
        bankFullName: "Ngân hàng TMCP Xuất Nhập khẩu Việt Nam"
    },
    {
        name: "MSB",
        code: "MSB",
        logo: "https://yt3.googleusercontent.com/BraB2MLtc89HqS6Id9K9sSfvqiby3ay2ae9BYok6E6AIWKE4F93qXAqGSPngPTzrKHYBd64EKw=s900-c-k-c0x00ffffff-no-rj",
        bankFullName: "Ngân hàng TMCP Hàng Hải Việt Nam"
    },
    {
        name: "OCB",
        code: "OCB",
        logo: "https://cdn.nhandan.vn/images/22f099ca8bc7ae81aa2a8d3416a84bf88089b7215cc19d3f1bdde36a07520443f2d2e4fc1c098a3a9862897202c200bf2a9dbce8cd73a8135feabc05583b68e870d9b3e71a50adfe4550d4e56dd7f8ab/logo-temp-copy-2092.jpg",
        bankFullName: "Ngân hàng TMCP Phương Đông"
    },
    {
        name: "SeABank",
        code: "SSB",
        logo: "https://yt3.googleusercontent.com/FgQdLPaR3VkNtlSL9bl1e56wWJCx3Esuxw73EbXeOsvOCdU8t0-RmYzoBQIEZ6NP3j90KpW6-cI=s900-c-k-c0x00ffffff-no-rj",
        bankFullName: "Ngân hàng TMCP Đông Nam Á"
    },
    {
        name: "Nam A Bank",
        code: "NAB",
        logo: "https://upload.wikimedia.org/wikipedia/commons/4/45/Nam_A_Bank_Logo.jpg",
        bankFullName: "Ngân hàng TMCP Nam Á"
    },
    {
        name: "LPBank",
        code: "LPB",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjbc4-xR_CfifI6_yVvJ_jq0x6TgCQDvax1A&s",
        bankFullName: "Ngân hàng TMCP Lộc Phát Việt Nam"
    },
    {
        name: "BVBank",
        code: "BVB",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDpj8_60N_-DaomQs7kVyOCeSDgvBg4OdcIg&s",
        bankFullName: "Ngân hàng TMCP Bản Việt"
    }
]
export default banks;