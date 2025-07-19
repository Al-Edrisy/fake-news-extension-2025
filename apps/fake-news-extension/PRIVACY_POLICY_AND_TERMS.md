# VeriNews Privacy Policy and Terms of Service

**Effective Date:** January 1, 2025  
**Last Updated:** January 1, 2025  
**Version:** 1.0.0

---

## 1. INTRODUCTION

Welcome to VeriNews ("we," "our," or "us"). This Privacy Policy and Terms of Service document governs your use of the VeriNews browser extension and related services. VeriNews is an AI-powered news verification and fact-checking tool designed to help users identify misinformation and verify news claims.

By installing, accessing, or using the VeriNews extension, you agree to be bound by these terms and our privacy practices as described herein.

---

## 2. PRIVACY POLICY

### 2.1 Information We Collect

#### 2.1.1 Information You Provide
- **Text Selections**: When you select text on web pages for verification, we collect the selected text content to analyze it for fact-checking purposes.
- **User Settings**: We store your extension preferences including theme settings, notification preferences, and other customization options.
- **Admin Credentials**: For admin dashboard access, we temporarily store login credentials in local storage.

#### 2.1.2 Information Automatically Collected
- **Page Information**: We collect basic page information (title, URL) when you use the extension to provide context for verification requests.
- **Extension Usage Data**: We collect usage statistics including verification requests, feature usage, and performance metrics.
- **Technical Information**: Browser type, extension version, and system information for compatibility and debugging purposes.

#### 2.1.3 Information from Third Parties
- **News Sources**: We access and analyze content from various news sources and fact-checking websites to verify claims.
- **AI Analysis Results**: We receive analysis results from our AI backend service for claim verification.

### 2.2 How We Use Your Information

#### 2.2.1 Core Functionality
- **Fact-Checking**: To analyze and verify news claims you select
- **Source Analysis**: To provide credibility assessments of news sources
- **User Experience**: To personalize your extension experience and improve functionality

#### 2.2.2 Service Improvement
- **Performance Optimization**: To improve extension performance and reliability
- **Feature Development**: To develop new features and enhance existing ones
- **Bug Fixes**: To identify and resolve technical issues

#### 2.2.3 Analytics and Research
- **Usage Analytics**: To understand how users interact with the extension
- **Research**: To improve our fact-checking algorithms and accuracy

### 2.3 Information Sharing and Disclosure

#### 2.3.1 We Do Not Sell Your Data
We do not sell, rent, or trade your personal information to third parties for marketing purposes.

#### 2.3.2 Limited Sharing
We may share information in the following limited circumstances:
- **Service Providers**: With trusted third-party service providers who assist in operating our service
- **Legal Requirements**: When required by law or to protect our rights and safety
- **Business Transfers**: In connection with a merger, acquisition, or sale of assets

#### 2.3.3 Aggregated Data
We may share aggregated, anonymized data for research and statistical purposes.

### 2.4 Data Security

#### 2.4.1 Security Measures
We implement appropriate technical and organizational measures to protect your information:
- **Encryption**: Data transmission is encrypted using HTTPS
- **Access Controls**: Limited access to personal information on a need-to-know basis
- **Regular Updates**: Security updates and vulnerability assessments

#### 2.4.2 Data Retention
- **User Settings**: Stored locally in your browser until you uninstall the extension
- **Verification Data**: Processed temporarily and not permanently stored
- **Analytics Data**: Retained for up to 2 years for service improvement

### 2.5 Your Privacy Rights

#### 2.5.1 Access and Control
You have the right to:
- Access your personal information
- Correct inaccurate information
- Delete your data
- Opt-out of certain data collection

#### 2.5.2 Browser Storage
You can clear extension data through your browser's extension management settings.

---

## 3. TERMS OF SERVICE

### 3.1 Acceptance of Terms

By installing and using the VeriNews extension, you agree to these Terms of Service. If you do not agree, do not install or use the extension.

### 3.2 Description of Service

VeriNews provides:
- **Real-time Fact-Checking**: AI-powered analysis of news claims
- **Source Credibility Assessment**: Evaluation of news source reliability
- **Browser Integration**: Seamless integration with your browsing experience
- **Admin Dashboard**: Data management and analytics (for authorized users)

### 3.3 User Responsibilities

#### 3.3.1 Acceptable Use
You agree to use the extension only for lawful purposes and in accordance with these terms. You must not:
- Use the service for illegal activities
- Attempt to circumvent security measures
- Interfere with the service's operation
- Use automated tools to access the service excessively

#### 3.3.2 Content Responsibility
- You are responsible for the content you select for verification
- We do not endorse or verify the accuracy of user-selected content
- Verification results are for informational purposes only

### 3.4 Intellectual Property

#### 3.4.1 Our Rights
- **Extension Code**: All rights reserved by SALIH OTMAN, Al-Edrisy, 2025
- **AI Models**: Proprietary fact-checking algorithms and models
- **User Interface**: Design and layout are protected by copyright

#### 3.4.2 Your Rights
- **Personal Use**: You may use the extension for personal, non-commercial purposes
- **Fair Use**: Limited use for research and educational purposes

### 3.5 Disclaimers and Limitations

#### 3.5.1 Service Availability
- We strive for high availability but do not guarantee uninterrupted service
- The service may be temporarily unavailable for maintenance or updates
- We are not responsible for third-party service interruptions

#### 3.5.2 Accuracy Disclaimer
- Verification results are based on available information and AI analysis
- Results should not be considered as definitive truth
- Users should exercise critical thinking and verify information from multiple sources
- We are not liable for decisions made based on verification results

#### 3.5.3 Limitation of Liability
To the maximum extent permitted by law, VeriNews shall not be liable for:
- Indirect, incidental, or consequential damages
- Loss of data or profits
- Service interruptions or failures
- Third-party content or actions

### 3.6 Termination

#### 3.6.1 Your Rights
You may uninstall the extension at any time.

#### 3.6.2 Our Rights
We may terminate or suspend access to the service:
- For violations of these terms
- For security or legal reasons
- With reasonable notice for service changes

### 3.7 Changes to Terms

We may update these terms from time to time. Continued use of the service constitutes acceptance of updated terms.

---

## 4. TECHNICAL SPECIFICATIONS

### 4.1 Extension Permissions

The VeriNews extension requests the following permissions:

#### 4.1.1 Required Permissions
- **activeTab**: To access the currently active tab for text selection when user interacts with the extension
- **storage**: To save user preferences and settings
- **contextMenus**: To provide right-click context menu options
- **notifications**: To display verification results and alerts
- **scripting**: To inject content scripts dynamically when needed

#### 4.1.2 Host Permissions
- **http://localhost:5000/***: To connect to the backend API for verification (development)
- **http://13.60.241.86:5000/***: To connect to the production backend API for verification

### 4.2 Data Processing

#### 4.2.1 Local Processing
- Text selection and UI interactions (after user clicks extension icon)
- Theme detection and customization
- Extension settings and preferences
- Dynamic content script injection (only when user clicks extension icon or uses context menu)

#### 4.2.2 Remote Processing
- Claim verification through AI backend
- Source credibility analysis
- News source content scraping

### 4.3 API Endpoints

The extension communicates with the following API endpoints:
- `/api/claims/verify`: For claim verification
- `/api/analysis/analyze`: For article analysis
- `/public/claims`: For accessing verified claims
- `/public/sources`: For source information
- `/public/analyses`: For analysis results
- `/health`: For service health checks

---

## 5. CONTACT INFORMATION

### 5.1 Privacy and Support
For privacy concerns, support requests, or questions about these terms:

- **Email**: [Contact email to be provided]
- **GitHub**: https://github.com/Al-Edrisy/fake-news-extension-2025
- **Documentation**: Available in the extension's documentation section

### 5.2 Data Protection Officer
For GDPR-related inquiries or data protection matters, please contact our designated data protection officer.

---

## 6. LEGAL COMPLIANCE

### 6.1 GDPR Compliance
If you are in the European Union, you have additional rights under the General Data Protection Regulation (GDPR):
- Right to data portability
- Right to erasure ("right to be forgotten")
- Right to restrict processing
- Right to object to processing

### 6.2 CCPA Compliance
California residents have rights under the California Consumer Privacy Act (CCPA):
- Right to know what personal information is collected
- Right to delete personal information
- Right to opt-out of the sale of personal information

### 6.3 COPPA Compliance
We do not knowingly collect personal information from children under 13. If you are under 13, please do not use this extension.

---

## 7. UPDATES AND CHANGES

### 7.1 Policy Updates
This policy may be updated periodically. We will notify users of significant changes through:
- Extension update notifications
- In-app notifications
- Email notifications (if provided)

### 7.2 Version History
- **Version 1.0.0** (January 1, 2025): Initial privacy policy and terms of service

---

**© 2025 SALIH OTMAN, Al-Edrisy. All Rights Reserved.**

*This document is legally binding and constitutes the complete agreement between you and VeriNews regarding the use of the extension and related services.* 