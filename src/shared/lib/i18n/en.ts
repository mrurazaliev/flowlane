// Английские тексты. Ключи — общие для всех языков: добавили ключ сюда → добавьте и в ru.ts
export const en = {
  // Общее
  "common.language": "Language",
  "theme.dark": "Dark mode",
  "theme.light": "Light mode",
  "theme.toggle": "Switch theme",

  // Экран входа (левая часть)
  "auth.hero.title": "Every task in its lane.",
  "auth.hero.subtitle": "Plan sprints, move work forward and see who is doing what.",
  "auth.lane.todo": "Todo",
  "auth.lane.inProgress": "In progress",
  "auth.lane.done": "Done",

  // Поля
  "field.email": "Email",
  "field.password": "Password",
  "field.emailPlaceholder": "you@company.com",

  // Логин
  "login.title": "Log in",
  "login.subtitle": "Welcome back. Use your work email.",
  "login.submit": "Log in",
  "login.submitting": "Logging in...",
  "login.noAccount": "New here?",
  "login.createAccount": "Create an account",

  // Регистрация
  "register.title": "Create an account",
  "register.subtitle": "Start organizing work with your team.",
  "register.name": "Your name",
  "register.namePlaceholder": "Alex Rivera",
  "register.passwordHint": "At least 8 characters",
  "register.confirmPassword": "Confirm password",
  "register.submit": "Create account",
  "register.submitting": "Creating account...",
  "register.haveAccount": "Already have an account?",
  "register.login": "Log in",

  // Ошибки проверки полей (Zod)
  "validation.email": "Enter a valid email",
  "validation.passwordRequired": "Enter your password",
  "validation.nameRequired": "Enter your name",
  "validation.nameTooLong": "Name is too long",
  "validation.passwordMin": "Password must be at least 8 characters",
  "validation.confirmRequired": "Repeat your password",
  "validation.passwordsMismatch": "Passwords don't match",

  // Поле пароля
  "password.show": "Show password",
  "password.hide": "Hide password",

  // Меню профиля в сайдбаре
  "menu.profile": "Profile",
  "menu.logout": "Log out",
  "menu.loggingOut": "Logging out...",

  // Профиль
  "profile.back": "Back",
  "profile.title": "Profile",
  "profile.description": "Your personal account settings",
  "profile.personalInfo": "Personal info",
  "profile.avatarUrl": "Avatar URL",
  "profile.displayName": "Display name",
  "profile.save": "Save changes",
  "profile.changePassword": "Change password",
  "profile.currentPassword": "Current password",
  "profile.newPassword": "New password",
  "profile.newPasswordHint": "At least 8 characters. You will be logged out on all devices.",
  "profile.updatePassword": "Update password",
  "profile.confirmPassword": "Confirm new password",
  "profile.saving": "Saving...",
  "profile.saved": "Saved",
  "profile.updating": "Updating...",
  "validation.avatarUrl": "Enter a full link, starting with https://",
  "validation.currentPasswordRequired": "Enter your current password",
  "profile.userId": "Your user ID",
  "profile.userIdHint": "Send this ID to a workspace admin so they can add you as a member.",
  "profile.copy": "Copy",
  "profile.copied": "Copied",
  "profile.uploadPhoto": "Upload photo",
  "profile.changePhoto": "Change photo",
  "profile.removePhoto": "Remove",
  "profile.photoHint": "JPG, PNG or WebP, up to 5 MB. It will be cropped to a square.",
  "validation.imageType": "Choose an image file (JPG, PNG or WebP)",
  "validation.imageSize": "The image must be smaller than 5 MB",
  "login.passwordChanged": "Password changed. Log in with your new password.",
} as const;

export type TranslationKey = keyof typeof en;
