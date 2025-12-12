import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SignatureScreen from "react-native-signature-canvas";
import { useUser } from "../../../context/UserContext";
import { useTranslation } from "../../../hooks/useTranslation";
import contractService from "../../../services/contractService";
import { SafeAreaView } from "react-native-safe-area-context";
const { width, height } = Dimensions.get("window");

export default function ContractDetailScreen({ route, navigation }) {
  const { contractId } = route.params;
  const { user } = useUser();
  const { t } = useTranslation();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signature, setSignature] = useState(null);
  const signatureRef = useRef(null);

  useEffect(() => {
    fetchContractDetail();
  }, [contractId]);

  const fetchContractDetail = async () => {
    try {
      setLoading(true);
      const response = await contractService.getContractById(contractId);
      if (response?.data?.items) {
        setContract(response.data.items[0]);
      }
    } catch (error) {
      console.error("Error fetching contract:", error);
      Alert.alert(t("contract.error"), t("contract.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSignature = (signatureData) => {
    setSignature(signatureData);
    setShowSignatureModal(false);
  };

  const handleClearSignature = () => {
    signatureRef.current?.clearSignature();
  };

  const handleConfirmSignature = () => {
    signatureRef.current?.readSignature();
  };

  const uploadSignature = async () => {
    if (!signature) {
      Alert.alert(t("contract.error"), t("contract.provideSignature"));
      return;
    }

    try {
      setSigning(true);

      const formData = new FormData();
      formData.append("contractId", contractId);
      formData.append("customerSignatureUrl", {
        uri: signature,
        type: "image/png",
        name: `signature_${contractId}_${Date.now()}.png`,
      });

      const response = await contractService.updateContract(formData);

      if (response?.data) {
        Alert.alert(t("contract.signSuccess"), "", [
          {
            text: "OK",
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      }
    } catch (error) {
      console.error("Error uploading signature:", error);
      Alert.alert(t("contract.error"), t("contract.signError"));
    } finally {
      setSigning(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const renderGymOwnerContract = () => {
    if (!contract) return null;

    const {
      id,
      fullName,
      phoneNumber,
      permanentAddress,
      identityCardNumber,
      identityCardDate,
      identityCardPlace,
      startDate,
      endDate,
      commissionPercentage,
      createdAt,
      taxCode,
      contactEmail,
      extraRules,
      companySignatureUrl,
      customerSignatureUrl,
    } = contract;

    return (
      <View style={styles.contractTemplate}>
        {/* Header */}
        <View style={styles.contractHeader}>
          <Text style={styles.headerSmall}>
            Số: {id?.substring(0, 15).toUpperCase()}-GO
          </Text>
          <Text style={styles.headerSmall}>
            Ngày: {formatDate(createdAt || new Date())}
          </Text>
          <Text style={styles.headerSmall}>
            Địa điểm ký kết: 7 Đ. D1, Long Thạnh Mỹ, Thủ Đức, TP. Hồ Chí Minh
          </Text>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.titleLarge}>
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </Text>
          <Text style={styles.titleSmall}>Độc lập - Tự do - Hạnh phúc</Text>
        </View>

        <Text style={styles.mainTitle}>
          HỢP ĐỒNG HỢP TÁC - DÀNH CHO GYM OWNER
        </Text>

        <Text style={styles.introText}>Chúng tôi, gồm các bên:</Text>

        {/* BÊN A */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            BÊN A: NỀN TẢNG FITBRIDGE (FITBRIDGE PLATFORM)
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Tên Công ty:</Text> FitBridge Platform
            Co., Ltd
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Địa chỉ Trụ sở chính:</Text> 7 Đ. D1,
            Long Thạnh Mỹ, Thủ Đức, Thành phố Hồ Chí Minh 700000
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Mã số thuế:</Text> [Mã số thuế của
            FitBridge]
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Đại diện bởi:</Text> Lâm Quốc Phong
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Chức vụ:</Text> Admin
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Số CCCD:</Text> 077204000387
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Ngày Cấp:</Text> 26/07/2022
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Nơi Cấp:</Text> CỤC TRƯỞNG CỤC CẢNH
            SÁT QUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ XÃ HỘI
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Điện thoại:</Text> 0973035305
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Email:</Text> admin@fitbridge.vn
          </Text>
        </View>

        {/* BÊN B */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BÊN B: PHÒNG TẬP (GYM OWNER)</Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Tên Doanh nghiệp/Hộ Kinh doanh:</Text>{" "}
            {fullName}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Loại hình đối tác:</Text> Gym Owner
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Mã số thuế:</Text>{" "}
            {taxCode || "___________________"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Chủ sở hữu/Người đại diện:</Text>{" "}
            {fullName}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Địa chỉ kinh doanh:</Text>{" "}
            {permanentAddress}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Email liên hệ:</Text>{" "}
            {contactEmail || "___________________"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Số điện thoại:</Text> {phoneNumber}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Số CCCD:</Text>{" "}
            {identityCardNumber || "___________________"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Ngày cấp:</Text>{" "}
            {formatDate(identityCardDate) || "___________________"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Nơi cấp:</Text>{" "}
            {identityCardPlace || "___________________"}
          </Text>
        </View>

        <Text style={styles.italicText}>
          (Sau đây, Bên A và Bên B được gọi chung là Các Bên)
        </Text>

        {/* Articles */}
        <View style={styles.article}>
          <Text style={styles.articleTitle}>
            ĐIỀU 1: NỘI DUNG VÀ MỤC ĐÍCH HỢP ĐỒNG
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>1.1. Mục đích:</Text> Bên A đồng ý cho
            Bên B sử dụng nền tảng công nghệ FitBridge để quản lý và kinh doanh
            dịch vụ phòng tập và các khóa học cho Khách hàng cuối.
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>1.2. Cam kết:</Text> Bên B cam kết
            tuân thủ các điều khoản và điều kiện, bao gồm các Quy định vận hành,
            Chính sách chất lượng dịch vụ, và Quy trình thanh toán do Bên A ban
            hành.
          </Text>
        </View>

        <View style={styles.article}>
          <Text style={styles.articleTitle}>ĐIỀU 2: THỜI HẠN HỢP ĐỒNG</Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>2.1.</Text> Hợp đồng này có hiệu lực
            kể từ ngày ký và có hiệu lực từ ngày{" "}
            <Text style={styles.boldText}>{formatDate(startDate)}</Text> đến hết
            ngày <Text style={styles.boldText}>{formatDate(endDate)}</Text>.
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>2.2.</Text> Khi hợp đồng chấm dứt tài
            khoản bên B sẽ không thể sử dụng tài khoản đối với các tính năng
            liên quan đến quản lý khóa học và tương tác với khách hàng, cho đến
            khi ký kết hợp đồng mới.
          </Text>
        </View>

        <View style={styles.article}>
          <Text style={styles.articleTitle}>
            ĐIỀU 3: PHÍ DỊCH VỤ VÀ QUY TRÌNH THANH TOÁN
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>3.1. Phí Dịch vụ:</Text> Bên B cam kết
            thanh toán cho Bên A phí dịch vụ là{" "}
            <Text style={styles.boldText}>{commissionPercentage}%</Text> trên
            mỗi giao dịch thành công.
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>
              3.2. Quy trình Giao dịch và Đối soát:
            </Text>
          </Text>
          <Text style={styles.bulletText}>
            • Giao dịch: Toàn bộ doanh thu từ các Order sẽ được chuyển vào tài
            khoản trung gian của FitBridge.
          </Text>
          <Text style={styles.bulletText}>
            • Đối soát: Sau khi Khách hàng hoàn tất thanh toán thành công, phần
            lợi nhuận sẽ được ghi nhận vào số dư chờ thanh toán của Bên B.
          </Text>
          <Text style={styles.bulletText}>
            • Chuyển đổi: Bên A sẽ thực hiện chuyển tiền từ số dư chờ thanh toán
            sang số dư khả dụng của Bên B sau 30 ngày.
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>3.3. Quy trình Rút tiền:</Text> Bên B
            chỉ có thể rút tiền từ số dư khả dụng. Bên A cam kết xử lý trong
            vòng 7 ngày làm việc.
          </Text>
        </View>

        <View style={styles.article}>
          <Text style={styles.articleTitle}>
            ĐIỀU 4: QUYỀN VÀ NGHĨA VỤ CỦA CÁC BÊN
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>4.1. Bên A:</Text>
          </Text>
          <Text style={styles.bulletText}>• Cung cấp nền tảng công nghệ</Text>
          <Text style={styles.bulletText}>• Hỗ trợ kỹ thuật và tư vấn</Text>
          <Text style={styles.bulletText}>• Đảm bảo an toàn thông tin</Text>
          <Text style={styles.bulletText}>
            • Thu phí dịch vụ theo thỏa thuận
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>4.2. Bên B:</Text>
          </Text>
          <Text style={styles.bulletText}>
            • Sử dụng nền tảng để kinh doanh
          </Text>
          <Text style={styles.bulletText}>• Cung cấp thông tin chính xác</Text>
          <Text style={styles.bulletText}>• Tuân thủ quy định vận hành</Text>
          <Text style={styles.bulletText}>
            • Thanh toán phí dịch vụ đúng hạn
          </Text>
        </View>

        <View style={styles.article}>
          <Text style={styles.articleTitle}>
            ĐIỀU 5: CÁC ĐIỀU KHOẢN BỔ SUNG
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>5.1.</Text> Bên B cam kết duy trì đánh
            giá tốt trên 4 sao và giải quyết khiếu nại.
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>5.2.</Text> Bên B cam kết bảo mật
            thông tin Khách hàng.
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>5.3.</Text> Chấm dứt khi vi phạm cơ
            bản mà không khắc phục sau 15 ngày.
          </Text>
          {extraRules && extraRules.length > 0 && (
            <>
              <Text style={styles.articleText}>
                <Text style={styles.boldText}>5.4. Điều khoản bổ sung:</Text>
              </Text>
              {extraRules.map((rule, index) => (
                <Text key={index} style={styles.bulletText}>
                  • {rule}
                </Text>
              ))}
            </>
          )}
        </View>

        <View style={styles.article}>
          <Text style={styles.articleTitle}>ĐIỀU 6: ĐIỀU KHOẢN CHUNG</Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>6.1.</Text> Hợp đồng này có hiệu lực
            kể từ ngày ký.
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>6.2.</Text> Mọi tranh chấp sẽ được
            giải quyết qua thương lượng hoặc Tòa án tại TP.HCM.
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>6.3.</Text> Hợp đồng được lập thành 02
            bản có giá trị pháp lý như nhau.
          </Text>
        </View>

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>ĐẠI DIỆN BÊN A</Text>
            <Text style={styles.signatureSubtitle}>(Ký và ghi rõ họ tên)</Text>
            <View style={styles.signatureArea}>
              {companySignatureUrl ? (
                <Image
                  source={{ uri: companySignatureUrl }}
                  style={styles.signatureImage}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.placeholderText}>[Chữ ký Admin]</Text>
              )}
            </View>
            <Text style={styles.signerName}>Lâm Quốc Phong</Text>
          </View>

          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>ĐẠI DIỆN BÊN B</Text>
            <Text style={styles.signatureSubtitle}>(Ký và ghi rõ họ tên)</Text>
            <View style={styles.signatureArea}>
              {signature || customerSignatureUrl ? (
                <Image
                  source={{ uri: signature || customerSignatureUrl }}
                  style={styles.signatureImage}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.placeholderText}>
                  [Chữ ký chủ phòng tập]
                </Text>
              )}
            </View>
            <Text style={styles.signerName}>{fullName}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFreelancePTContract = () => {
    if (!contract) return null;

    const {
      id,
      fullName,
      phoneNumber,
      permanentAddress,
      identityCardNumber,
      identityCardDate,
      identityCardPlace,
      startDate,
      endDate,
      commissionPercentage,
      createdAt,
      taxCode,
      contactEmail,
      extraRules,
      companySignatureUrl,
      customerSignatureUrl,
    } = contract;

    return (
      <View style={styles.contractTemplate}>
        {/* Header */}
        <View style={styles.contractHeader}>
          <Text style={styles.headerSmall}>
            Số: {id?.substring(0, 15).toUpperCase()}-FPT
          </Text>
          <Text style={styles.headerSmall}>
            Ngày: {formatDate(createdAt || new Date())}
          </Text>
          <Text style={styles.headerSmall}>
            Địa điểm ký kết: 7 Đ. D1, Long Thạnh Mỹ, Thủ Đức, TP. Hồ Chí Minh
          </Text>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.titleLarge}>
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </Text>
          <Text style={styles.titleSmall}>Độc lập - Tự do - Hạnh phúc</Text>
        </View>

        <Text style={styles.mainTitle}>
          HỢP ĐỒNG HỢP TÁC - DÀNH CHO FREELANCE PT
        </Text>

        <Text style={styles.introText}>Chúng tôi, gồm các bên:</Text>

        {/* BÊN A */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            BÊN A: NỀN TẢNG FITBRIDGE (FITBRIDGE PLATFORM)
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Tên Công ty:</Text> FitBridge Platform
            Co., Ltd
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Địa chỉ Trụ sở chính:</Text> 7 Đ. D1,
            Long Thạnh Mỹ, Thủ Đức, Thành phố Hồ Chí Minh 700000
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Mã số thuế:</Text> [Mã số thuế của
            FitBridge]
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Đại diện bởi:</Text> Lâm Quốc Phong
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Chức vụ:</Text> Admin
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Số CCCD:</Text> 077204000387
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Ngày Cấp:</Text> 26/07/2022
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Nơi Cấp:</Text> CỤC TRƯỞNG CỤC CẢNH
            SÁT QUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ XÃ HỘI
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Địa chỉ thường trú:</Text> 7 Đ. D1,
            Long Thạnh Mỹ, Thủ Đức, TP.HCM
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Điện thoại:</Text> 0973035305
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Email:</Text> admin@fitbridge.vn
          </Text>
        </View>

        {/* BÊN B */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            BÊN B: HUẤN LUYỆN VIÊN CÁ NHÂN TỰ DO (FREELANCE PT)
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Tên Cá nhân/Hộ Kinh doanh:</Text>{" "}
            {fullName}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Loại hình đối tác:</Text> Freelance PT
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Mã số thuế:</Text>{" "}
            {taxCode || "___________________"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Địa chỉ liên hệ:</Text>{" "}
            {permanentAddress}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Số CCCD:</Text>{" "}
            {identityCardNumber || "___________________"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Ngày cấp:</Text>{" "}
            {formatDate(identityCardDate) || "___________________"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Nơi cấp:</Text>{" "}
            {identityCardPlace || "___________________"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Email liên hệ:</Text>{" "}
            {contactEmail || "___________________"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Số điện thoại:</Text> {phoneNumber}
          </Text>
        </View>

        <Text style={styles.italicText}>
          (Sau đây, Bên A và Bên B được gọi chung là Các Bên)
        </Text>

        {/* Articles */}
        <View style={styles.article}>
          <Text style={styles.articleTitle}>
            ĐIỀU 1: NỘI DUNG VÀ MỤC ĐÍCH HỢP ĐỒNG
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>1.1. Mục đích:</Text> Bên A đồng ý cho
            Bên B sử dụng nền tảng công nghệ FitBridge để quản lý và kinh doanh
            các gói đào tạo cá nhân cho Khách hàng cuối.
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>1.2. Cam kết:</Text> Bên B cam kết
            tuân thủ các điều khoản và điều kiện do Bên A ban hành.
          </Text>
        </View>

        <View style={styles.article}>
          <Text style={styles.articleTitle}>ĐIỀU 2: THỜI HẠN HỢP ĐỒNG</Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>2.1.</Text> Hợp đồng có hiệu lực từ
            ngày <Text style={styles.boldText}>{formatDate(startDate)}</Text>{" "}
            đến hết ngày{" "}
            <Text style={styles.boldText}>{formatDate(endDate)}</Text>.
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>2.2.</Text> Khi hợp đồng chấm dứt, tài
            khoản bên B sẽ không thể sử dụng các tính năng liên quan đến quản lý
            khóa học.
          </Text>
        </View>

        <View style={styles.article}>
          <Text style={styles.articleTitle}>
            ĐIỀU 3: PHÍ DỊCH VỤ VÀ QUY TRÌNH THANH TOÁN
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>3.1. Phí Dịch vụ:</Text> Bên B cam kết
            thanh toán cho Bên A phí dịch vụ là{" "}
            <Text style={styles.boldText}>{commissionPercentage}%</Text> trên
            mỗi giao dịch thành công.
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>3.2. Quy trình:</Text>
          </Text>
          <Text style={styles.bulletText}>
            • Toàn bộ doanh thu sẽ được chuyển vào tài khoản trung gian của
            FitBridge
          </Text>
          <Text style={styles.bulletText}>
            • Phần lợi nhuận sẽ được ghi nhận vào số dư chờ thanh toán
          </Text>
          <Text style={styles.bulletText}>
            • Chuyển đổi sang số dư khả dụng khi học viên hoàn thành 50% buổi
            học hoặc sau 01 ngày kết thúc khóa học
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>3.3. Rút tiền:</Text> Xử lý trong vòng
            7 ngày làm việc.
          </Text>
        </View>

        <View style={styles.article}>
          <Text style={styles.articleTitle}>
            ĐIỀU 4: QUYỀN VÀ NGHĨA VỤ CỦA CÁC BÊN
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>4.1. Bên A:</Text>
          </Text>
          <Text style={styles.bulletText}>• Cung cấp nền tảng công nghệ</Text>
          <Text style={styles.bulletText}>• Hỗ trợ kỹ thuật và tư vấn</Text>
          <Text style={styles.bulletText}>• Đảm bảo an toàn thông tin</Text>
          <Text style={styles.bulletText}>
            • Thu phí dịch vụ theo thỏa thuận
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>4.2. Bên B:</Text>
          </Text>
          <Text style={styles.bulletText}>
            • Sử dụng nền tảng để quản lý lịch tập
          </Text>
          <Text style={styles.bulletText}>• Cung cấp thông tin chính xác</Text>
          <Text style={styles.bulletText}>• Tuân thủ quy định vận hành</Text>
          <Text style={styles.bulletText}>
            • Thanh toán phí dịch vụ đúng hạn
          </Text>
          <Text style={styles.bulletText}>• Đảm bảo chất lượng dịch vụ</Text>
        </View>

        <View style={styles.article}>
          <Text style={styles.articleTitle}>
            ĐIỀU 5: CÁC ĐIỀU KHOẢN BỔ SUNG
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>5.1.</Text> Bên B cam kết duy trì KPI
            về đánh giá và tỷ lệ hủy lịch.
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>5.2.</Text> Bên B cam kết bảo mật
            thông tin Khách hàng.
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>5.3.</Text> Chấm dứt khi vi phạm cơ
            bản mà không khắc phục sau 15 ngày.
          </Text>
          {extraRules && extraRules.length > 0 && (
            <>
              <Text style={styles.articleText}>
                <Text style={styles.boldText}>5.4. Điều khoản bổ sung:</Text>
              </Text>
              {extraRules.map((rule, index) => (
                <Text key={index} style={styles.bulletText}>
                  • {rule}
                </Text>
              ))}
            </>
          )}
        </View>

        <View style={styles.article}>
          <Text style={styles.articleTitle}>ĐIỀU 6: ĐIỀU KHOẢN CHUNG</Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>6.1.</Text> Hợp đồng này có hiệu lực
            kể từ ngày ký.
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>6.2.</Text> Mọi tranh chấp sẽ được
            giải quyết qua thương lượng hoặc Tòa án tại TP.HCM.
          </Text>
          <Text style={styles.articleText}>
            <Text style={styles.boldText}>6.3.</Text> Hợp đồng được lập thành 02
            bản có giá trị pháp lý như nhau.
          </Text>
        </View>

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>ĐẠI DIỆN BÊN A</Text>
            <Text style={styles.signatureSubtitle}>(Ký và ghi rõ họ tên)</Text>
            <View style={styles.signatureArea}>
              {companySignatureUrl ? (
                <Image
                  source={{ uri: companySignatureUrl }}
                  style={styles.signatureImage}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.placeholderText}>[Chữ ký Admin]</Text>
              )}
            </View>
            <Text style={styles.signerName}>Lâm Quốc Phong</Text>
          </View>

          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>ĐẠI DIỆN BÊN B</Text>
            <Text style={styles.signatureSubtitle}>(Ký và ghi rõ họ tên)</Text>
            <View style={styles.signatureArea}>
              {signature || customerSignatureUrl ? (
                <Image
                  source={{ uri: signature || customerSignatureUrl }}
                  style={styles.signatureImage}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.placeholderText}>
                  [Chữ ký huấn luyện viên]
                </Text>
              )}
            </View>
            <Text style={styles.signerName}>{fullName}</Text>
          </View>
        </View>
      </View>
    );
  };

  const canSign = () => {
    return (
      contract?.contractStatus === "CompanySigned" &&
      !contract?.customerSignatureUrl
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{t("contract.loadingContract")}</Text>
      </View>
    );
  }

  if (!contract) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t("contract.contractNotFound")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {contract.contractType === "FreelancePT"
          ? renderFreelancePTContract()
          : renderGymOwnerContract()}
      </ScrollView>

      {canSign() && !signature && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.signButton}
            onPress={() => setShowSignatureModal(true)}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            <Text style={styles.signButtonText}>
              {t("contract.signContract")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {signature && !contract.customerSignatureUrl && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSignature(null)}
          >
            <Text style={styles.clearButtonText}>
              {t("contract.clearSignature")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.submitButton,
              signing && styles.submitButtonDisabled,
            ]}
            onPress={uploadSignature}
            disabled={signing}
          >
            {signing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.submitButtonText}>
                  {t("contract.submitSignature")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Signature Modal */}
      <Modal
        visible={showSignatureModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowSignatureModal(false)}
      >
        <SafeAreaView style={styles.signatureModal}>
          <View style={styles.signatureHeader}>
            <TouchableOpacity onPress={() => setShowSignatureModal(false)}>
              <Text style={styles.cancelText}>{t("contract.cancel")}</Text>
            </TouchableOpacity>
            <Text style={styles.signatureHeaderTitle}>
              {t("contract.signContract")}
            </Text>
            <TouchableOpacity onPress={handleClearSignature}>
              <Text style={styles.clearText}>{t("contract.clear")}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.signatureCanvasContainer}>
            <SignatureScreen
              ref={signatureRef}
              onOK={handleSignature}
              onEmpty={() =>
                Alert.alert(t("contract.error"), t("contract.provideSignature"))
              }
              descriptionText={t("contract.signAbove")}
              clearText="Clear"
              confirmText="Confirm"
              webStyle={`
                .m-signature-pad { box-shadow: none; border: none; }
                .m-signature-pad--body { border: 2px dashed #007AFF; border-radius: 8px; }
                .m-signature-pad--footer { display: none; }
              `}
            />
          </View>

          <View style={styles.signatureFooter}>
            <TouchableOpacity
              style={styles.confirmSignatureButton}
              onPress={handleConfirmSignature}
            >
              <Text style={styles.confirmSignatureButtonText}>
                {t("contract.confirmSignature")}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
  },
  loadingText: { marginTop: 12, fontSize: 16, color: "#8E8E93" },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
  },
  errorText: { fontSize: 16, color: "#8E8E93" },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  contractTemplate: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Header styles matching web template
  contractHeader: { alignItems: "center", marginBottom: 16 },
  headerSmall: { fontSize: 11, color: "#000", marginBottom: 2 },
  titleSection: { alignItems: "center", marginBottom: 16 },
  titleLarge: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  titleSmall: {
    fontSize: 11,
    fontWeight: "700",
    color: "#000",
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#000",
  },
  introText: { fontSize: 12, marginBottom: 16, color: "#000" },

  // Section styles
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    color: "#000",
  },
  infoText: { fontSize: 11, marginBottom: 4, color: "#000", lineHeight: 16 },
  boldText: { fontWeight: "700" },
  italicText: {
    fontSize: 11,
    fontStyle: "italic",
    marginBottom: 20,
    color: "#000",
  },

  // Article styles
  article: { marginBottom: 20 },
  articleTitle: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    color: "#000",
  },
  articleText: {
    fontSize: 11,
    marginBottom: 8,
    color: "#000",
    textAlign: "justify",
    lineHeight: 18,
  },
  bulletText: {
    fontSize: 11,
    marginLeft: 12,
    marginBottom: 4,
    color: "#000",
    lineHeight: 18,
  },

  // Signature styles matching web template
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#D1D5DB",
  },
  signatureBox: { width: "45%", alignItems: "center" },
  signatureTitle: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
    color: "#000",
  },
  signatureSubtitle: {
    fontSize: 10,
    fontStyle: "italic",
    marginBottom: 16,
    color: "#000",
  },
  signatureArea: {
    minHeight: 100,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  signatureImage: { width: 147, height: 100, objectFit: "fill" },
  placeholderText: { fontSize: 11, color: "#9CA3AF" },
  signerName: { fontSize: 12, fontWeight: "700", color: "#000", marginTop: 8 },

  // Footer buttons
  footer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    gap: 12,
  },
  signButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  signButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  clearButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: { color: "#FF3B30", fontSize: 16, fontWeight: "600" },
  submitButton: {
    flex: 1,
    backgroundColor: "#34C759",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },

  // Modal styles
  signatureModal: { flex: 1, backgroundColor: "#FFFFFF" },
  signatureHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    paddingTop: 50,
  },
  cancelText: { fontSize: 16, color: "#FF3B30" },
  signatureHeaderTitle: { fontSize: 17, fontWeight: "600", color: "#000000" },
  clearText: { fontSize: 16, color: "#007AFF" },
  signatureCanvasContainer: { flex: 1, margin: 16 },
  signatureFooter: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  confirmSignatureButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmSignatureButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
