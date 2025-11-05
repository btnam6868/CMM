export const translations = {
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.rememberMe': 'Remember me',
    'auth.loginSubtitle': 'Sign in to your account',
    'auth.registerSubtitle': 'Create your account',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.loginSuccess': 'Login successful!',
    'auth.loginError': 'Login failed',
    'auth.registerSuccess': 'Registration successful! Please login.',
    'auth.registerError': 'Registration failed',
    'auth.passwordMismatch': 'Passwords do not match',
    'auth.passwordTooShort': 'Password must be at least 6 characters',
    
    // Home
    'home.title': 'Content Multiplier Management',
    'home.subtitle': 'AI-powered content generation system',
    'home.getStarted': 'Get Started',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.users': 'User Management',
    'dashboard.content': 'Content Management',
    'dashboard.apiKeys': 'API Management',
    'dashboard.totalIdeas': 'Total Ideas',
    'dashboard.totalContents': 'Total Contents',
    'dashboard.activeApiKeys': 'Active API Keys',
    'dashboard.totalApiCalls': 'Total API Calls',
    'dashboard.welcome': 'Welcome back',
    
    // Ideas
    'ideas.title': 'Ideas',
    'ideas.create': 'Create Idea',
    'ideas.edit': 'Edit Idea',
    'ideas.delete': 'Delete Idea',
    'ideas.ideaTitle': 'Idea Title',
    'ideas.description': 'Description',
    'ideas.status': 'Status',
    
    // API Keys
    'apiKeys.title': 'API Keys',
    'apiKeys.add': 'Add API Key',
    'apiKeys.provider': 'Provider',
    'apiKeys.keyName': 'Key Name',
    'apiKeys.apiKey': 'API Key',
    'apiKeys.usageCount': 'Usage Count',
    'apiKeys.lastUsed': 'Last Used',
    
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.profile': 'Profile',
    'settings.notifications': 'Notifications',
  },
  vi: {
    // Common
    'common.loading': 'Đang tải...',
    'common.save': 'Lưu',
    'common.cancel': 'Hủy',
    'common.delete': 'Xóa',
    'common.edit': 'Sửa',
    'common.create': 'Tạo mới',
    'common.search': 'Tìm kiếm',
    'common.filter': 'Lọc',
    'common.export': 'Xuất',
    'common.import': 'Nhập',
    
    // Auth
    'auth.login': 'Đăng nhập',
    'auth.register': 'Đăng ký',
    'auth.logout': 'Đăng xuất',
    'auth.email': 'Email',
    'auth.password': 'Mật khẩu',
    'auth.confirmPassword': 'Xác nhận mật khẩu',
    'auth.forgotPassword': 'Quên mật khẩu?',
    'auth.rememberMe': 'Ghi nhớ đăng nhập',
    'auth.loginSubtitle': 'Đăng nhập vào tài khoản của bạn',
    'auth.registerSubtitle': 'Tạo tài khoản mới',
    'auth.noAccount': 'Chưa có tài khoản?',
    'auth.hasAccount': 'Đã có tài khoản?',
    'auth.loginSuccess': 'Đăng nhập thành công!',
    'auth.loginError': 'Đăng nhập thất bại',
    'auth.registerSuccess': 'Đăng ký thành công! Vui lòng đăng nhập.',
    'auth.registerError': 'Đăng ký thất bại',
    'auth.passwordMismatch': 'Mật khẩu không khớp',
    'auth.passwordTooShort': 'Mật khẩu phải có ít nhất 6 ký tự',
    
    // Home
    'home.title': 'Quản lý Content Multiplier',
    'home.subtitle': 'Hệ thống tạo nội dung bằng AI',
    'home.getStarted': 'Bắt đầu',
    
    // Dashboard
    'dashboard.title': 'Tổng quan',
    'dashboard.users': 'Quản lý người dùng',
    'dashboard.content': 'Quản lý nội dung',
    'dashboard.apiKeys': 'Quản lý API',
    'dashboard.totalIdeas': 'Tổng số ý tưởng',
    'dashboard.totalContents': 'Tổng số nội dung',
    'dashboard.activeApiKeys': 'API Keys đang hoạt động',
    'dashboard.totalApiCalls': 'Tổng số lượt gọi API',
    'dashboard.welcome': 'Chào mừng trở lại',
    
    // Ideas
    'ideas.title': 'Ý tưởng',
    'ideas.create': 'Tạo ý tưởng',
    'ideas.edit': 'Sửa ý tưởng',
    'ideas.delete': 'Xóa ý tưởng',
    'ideas.ideaTitle': 'Tiêu đề ý tưởng',
    'ideas.description': 'Mô tả',
    'ideas.status': 'Trạng thái',
    
    // API Keys
    'apiKeys.title': 'Khóa API',
    'apiKeys.add': 'Thêm khóa API',
    'apiKeys.provider': 'Nhà cung cấp',
    'apiKeys.keyName': 'Tên khóa',
    'apiKeys.apiKey': 'Khóa API',
    'apiKeys.usageCount': 'Số lần sử dụng',
    'apiKeys.lastUsed': 'Lần dùng cuối',
    
    // Settings
    'settings.title': 'Cài đặt',
    'settings.language': 'Ngôn ngữ',
    'settings.theme': 'Giao diện',
    'settings.profile': 'Hồ sơ',
    'settings.notifications': 'Thông báo',
  },
};

export type Language = 'en' | 'vi';
export type TranslationKey = keyof typeof translations.en;
